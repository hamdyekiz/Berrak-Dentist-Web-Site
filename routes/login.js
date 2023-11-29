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

    let can_take_entry = await wrong_entry_num(email);

    console.log("Wrong entry sayısı: ", can_take_entry)

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

    else{
        
    }
});












module.exports = router;

