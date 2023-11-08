import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer"
import dotenv from 'dotenv';

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;


dotenv.config();


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// Routes
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


let verificationCode;
let name, surname, telNo, email, availableHours;

app.post('/submit', (req, res) => {
    // Access form inputs using req.body
    //const formData = req.body;
    ({name, surname, telNo, email, availableHours} = req.body);
  
    // alınan veriler doğru mu diye kontrol etme
    console.log("name: " + name)
    console.log("surname: " + surname)
    console.log("telNo: " + telNo)
    console.log("email: " + email)
    console.log("availableHours: " + availableHours)

    // check if the email is a valid email
    if(!isEmailValid(email)) {
      console.log("email is not valid!");

      res.render("index.ejs", {error: "error"}) // this index.ejs is a dynamic page 
      //because it alerts the user about the email adress dynamically.
      //if the mail is not valid it alerts else it works normally.
      // {error: "error"} is just for placeholder to figure out if there is an error.
      // it's value is not used in index.ejs file.

      return; //finish the callback function.
    }

    // Send a response or redirect to another page
    res.render("submit.ejs", { name: name, surname: surname, telNo: telNo, email: email, availableHours: availableHours })

    // Hastanın mailine onay kodu yollanır.
    sendVerificationCode(name, surname, email);


});


//e mail'e gönderilen kod verify edilecek.
app.post('/verify', (req, res) => {
  let isCodeCorrect = false;
  console.log(req.body);
  let {authCode} = req.body;
  console.log("girilen code: " + authCode);
  if(verificationCode == authCode){
    isCodeCorrect = true;
    console.log("True code");
    sendEmail(name, surname, telNo, email, availableHours);
  }
  else{
    console.log("Wrong code");
  }
  res.render("submit.ejs", {isCodeCorrect: isCodeCorrect});

});



function sendVerificationCode(name, surname, email){

 
  // onay kodu 10000 ile 99999 arasında 5 basamaklı bir sayı  
  const min = 10000; // Smallest 5-digit number
  const max = 99999; // Largest 5-digit number
  verificationCode = Math.floor(Math.random() * (max - min + 1) + min).toString();  
  
  const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',  // Outlook SMTP server
      port: 587,                  // Port for TLS
      secure: false,              // true for 465, false for other ports
      auth: {
          user: process.env.EMAIL_USER,     // Access email from environment variable
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
      from: process.env.EMAIL_USER,   // Access sender email
      to: email,     // Access recipient email
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





function sendEmail(name, surname, telNo, email, availableHours){

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',  // Outlook SMTP server
        port: 587,                  // Port for TLS
        secure: false,              // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,     // Access email from environment variable
            pass: process.env.EMAIL_PASSWORD
        }
      });
      // Burada kayıtlı eposta hesabı ve şifresinin admin'den sitede alınıp database'e güvenli bir şekilde kaydedilmesi gerekiyor. 

      const mailOptions = {
        from: process.env.EMAIL_USER,   // Access sender email
        to: process.env.EMAIL_USER,     // Access recipient email
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
  //check if the email is valid
  let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  let isTempMail = false;
  // if email doesn't have popular domains, it is a temporary mail
  let popularDomains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "yandex.com", "protonmail.com", "edu.tr"];
  
  let domain = email.split("@")[1]; // get the domain part of the email
  
  if(!popularDomains.includes(domain)){ // if the domain is not in the popular domains, it is a temporary mail
    isTempMail = true;
  }

  return emailRegex.test(email) && !isTempMail; // if the email is valid and not a temporary mail, return true
}

