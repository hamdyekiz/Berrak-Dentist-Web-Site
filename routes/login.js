const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const path = require("path");
const { URL } = require("url");
const dirName = path.dirname(require.main.filename);

//Form'un verilerini okumak için bu 3 satıra ihtiyaç var. req.body yapabilmek için gerekli. 
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());  
router.use(express.static(dirName + '/public'));

//mail gönderebilmek için
const nodemailer = require("nodemailer");

//.env dosyasından veri alabilmek için
const dotenv = require("dotenv");
dotenv.config();


// Import the MongoDB driver for Node.js
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
// Connection URL
const url = 'mongodb://localhost:27017';


// Parametre olarak girilen email ve şifreye ait kullanıcı database'de var mı diye kontrol ediyor
async function checkLogin(email, password) {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    
    let dbName = "clinicDB";

    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db(dbName);
      const collection = db.collection('personellists');
  
      // Use findOne to find a document that matches both email and password
      const user = await collection.findOne({ email: email, password: password });

    if(!user){     
        //eğer email şifre ikilisi bulunamadı ise buraya girer
        //Burada parametredeki email'i taşıyan data var mı diye kontrol edilir. Varsa şifre yanlış girilmiş demektir 
        const is_there_email = await collection.findOne({ email: email});
        
        //eğer email varsa yani şifre yanlış girilmişse lockout mekanizması çalıştırılır. 
        if(is_there_email){
            increment_wrong_entry_num(is_there_email.email);
        }
    }
  
      return user;
    } finally {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
}


//Şifre yanlış girilmiş ise çağrılır. 
async function increment_wrong_entry_num(email) {
    console.log("Hatalı şifre girildi gereken işlemler yapılacak")
    //const url = 'mongodb://localhost:27017';
    const dbName = 'clinicDB'; // Replace with your actual database name
    const collectionName = 'lockoutedPersons';
  
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db(dbName);
      const collection = db.collection(collectionName);
  
      // Check if the collection exists, create it if not
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        await db.createCollection(collectionName);
      }
  
      // Check if there is a document with the given email
      const existingDoc = await collection.findOne({ email: email });
  
      if (!existingDoc) {
        // If no document found, create a new one with wrong_entry = 1
        await collection.insertOne({ email: email, wrong_entry: 1 });
      } else {
        // If a document with the email exists, increment wrong_entry if it's less than 5
        if (existingDoc.wrong_entry < 5) {
          await collection.updateOne({ email: email }, { $inc: { wrong_entry: 1 } });
        }
      }
    } finally {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
}

//lockoutedPersons databaseinde belirtilen emaili arar. Eğer şifre girme izni varsa 1 döndürür. Yoksa 0 döndürür.
async function wrong_entry_num(email){

    const dbName = 'clinicDB'; 
    const collectionName = 'lockoutedPersons';
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    let returnVal = 0;

    try {
        await client.connect();
        console.log('Connected to MongoDB');
    
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
    
        // Check if the collection exists, return 1 it if not
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
            returnVal = 1;
        }
    
        // Check if there is a document with the given email
        const existingDoc = await collection.findOne({ email: email });
    
        if (!existingDoc) {
          // If no document found, return 1
          returnVal = 1;
        } else {
          // If a document with the email exists, increment wrong_entry if it's less than 5
            if (existingDoc.wrong_entry < 5) {
                returnVal = 1;
            }
        }
      } finally {
        await client.close();
        
        console.log('Disconnected from MongoDB in wrong_entry_num');
        //console.log("Return değeri: ", returnVal)
      }
      return returnVal;
}
  
  // login'de eposta ve şifre alınacak. Farklı kullanıcı tipleri için farklı girişler mi olacak.
  // Yoksa hepsi aynı girişten mi girecek. 
  //Hepsi aynı girişten giriyor diye kabul ediyorum.
  // /login/general_login'e post etmek gerek.
router.post("/general_login", async (req, res) => {

    let email = req.body.email;
    let password = req.body.password;
    console.log("Damn body");

    //Şifrenin kaç kere yanlış girildiği bilgisi alınır. 
    let can_take_entry = await wrong_entry_num(email);

    console.log("Wrong entry sayısı: ", can_take_entry)

    //Eğer aynı emaile 5 kere yanlış şifre girilmemişse tekrardan aynı emaille şifre deneme hakkı verilir.
    if(can_take_entry == 1){
  
        try {
        // Check if user exists in the database
        const user = await checkLogin(email, password);
        console.log(`user: ${user}`);

    
        if (user) {
            console.log('User found:', user);
            res.status(200).json({ message: 'User found' });
        } else {
            console.log('Wrong email or password');
            res.status(401).json({ message: 'Wrong email or password' });
        }
        } catch (error) {
        console.error('Error checking login:', error);
        res.status(500).json({ message: 'Internal server error' });
        }

    }

    //şifre 5 kere yanlış girilmişse tekrardan şifre yazmasına izin verilmez. Maile doğrulama kodu gönderilir. 
    else{
      sendVerificationCode_forLockout(email);
    }
});





let verificationCode_forLockout;
// Email to be removed
//İlla kaldırılacak diye bir şey yok. Eğer doğrulama kodu doğru girildiyse buna atanan mail lockoutedPersons'dan kaldırılır.
let email_to_be_removed_from_lockouted; 

function sendVerificationCode_forLockout(email) {
    // onay kodu 10000 ile 99999 arasında 5 basamaklı bir sayı
    const min = 10000; // Smallest 5-digit number
    const max = 99999; // Largest 5-digit number
    verificationCode_forLockout = Math.floor(Math.random() * (max - min + 1) + min).toString();

    email_to_be_removed_from_lockouted = email;

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
    <p>Değerli personelimiz,</p>
    <p>Berrak diş hekimliği sistemine giriş şifrenizi 5 kere yanlış girdiniz. Tekrar şifre yazabilmek için aşağıdaki doğrulama kodunu giriniz:</p>
    <p style="font-size: 30px; font-weight: bold;">${verificationCode_forLockout}</p>
    <p> Bu kodu siz istemediyseniz lütfen yetkili birine danışınız. Birisi hesabınıza erişmeye çalışıyor olabilir.
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




//e mail'e gönderilen kod verify edilecek.
router.post('/verify_lockout_code', (req, res) => {
  let isCodeCorrect = false;
  console.log(req.body);
  let { authCode } = req.body;
  console.log("girilen code: " + authCode);

  //kod doğru girilmişse o mail adresindeki blokaj kaldırılacak. Yani o mail, lockoutedPersons collection'undan silinecek. Bu sayede o mail adresi ile yeni şifre denemeleri yapılabilecek.
  if (verificationCode_forLockout == authCode) {
      isCodeCorrect = true;
      console.log("True code");
      //sendEmail(name, surname, telNo, email, availableHours);

      removeDocumentsByEmail();

  } else {
      console.log("Wrong code");
  }
  //res.render("submit.ejs", { isCodeCorrect: isCodeCorrect });
});


// Function to remove documents based on email
async function removeDocumentsByEmail() {

  const dbName = 'clinicDB';
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection('lockoutedPersons');

    // Delete documents where email is equal to the specified value
    const result = await collection.deleteMany({ email: email_to_be_removed_from_lockouted });

    console.log(`Removed ${result.deletedCount} documents with email ${email_to_be_removed_from_lockouted}`);
  } catch (error) {
    console.error('Error removing documents:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB in removeDocumentsByEmail');
  }
}





module.exports = router;

