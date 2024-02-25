const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

const { MongoClient } = require('mongodb');


const path = require("path");
const { URL } = require("url");

const dirName = path.dirname(require.main.filename);


//const app = express();
const port = 3000;

dotenv.config();

// Middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.static(dirName + '/public'));

// Routes
router.get("/", (req, res) => {
    res.sendFile(dirName + "/public/index.html");
});


let verificationCode;
// let name, surname, telNo, email, availableHours;
let name, telNo, email, availableHours, doctor, complaint;


router.post('/submit', (req, res) => {
    // Access form inputs using req.body
    ({ name, telNo, email, availableHours, doctor, complaint } = req.body);

    // alınan veriler doğru mu diye kontrol etme
    console.log("name: " + name);
    console.log("telNo: " + telNo);
    console.log("email: " + email);
    console.log("availableHours: " + availableHours);
    console.log("doctor: " + doctor);
    console.log("complaint: " + complaint);


    // check if the email is a valid email
    if (!isEmailValid(email)) {
        console.log("email is not valid!");
        // i need to send an error message to the user but at the same time redirect to the same page
        res.redirect("/randevu/randevu_main/randevu_email.html");
        return;
    }

    // Send a response or redirect to another page
    // res.render("submit.ejs", { name: name, surname: surname, telNo: telNo, email: email, availableHours: availableHours });
    // res.sendFile(dirName + "/public/randevu/verification/index.html");
    res.render("verification/index.ejs");
    // Hastanın mailine onay kodu yollanır.
    sendVerificationCode(name, email);
});

//e mail'e gönderilen kod verify edilecek.
router.post('/verify', async (req, res) => {
    let isCodeCorrect = false;
    console.log(req.body);
    let { authCode } = req.body;
    console.log("girilen code: " + authCode);
    if (verificationCode == authCode) {
        isCodeCorrect = true;
        console.log("True code");
        sendEmail(name, telNo, email, availableHours);
        await sendInfoToAdminPanel(name, telNo, email, availableHours, doctor, complaint);
    } else {
        console.log("Wrong code");
    }
    res.render("verification/index.ejs", { isCodeCorrect: isCodeCorrect });
});


function sendVerificationCode(name, email) {
    // onay kodu 10000 ile 99999 arasında 5 basamaklı bir sayı
    const min = 10000; // Smallest 5-digit number
    const max = 99999; // Largest 5-digit number
    verificationCode = Math.floor(Math.random() * (max - min + 1) + min).toString();

    const transporter = nodemailer.createTransport({
        host: 'smtp.eu.mailgun.org',
        port: 587,
        secure: false, //ssl
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const emailContent = `
    <p>Sayın ${name},</p>
    <p>Berrak diş hekimliğinden almak istediğiniz randevu için onay kodunuz:</p>
    <p style="font-size: 30px; font-weight: bold;">${verificationCode}</p>
    <p> Bu kodu siz istemediyseniz bu e-postayı görmezden gelmenizde bir sakınca yoktur. Başka bir kullanıcı yanlışlıkla sizin e-posta adresinizi girmiş olabilir.
    </p>
    <p> Teşekkür ederiz.</p>`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Doğrulama Kodu',
        html: emailContent
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email could not be sent:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

function sendEmail(name, telNo, email, availableHours) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.eu.mailgun.org',
        port: 587,
        secure: false, //ssl
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    console.log(process.env.EMAIL_USER + " " + process.env.EMAIL_PASSWORD);
    console.log(process.env.EMAIL_USER + " " + process.env.EMAIL_PASSWORD);
    console.log(process.env.EMAIL_USER + " " + process.env.EMAIL_PASSWORD);
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "berrakdisclinic@outlook.com",
        subject: 'Yeni Randevu Talebi',
        text: `Aşağıdaki bilgilere sahip hasta randevu talebinde bulunmuştur:
        \nAd Soyad: ${name}
        \nTelefon: ${telNo}
        \nE-posta: ${email}
        \nAranmasını istediği saatler: ${availableHours}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email could not be sent:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

function isEmailValid(email) {
    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\.?[a-zA-Z]*$/;
    let isTempMail = false;
    let popularDomains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "yandex.com", "protonmail.com"];

    let domain = email.split("@")[1];
    if (!popularDomains.includes(domain)) {
        isTempMail = true;
    }
    console.log("isTempMail: " + isTempMail);

    return emailRegex.test(email) && !isTempMail;
}





async function sendInfoToAdminPanel(name, telNo, email, availableHours, doctor, complaint) {
    const uri = process.env.URL + "clinicDB";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to the database');

        const database = client.db('clinicDB');
        const collectionName = 'appointmentrequests';

        // Check if the collection already exists
        const collections = await database.listCollections({ name: collectionName }).toArray();

        if (collections.length === 0) {
            // Collection does not exist, create it
            await database.createCollection(collectionName);
            console.log(`Collection '${collectionName}' created`);
        }

        // Insert document into the collection
        const collection = database.collection(collectionName);
        const result = await collection.insertOne({
            name: name,
            telNo: telNo,
            email: email,
            availableHours: availableHours,
            doctor: doctor,
            complaint: complaint
        });

        console.log('Appointment request saved successfully:', result);
    } catch (error) {
        console.error('Error saving appointment request:', error);
    } finally {
        // Close the MongoDB connection
        await client.close();
    }
}





module.exports = router;