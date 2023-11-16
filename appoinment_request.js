const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

const path = require("path");
const { URL } = require("url");

const dirName = path.dirname(require.main.filename);
const app = express();
const port = 3000;

dotenv.config();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(dirName + '/public'));

// Routes
app.get("/", (req, res) => {
    res.sendFile(dirName + "/public/index.html");
});

// Start server
let server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

let verificationCode;
let name, surname, telNo, email, availableHours;


app.post('/submit', (req, res) => {
    // Access form inputs using req.body
    ({ name, surname, telNo, email, availableHours } = req.body);

    // alınan veriler doğru mu diye kontrol etme
    console.log("name: " + name);
    console.log("surname: " + surname);
    console.log("telNo: " + telNo);
    console.log("email: " + email);
    console.log("availableHours: " + availableHours);

    // check if the email is a valid email
    if (!isEmailValid(email)) {
        console.log("email is not valid!");

        res.render("index.ejs", { error: "error" });
        return;
    }

    // Send a response or redirect to another page
    res.render("submit.ejs", { name: name, surname: surname, telNo: telNo, email: email, availableHours: availableHours });

    // Hastanın mailine onay kodu yollanır.
    sendVerificationCode(name, surname, email);
    res.status(200);
});

//e mail'e gönderilen kod verify edilecek.
app.post('/verify', (req, res) => {
    let isCodeCorrect = false;
    console.log(req.body);
    let { authCode } = req.body;
    console.log("girilen code: " + authCode);
    if (verificationCode == authCode) {
        isCodeCorrect = true;
        console.log("True code");
        sendEmail(name, surname, telNo, email, availableHours);
    } else {
        console.log("Wrong code");
    }
    res.render("submit.ejs", { isCodeCorrect: isCodeCorrect });
});


function sendVerificationCode(name, surname, email) {
    // onay kodu 10000 ile 99999 arasında 5 basamaklı bir sayı
    const min = 10000; // Smallest 5-digit number
    const max = 99999; // Largest 5-digit number
    verificationCode = Math.floor(Math.random() * (max - min + 1) + min).toString();

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const emailContent = `
    <p>Sayın ${name} ${surname},</p>
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

function sendEmail(name, surname, telNo, email, availableHours) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'Yeni Randevu Talebi',
        text: `Aşağıdaki bilgilere sahip hasta randevu talebinde bulunmuştur:
        \nAd: ${name}
        \nSoyad: ${surname}
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
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let isTempMail = false;
    let popularDomains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "yandex.com", "protonmail.com", "edu.tr"];

    let domain = email.split("@")[1];
    if (!popularDomains.includes(domain)) {
        isTempMail = true;
    }

    return emailRegex.test(email) && !isTempMail;
}

//bunu neden koyduk? unit test'e fonksiyonu aktarabilelim diye
module.exports = {
  sendVerificationCode, 
  isEmailValid,
  sendEmail,
  server, 
  app
};

//module.exports = { server} ;