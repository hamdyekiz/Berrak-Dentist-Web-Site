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
  
      return user;
    } finally {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
  
  // login'de eposta ve şifre alınacak. Farklı kullanıcı tipleri için farklı girişler mi olacak.
  // Yoksa hepsi aynı girişten mi girecek. 
  //Hepsi aynı girişten giriyor diye kabul ediyorum.
  // /login/general_login'e post etmek gerek.
router.post("/general_login", async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    console.log("Damn body");
  
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
});












module.exports = router;

