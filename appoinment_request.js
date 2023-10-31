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

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


app.post('/submit', (req, res) => {
    // Access form inputs using req.body
    //const formData = req.body;
    const {name, surname, telNo, email, availableHours} = req.body;
  
    // alınan veriler doğru mu diye kontrol etme
    console.log("name: " + name)
    console.log("surname: " + surname)
    console.log("telNo: " + telNo)
    console.log("email: " + email)
    console.log("availableHours: " + availableHours)
  
    // Send a response or redirect to another page
    res.send('Form submitted successfully');

    // Alınan verilerle e posta gönderme
    sendEmail(name, surname, telNo, email, availableHours);




});


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




