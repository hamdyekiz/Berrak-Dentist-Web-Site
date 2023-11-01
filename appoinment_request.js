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
  
    // Send a response or redirect to another page
    res.render("submit.ejs", { name: name, surname: surname, telNo: telNo, email: email, availableHours: availableHours })

    sendVerificationCode(name, surname, email);


    // Alınan verilerle e posta gönderme
    //sendEmail(name, surname, telNo, email, availableHours);


});


//e mail'e gönderilen kod verify edilecek.
app.post('/verify', (req, res) => {

  let {enteredCode} = req.body;
  console.log("girilen code: " + enteredCode);
  if(verificationCode == enteredCode){
    console.log("True code");
    sendEmail(name, surname, telNo, email, availableHours);
  }
  else{
    console.log("Wrong code");
  }

});



function sendVerificationCode(name, surname, email){


  // let randomNumber = Math.floor(Math.random() * 100000);

  // verificationCode = randomNumber.toString().padStart(5, '0');  
  
  const min = 10000; // Smallest 5-digit number
  const max = 99999; // Largest 5-digit number
  const verificationCode = Math.floor(Math.random() * (max - min + 1) + min).toString();  
  
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
    <p>Berrak diş hekimliğinden aldığınız randevusu için onay kodunuz:</p>
    <p style="font-size: 30px; font-weight: bold;">${verificationCode}</p>
  `;

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
   
   //return verificationCode;
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


//// aaaaa////

