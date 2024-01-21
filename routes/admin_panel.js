const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo');


const path = require("path");
const { URL } = require("url");
const dirName = path.dirname(require.main.filename);

//Form'un verilerini okumak için bu 3 satıra ihtiyaç var. req.body yapabilmek için gerekli. 
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.static(dirName + '/public'));
router.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: MongoStore.create({
    mongoUrl: `${process.env.URL}clinicDB` 
   })
}));



//Mongodb'ye bağlanmak için url:
// const url = 'mongodb://127.0.0.1:27017';
const url = process.env.URL;

router.get("/", (req, res) => {
    // if a user who logged in successfully.
    if(req.session.user && req.session.isAuthenticated) {

      // if the user is Admin
      if(req.session.user.title == "Admin"){
        res.redirect("/admin_panel/doktorlar");
      }
      // if the user is Doctor
      else if(req.session.user.title == "Doctor"){
        res.redirect("/admin_panel/gelecek_randevular");
      }
      // if the user is Assistant
      else if(req.session.user.title == "Assistant"){
        res.redirect("/admin_panel/gelecek_randevular");
      }
    }

    // if a user who didn't log in.
    else{
      res.redirect("/login");
    }
});


// admin paneldeki sayfalara erişmek için get methodları.
router.get("/doktorlar/", (req, res) => {
    console.log("session: " + req.session.user);
    if(req.session.user && req.session.isAuthenticated && req.session.user.title == "Admin"){
      res.render("admin_panel/doctors.ejs", {adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else{
      res.redirect("/login");
    }
});

router.get("/asistanlar/", (req, res) => {
  console.log("session: " + req.session.user);
  if(req.session.user && req.session.isAuthenticated && req.session.user.title == "Admin"){
    res.render("admin_panel/assistants.ejs", {adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
  }
  else{
    res.redirect("/login");
  }
});

router.get("/gelecek_randevular/", (req,res) => {
  console.log("session: " + req.session.user);
  // for admin and assistant show all the appointments in the database
  // for doctor show only his/her appointments

  // if a user who logged in successfully.
  if(req.session.user && req.session.isAuthenticated){

    // if admin show all the appointments in the database
    if(req.session.user.title == "Admin") {
      res.render("admin_panel/randevular.ejs", {adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant"){
      res.render("admin_panel_assistant/randevular.ejs", {assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }

    // !!!! Show only their appointments
    else if(req.session.user.title == "Doctor"){
      res.render("admin_panel_doctor/randevular.ejs", {doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
  }

  else{
    res.redirect("/login");
  }
});

router.get("/hastalar/", (req, res) => {
  // for admin and assistant show all the patients in the database
  // for doctor show only his/her patients
  console.log("session: " + req.session.user);

  if(req.session.user && req.session.isAuthenticated) {
      
      // if admin show all the patients in the database
      if(req.session.user.title == "Admin") {
        res.render("admin_panel/hastalar.ejs", {adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
      }
      else if(req.session.user.title == "Assistant"){
        res.render("admin_panel_assistant/hastalar.ejs", {assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
      }
  
      // !!!! Show only their patients
      else if(req.session.user.title == "Doctor"){
        res.render("admin_panel_doctor/hastalar.ejs", {doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
      }
  }

  else{
    res.redirect("/login");
  }
});

router.get("/eski_randevular/", (req, res) => {
  console.log("session: " + req.session.user);
  // if admin show all the past appointments in the database
  // if assistant show all the past appointments in the database
  // if doctor show only his/her past appointments

  // if a user who logged in successfully.
  if(req.session.user && req.session.isAuthenticated){

    // if admin show all the past appointments in the database
    if(req.session.user.title == "Admin") {
      res.render("admin_panel/pastDueAppointments.ejs", {adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant"){
      res.render("admin_panel_assistant/pastDueAppointments.ejs", {assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }

    // !!!! Show only their past appointments
    else if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/pastDueAppointments.ejs", {doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
  }
  else{
    res.redirect("/login");
  }
});

router.get("/randevu_talepleri/", (req, res) => {
  if(req.session.user && req.session.isAuthenticated && req.session.user.title == "Admin"){
    res.render("admin_panel/appointmentRequests.ejs", {adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
  }
  else if(req.session.user && req.session.isAuthenticated && req.session.user.title == "Assistant"){
    res.render("admin_panel_assistant/appointmentRequests.ejs", {assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
  }

  else {
    redirect("/login");
  }
});



//this will create new doctor account.
//Warn!!! Burada yetki meselesini de halletmek gerekir. Neticede doktoru herkes ekleyemiyor.
router.post('/create_doctor', async (req, res) => {
    let personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelClinic;
    personelClinic = 1; // there's only 1 clinic that's why it is 1.
    let addDoctorSuccessful;
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    ({personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword} = req.body);
    // await create_account(personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, "Doctor", personelClinic);
    addDoctorSuccessful = await create_account(personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, "Doctor", personelClinic);

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/doctors.ejs", {addDoctorSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/doctors.ejs", {addDoctorSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/doctors.ejs", {addDoctorSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }

});


//this will create new assistant account.
//Warn!!! Burada yetki meselesini de halletmek gerekir. Neticede doktoru herkes ekleyemiyor.
router.post('/create_assistant', async (req, res) => {
    // let personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelClinic;
    // //Buradaki verilerin boş olmadığını kabul ediyoruz.
    // ({personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelClinic} = req.body);

    // await create_account(personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, "Assistant", personelClinic);

    let personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelClinic;
    personelClinic = 1; // there's only 1 clinic that's why it is 1.
    let addAssistantSuccessful;
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    ({personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword} = req.body);
    // await create_account(personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, "Doctor", personelClinic);
    addAssistantSuccessful = await create_account(personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, "Assistant", personelClinic);
    console.log(personelName + " " + personelSurname + " " + personelPhoneNum + " " + personelEmail + " " + personelPassword + " " + personelClinic);
    console.log("başarıyla eklendi mi: " + addAssistantSuccessful);

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/assistants.ejs", {addAssistantSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/assistants.ejs", {addAssistantSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/assistants.ejs", {addAssistantSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }


});

router.post('/create_admin', async (req, res) => {
    let personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelClinic;
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    ({personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelClinic} = req.body);

    await create_account(personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, "Admin", personelClinic);
});


router.post('/create_superadmin', async (req, res) => {
    let personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelClinic;
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    ({personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelClinic} = req.body);

    await create_account(personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, "Superadmin", personelClinic);
});




//this will create new personel account. And will add it to database.
router.post('/create_patient_appointment', async (req, res) => {
    let name, surname, phoneNum, email, doctor, clinic, date, time, price, more;
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    ({name, surname, phoneNum, email, doctor, clinic, date, time, price, more} = req.body);
    //console.log("LAAAAAANNNN!");

    // there is no email verification. Because these datas will be added by person.
    
    // Database'e bağlanıyoruz. (Burada database ismi vs değiişmeli!!!)
    // await mongoose.connect("mongodb://127.0.0.1:27017/clinicDB", {useNewUrlParser: true});
    await mongoose.connect(url + "clinicDB");

    //dentistSchema'ya uyacak bir collection oluşturuyoruz. Eğer PersonelList collection'ı yoksa oluşturuyoruz. (ANCAK KLİNİK MANTIĞINDA DOKTORUN HANGİ KLİNİKTE OLDUĞU BELİRTİLMELİ. YA DA KLİNİK İÇİN BİR COLLECTİON OLUŞTURULUP O COLLECTİON İÇİNE OLUŞTURULAN DOKTORLAR EKLENMELİ.)
    try {
        patientList = mongoose.model('patientList');
    } catch {
        const patientSchema = new mongoose.Schema({
          name: String,
          surname: String,
          phoneNum: String,
          email: String,
          doctor: String,
          clinic: String,
          date: String,
          time: String,
          price: String,
          more: String
        });
      
        patientList = mongoose.model('patientList', patientSchema);
    }    
    //Burada neden try catch yapısı kullandık? Neden direkt dentistSchema'yı tanımlayıp Dentistlit objesi oluşturmadık? Çünkü eğer PersonelList collection'ı yoksa oluşturuyoruz. Eğer PersonelList collection'ı varsa, direkt PersonelList objesini oluşturuyoruz. Bu yüzden try catch kullandık. Eğer PersonelList collection'ı yoksa, try bloğu çalışacak ve PersonelList objesini oluşturacak. Eğer PersonelList collection'ı varsa, catch bloğu çalışacak ve PersonelList objesini oluşturacak.
    // Ayrıca try catch içinde yazmasaydım garip bir şekilde password invalid hatasından sonra yeni valid doktor eklemesi yapınca hata alıyordum.

    
    const personel = new patientList({
        name: name,
        surname: surname,
        phoneNum: phoneNum,
        email: email,
        doctor: doctor,
        clinic: clinic,
        date: date,
        time: time,
        price: price,
        more: more
        
    });

    await personel.save();
    
    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/randevular.ejs", {addAppointmentSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/randevular.ejs", {addAppointmentSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/randevular.ejs", {addAppointmentSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }


    console.log("\nDatabase'e eklendi!");

    await mongoose.connection.close();


});







router.post("/delete_doctor", async (req, res) => {
    const { _id } = req.body;
  
    if (!_id) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    else{
      const objectId = new ObjectId(_id);  
      delete_account(objectId);
    }
    

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/doctors.ejs", {isDoctorDeleted: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/doctors.ejs", {isDoctorDeleted: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/doctors.ejs", {isDoctorDeleted: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }


});


router.post("/delete_assistant", async (req, res) => {
    const { _id } = req.body;
  
    if (!_id) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    else{
        const objectId = new ObjectId(_id);
        delete_account(objectId);
    }

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/doctors.ejs", {isDoctorDeleted: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/doctors.ejs", {isDoctorDeleted: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/doctors.ejs", {isDoctorDeleted: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }


});


router.post("/delete_admin", async (req, res) => {
    const { _id } = req.body;
  
    if (!_id) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    else{
      const objectId = new ObjectId(_id);  
      delete_account(objectId);
    }

});


//This will be remmoved
router.post("/delete_superadmin", async (req, res) => {
    const { name, surname, email } = req.body;
  
    if (!name || !surname || !email) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    else{
        delete_account(name, surname, email, 'Superadmin');
    }

});



// commented out because it is not using mongoose
// //Warn!!! Hasta ekle sil mantıksız geldi. O yüzden randevu ekle sil mantığıyla yapıyorum.
router.post('/delete_patient_appointment', async (req, res) => {
    let name, surname, phoneNum, email, doctor, clinic, date, time, more;
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    //Çarpı butonuna basılarak randevu iptal ediliyor. O halde o kısımdaki tüm bilgilerin input olarak alındığını kabul ediyorum. Sonradan değiştirebiliriz. 
    ({name, surname, phoneNum, doctor, date, time, more} = req.body);


    const dbName = 'clinicDB';
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      console.log('Connected to MongoDB in delete_patient');
  
      const db = client.db(dbName);
      const collection = db.collection('patientlists');

  
      // Delete documents where name, surname, email, and title match the provided values
      const result = await collection.deleteMany({ name: name, surname: surname, phoneNum: phoneNum, date: date, time:time });
  
      console.log(`Removed ${result.deletedCount} documents with name ${name}, surname ${surname}, and phoneNum ${phoneNum}`);


      if(req.session.user.title == "Doctor") {
        res.render("admin_panel_doctor/randevular.ejs", {deleteAppointmentSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
      }
      else if(req.session.user.title == "Admin") {
        res.render("admin_panel/randevular.ejs", {deleteAppointmentSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
      }
      else if(req.session.user.title == "Assistant") {
        res.render("admin_panel_assistant/randevular.ejs", {deleteAppointmentSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
      }

    } catch (error) {
      console.error('Error deleting documents:', error);
    } finally {
      await client.close();
      console.log('Disconnected from MongoDB in delete_patient');
    }    

});
// router.post('/delete_patient_appointment', async (req, res) => {
//     const { name, surname, phoneNum, date, time } = req.body;

//     try {
//         await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
//         console.log('Connected to MongoDB in delete_patient');

//         // Delete documents where name, surname, phoneNum, date, and time match the provided values
//         const result = await Patient.deleteMany({ name: name, surname: surname, phoneNum: phoneNum, date: date, time:time });

//         console.log(`Removed ${result.deletedCount} documents with name ${name}, surname ${surname}, and phoneNum ${phoneNum}`);
//     } catch (error) {
//         console.error('Error deleting documents:', error);
//     } finally {
//         await mongoose.connection.close();
//         console.log('Disconnected from MongoDB in delete_patient');
//     }    
// });

//Warn!!! Update'de title değiştirmeye dahi izin veriyorum. Sadece mail değiştirmeye izin vermiyorum. Kodda ona da izin veriyorum da front endde verilmemeli. Şifre değiştirmeye dahi izin veriyorum
router.post('/update_doctor', async (req, res) => {

    const { _id, name, surname, phoneNum, email, password } = req.body;

    const objectId = new ObjectId(_id);

    if (!name || !surname || !phoneNum || !email || !password) {
        return res.status(400).json({ error: "Missing required parameters" });
    }    

    else{
        update_account(objectId, name, surname, phoneNum, email, password, "Doctor", "Klinik1")
    }

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/doctors.ejs", {isDoctorUpdated: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/doctors.ejs", {isDoctorUpdated: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/doctors.ejs", {isDoctorUpdated: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }


});


router.post('/update_assistant', async (req, res) => {

    // const { name, surname, phoneNum, email, password, title, clinic } = req.body;
    // if (!name || !surname || !phoneNum || !email || !password || !title || !clinic) {
    //     return res.status(400).json({ error: "Missing required parameters" });
    // }    

    // else{
    //     update_account(name, surname, phoneNum, email, password, title, clinic)
    // }


    const { _id, name, surname, phoneNum, email, password } = req.body;

    const objectId = new ObjectId(_id);

    if (!name || !surname || !phoneNum || !email || !password) {
        return res.status(400).json({ error: "Missing required parameters" });
    }    

    else{
        update_account(objectId, name, surname, phoneNum, email, password, "Assistant", "Klinik1")
    }

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/assistants.ejs", {isAssistantUpdated: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/assistants.ejs", {isAssistantUpdated: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/assistants.ejs", {isAssistantUpdated: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }

});



router.post('/update_admin', async (req, res) => {

    const { _id, name, surname, phoneNum, email, password, title, clinic } = req.body;

    const objectId = new ObjectId(_id);

    if (!name || !surname || !phoneNum || !email || !password || !title || !clinic) {
        return res.status(400).json({ error: "Missing required parameters" });
    }    

    else{
        update_account(objectId, name, surname, phoneNum, email, password, title, clinic)
    }
});



router.post('/update_superadmin', async (req, res) => {

    const {_id, name, surname, phoneNum, email, password, title, clinic } = req.body;

    const objectId = new ObjectId(_id);

    if (!name || !surname || !phoneNum || !email || !password || !title || !clinic) {
        return res.status(400).json({ error: "Missing required parameters" });
    }    

    else{
        update_account(objectId, name, surname, phoneNum, email, password, title, clinic)
    }
});


// commented because it is not using mongoose.
router.post('/update_patient_appointment', async (req, res) => {

  //Warn!!! TÜm özellikler girilmeli derken; update deyince eski özellikler orada gözükür. Dolayısıyla onları değiştirmezsek zaten oradan veri gelecektir. Ancak boş bırakılmasına izin verilmez. 
  const {_id, name, surname, phoneNum, email, doctor, clinic, date, time, price, more } = req.body;
  //if (!name || !surname || !phoneNum || !email || !doctor || !clinic || !date  || !time) {

  // console.log("----------UPDATE POST REQUESTTEYİM-----------");
  // console.log("ID İn update patient appo post: " + _id);
  // console.log("Veri tipi: " + typeof _id);
  const objectId = new ObjectId(_id);

  if (!name || !surname || !phoneNum || !doctor || !date  || !time) {    
      return res.status(400).json({ error: "Missing required parameters" });
  }    

  else{

      const dbName = 'clinicDB';

      const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    
      try {
        await client.connect();
        console.log('Connected to MongoDB in update_account');
    
        const db = client.db(dbName);
        const collection = db.collection('patientlists');
    
        // Update documents where email matches the provided value
        const result = await collection.updateMany(
          {_id: objectId },
          {
            $set: {
              name: name,
              surname: surname,
              phoneNum: phoneNum,
              email: email,
              doctor : doctor,
              clinic: clinic,
              date: date,
              time: time,
              price : price,
              more: more
              
            }
          }
        );
    
        console.log(`Updated ${result.modifiedCount} appointments documents with email ${email}`);

        if(req.session.user.title == "Doctor") {
          res.render("admin_panel_doctor/randevular.ejs", {updateAppointmentSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
        }
        else if(req.session.user.title == "Admin") {
          res.render("admin_panel/randevular.ejs", {updateAppointmentSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
        }
        else if(req.session.user.title == "Assistant") {
          res.render("admin_panel_assistant/randevular.ejs", {updateAppointmentSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
        }
        
        
        //res.status(200).json({ message: `${result.modifiedCount} documents updated` });
      } catch (error) {
        console.error('Error updating documents:', error);
      } finally {
        await client.close();
        
        console.log('Disconnected from MongoDB in update_account');
      }        

  }
});

// router.post('/update_patient_appointment', async (req, res) => {

//     //Warn!!! TÜm özellikler girilmeli derken; update deyince eski özellikler orada gözükür. Dolayısıyla onları değiştirmezsek zaten oradan veri gelecektir. Ancak boş bırakılmasına izin verilmez. 
//     const {id, name, surname, phoneNum, email, doctor, clinic, date, time, price, more } = req.body;
//     //if (!name || !surname || !phoneNum || !email || !doctor || !clinic || !date  || !time) {
//     console.log("LAAAAAN");
//     console.log("ID in update post: " + id);

//     if (!name || !surname || !phoneNum || !doctor || !date  || !time) {    
//         return res.status(400).json({ error: "Missing required parameters" });
//     }    

//     else{

//         const dbName = 'clinicDB';
  
//         const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
      
//         try {
//           await client.connect();
//           console.log('Connected to MongoDB in update_patient_appo');
      
//           const db = client.db(dbName);
//           const collection = db.collection('patientlists');
      
//           // Update documents where email matches the provided value
//           const result = await collection.updateMany(
//             {_id: id, name: name, surname: surname },
//             {
//               $set: {
//                 name: name,
//                 surname: surname,
//                 phoneNum: phoneNum,
//                 email: email,
//                 doctor : doctor,
//                 clinic: clinic,
//                 date: date,
//                 time: time,
//                 price : price,
//                 more: more
                
//               }
//             }
//           );
      
//           console.log(`Updated ${result.modifiedCount} documents with email ${email}`);
//           res.render("admin_panel/randevular.ejs", {updateAppointmentSuccessful: 1});
          
//           //res.status(200).json({ message: `${result.modifiedCount} documents updated` });
//         } catch (error) {
//           console.error('Error updating documents:', error);
//         } finally {
//           await client.close();
          
//           console.log('Disconnected from MongoDB in update_patient_appo');
//         }        

//     }
// });

// router.post('/update_patient_appointment', async (req, res) => {
//     const { name, surname, phoneNum, email, doctor, clinic, date, time, more } = req.body;
//     if (!name || !surname || !phoneNum || !email || !doctor || !clinic || !date  || !time) {
//         return res.status(400).json({ error: "Missing required parameters" });
//     } else {
//         try {
//             await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
//             console.log('Connected to MongoDB in update_account');

//             // Update documents where name and surname match the provided values
//             const result = await Patient.updateMany(
//                 { name: name, surname: surname },
//                 {
//                     $set: {
//                         name: name,
//                         surname: surname,
//                         phoneNum: phoneNum,
//                         email: email,
//                         doctor : doctor,
//                         clinic: clinic,
//                         date: date,
//                         time: time,
//                         more: more
//                     }
//                 }
//             );

//             console.log(`Updated ${result.nModified} documents with email ${email}`);
//             res.status(200).json({ message: `${result.nModified} documents updated` });
//         } catch (error) {
//             console.error('Error updating documents:', error);
//         } finally {
//             await mongoose.connection.close();
//             console.log('Disconnected from MongoDB in update_account');
//         }
//     }
// });




//this will create new personel account. And will add it to database.
async function create_account(personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelTitle, personelClinic){
    //let personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelTitle, personelClinic;
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    //({personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelTitle, personelClinic} = req.body);
    //console.log("Girdim2!");
    let addDoctorSuccessfull;
    if(isStrongPassword(personelPassword) == false){
        console.log("password is not strong enough!");
        //BURAYA BİR EKRAN YA DA POP UP'IN GELMESİ GEREKİYOR.
        //res.render("create_dentist_account.ejs", { error: "password is not strong enough!" });

        //BELKI STATUSCODE 404 DE VERILMELİ BİLEMİYORUM
        //res.status(404);
        return addDoctorSuccessfull = false;
    }

    // there is no email verification. Because these datas will be added by admin.
    
    // Database'e bağlanıyoruz. (Burada database ismi vs değiişmeli!!!)
    // await mongoose.connect("mongodb://127.0.0.1:27017/clinicDB", {useNewUrlParser: true});
    await mongoose.connect(url + "clinicDB");

    //dentistSchema'ya uyacak bir collection oluşturuyoruz. Eğer PersonelList collection'ı yoksa oluşturuyoruz. (ANCAK KLİNİK MANTIĞINDA DOKTORUN HANGİ KLİNİKTE OLDUĞU BELİRTİLMELİ. YA DA KLİNİK İÇİN BİR COLLECTİON OLUŞTURULUP O COLLECTİON İÇİNE OLUŞTURULAN DOKTORLAR EKLENMELİ.)
    try {
        PersonelsList = mongoose.model('PersonelList');
    } catch {
        const dentistSchema = new mongoose.Schema({
          name: String,
          surname: String,
          phoneNum: String,
          email: String,
          password: String,
          title: String,
          clinic: String
        });
        PersonelsList = mongoose.model('PersonelList', dentistSchema);
    }    
    //Burada neden try catch yapısı kullandık? Neden direkt dentistSchema'yı tanımlayıp Dentistlit objesi oluşturmadık? Çünkü eğer PersonelList collection'ı yoksa oluşturuyoruz. Eğer PersonelList collection'ı varsa, direkt PersonelList objesini oluşturuyoruz. Bu yüzden try catch kullandık. Eğer PersonelList collection'ı yoksa, try bloğu çalışacak ve PersonelList objesini oluşturacak. Eğer PersonelList collection'ı varsa, catch bloğu çalışacak ve PersonelList objesini oluşturacak.
    // Ayrıca try catch içinde yazmasaydım garip bir şekilde password invalid hatasından sonra yeni valid doktor eklemesi yapınca hata alıyordum.

    try {
      const personel = new PersonelsList({
        name: personelName,
        surname: personelSurname,
        phoneNum: personelPhoneNum,
        email: personelEmail,
        password: personelPassword,
        title: personelTitle,
        clinic: personelClinic
        
      });

    await personel.save();
    }
    catch(error) {
        console.log("Error in create_account: " + error);
    }

    await mongoose.connection.close();
    

    console.log("\nDatabase'e eklendi!");
    return addDoctorSuccessfull = true;   
}




// commented out because it is not using mongoose
// // Function to delete doctor documents
async function delete_account(id) {

    const dbName = 'clinicDB';
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db(dbName);
      const collection = db.collection('personellists');

  
      // Delete documents where name, surname, email, and title match the provided values
      const result = await collection.deleteMany({ _id: id });
  
      //console.log(`Removed ${result.deletedCount} documents with name ${name}, surname ${surname}, email ${email}, and title ${title}`);
    } catch (error) {
      console.error('Error deleting documents:', error);
    } finally {
      await client.close();
      console.log('Disconnected from MongoDB in delete_account');
    }
}

// async function delete_account(name, surname, email, title) {
//     try {
//         await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
//         console.log('Connected to MongoDB');

//         // Delete documents where name, surname, email, and title match the provided values
//         const result = await Personnel.deleteMany({ name: name, surname: surname, email: email, title: title });

//         console.log(`Removed ${result.deletedCount} documents with name ${name}, surname ${surname}, email ${email}, and title ${title}`);
//     } catch (error) {
//         console.error('Error deleting documents:', error);
//     } finally {
//         await mongoose.connection.close();
//         console.log('Disconnected from MongoDB in delete_account');
//     }
// }




// commented out because it is not using mongoose
async function update_account(objectId, name, surname, phoneNum, email, password, title, clinic){    
  

    const dbName = 'clinicDB';
  
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  
    try {
      await client.connect();
      console.log('Connected to MongoDB in update_account');
  
      const db = client.db(dbName);
      const collection = db.collection('personellists');
  
      // Update documents where email matches the provided value
      const result = await collection.updateMany(
        { _id: objectId },
        {
          $set: {
            name: name,
            surname: surname,
            phoneNum: phoneNum,
            email : email,
            password: password,
            title: title,
            clinic: clinic
          }
        }
      );
  
      console.log(`Updated ${result.modifiedCount} documents with email ${email}`);
      
      //res.status(200).json({ message: `${result.modifiedCount} documents updated` });
    } catch (error) {
      console.error('Error updating documents:', error);
    } finally {
      await client.close();
      console.log('Disconnected from MongoDB in update_account');
    }
}
// // Warn!!! Email'e göre update yapar. Bu yüzden update işleminde email değişemez. Email sabit kalmalı
// async function update_account(name, surname, phoneNum, email, password, title, clinic) {
    
//     const PersonelListSchema = new mongoose.Schema({
//         name: String,
//         surname: String,
//         phoneNum: String,
//         email: String,
//         password: String,
//         title: String,
//         clinic: String
//       });

//     const PersonelList = mongoose.model('PersonelList', PersonelListSchema);

    
    
//     try {
       
//         await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
//         console.log('Connected to MongoDB in update_account');

//         // Update documents where email matches the provided value
//         const result = await PersonelList.updateMany(
//             { email: email },
//             {
//                 $set: {
//                     name: name,
//                     surname: surname,
//                     phoneNum: phoneNum,
//                     password: password,
//                     title: title,
//                     clinic: clinic
//                 }
//             }
//         );

//         console.log(`Updated ${result.nModified} documents with email ${email}`);
//     } catch (error) {
//         console.error('Error updating documents:', error);
//     } finally {
//         await mongoose.connection.close();
//         console.log('Disconnected from MongoDB in update_account');
//     }
// }


function isStrongPassword(password) {
    // Define a regular expression pattern for a strong password
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*.,?])[A-Za-z0-9!@#$%^&*.,?]{8,}$/;
  
    // Test the password against the pattern
    return strongPasswordRegex.test(password);
} 


const Personellist = mongoose.model('PersonelLists', {
    name: String,
    surname: String,
    phoneNum: String,
    email: String,
    password: String,
    title: String,
    clinic: String
});




//Warn!!! Burada hata çıkabilir. get read_doctor idi böyle yaptık.
router.get('/read_doctors', async (req, res) => {
    console.log("Doctosdayım");

    await mongoose.connect(process.env.URL + "clinicDB", { useNewUrlParser: true, useUnifiedTopology: true });

    //create doctors'ta collection'un ismini PersonelLists diye oluşturuyorum ancak database'de personelslists


    try {
      // Fetch doctors from the database
      const doctors = await Personellist.find({ title: 'Doctor' });
  
      // Render the doctors.ejs template with the fetched data
      //console.log("Okundu");
      //console.log(doctors);
      //res.render('admin_panel/dumen.ejs', { doctors });
      res.json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
    finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB in doctors');
    }
  });


  router.get('/read_assistants', async (req, res) => {
    console.log("read_assistants'dayım");

    await mongoose.connect(process.env.URL + "clinicDB", { useNewUrlParser: true, useUnifiedTopology: true });

    //create assistants'ta collection'un ismini PersonelLists diye oluşturuyorum ancak database'de personelslists


    try {
      // Fetch assistants from the database
      const assistants = await Personellist.find({ title: 'Assistant' });
  
      // Render the assistants.ejs template with the fetched data
      //console.log("Okundu");
      //console.log(assistants);
      //res.render('admin_panel/dumen.ejs', { assistants });
      res.json(assistants);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
    finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB in read_assistants');
    }
  });



  const Patientlist = mongoose.model('patientLists', {
    name: String,
    surname: String,
    phoneNum: String,
    email: String,
    doctor: String,
    clinic: String,
    date: String,
    time: String,
    price: String,
    more: String
    });


    const PastPatientlist = mongoose.model('pastdueappointments', {
      name: String,
      surname: String,
      phoneNum: String,
      email: String,
      doctor: String,
      clinic: String,
      date: String,
      time: String,
      price: String,
      more: String
    });


  router.get('/read_appointments', async (req, res) => {
    const moment = require('moment-timezone');
    moment.tz.setDefault('Europe/Istanbul');
    
    // getting the filter query from the request for example: "all" or "today"
    const { filter } = req.query;
    console.log("filter: " + filter)


    await mongoose.connect(url + 'clinicDB', { useNewUrlParser: true, useUnifiedTopology: true });

    //create doctors'ta collection'un ismini PersonelLists diye oluşturuyorum ancak database'de personelslists


    try {
      // Fetch patients from the database according to the filter
      let patients;
      async function filterPatients(filter) {
            // Fetch all patients from the database
            let allPatients = await Patientlist.find();
    
            // Filter patients based on the provided filter
            let filteredPatients;
            let currentTime;
            let currentDate = moment().tz('Europe/Istanbul').startOf('day');

            // Only include appointments that are after the current time
            currentTime = moment().tz('Europe/Istanbul');

            // Geçmiş randevuları bulma 
            let allpastPatients;
            allpastPatients = allPatients.filter(patient => {
              let appointmentTime_ = moment(`${patient.date} ${patient.time}`, "DD.MM.YYYY HH.mm").tz('Europe/Istanbul');
              return currentTime.isAfter(appointmentTime_);
            });

            //console.log("ESKI : !!! \n" + allpastPatients);

            for (const pastPatient of allpastPatients) {
              // Remove from patientlists
              await Patientlist.findByIdAndDelete(pastPatient._id);
        
              // Add to pastdueappointments
              //console.log("Past patient!!!!!: " + pastPatient);
              const pastPatientObject = pastPatient.toObject();
              const pastDueAppointment = new PastPatientlist(pastPatientObject);
              await pastDueAppointment.save();
            }

            

            // geçmiş randevuları patientlists'ten silme






            allPatients = allPatients.filter(patient => {
                let appointmentTime_ = moment(`${patient.date} ${patient.time}`, "DD.MM.YYYY HH.mm").tz('Europe/Istanbul');
                return appointmentTime_.isAfter(currentTime);
            });

            //console.log("YENI : !!! \n" + allPatients);



            // 

            

    
            switch(filter) {
                case 'today':
                    // filteredPatients = allPatients.filter(patient => 
                    //     moment(patient.date, "DD.MM.YYYY").isSame(currentDate, 'day'));
                    currentTime = moment().tz('Europe/Istanbul');
                    filteredPatients = allPatients.filter(patient => {
                      let appointmentTime = moment(`${patient.date} ${patient.time}`, "DD.MM.YYYY HH.mm");
                      return appointmentTime.isSame(currentTime, 'day') && appointmentTime.isAfter(currentTime);
                    });
                    break;
                case 'week':
                    // Next 7 days including today
                    let weekLater = moment().tz('Europe/Istanbul').add(6, 'days').endOf('day'); // 6 days ahead + today = 7 days
                    filteredPatients = allPatients.filter(patient => {
                        let patientDate = moment(patient.date, "DD.MM.YYYY");
                        return patientDate.isSameOrAfter(currentDate) && patientDate.isSameOrBefore(weekLater);
                    });
                    break;
                case 'month':
                    // Next 30 days including today
                    let monthLater = moment().tz('Europe/Istanbul').add(29, 'days').endOf('day'); // 29 days ahead + today = 30 days
                    filteredPatients = allPatients.filter(patient => {
                        let patientDate = moment(patient.date, "DD.MM.YYYY");
                        return patientDate.isSameOrAfter(currentDate) && patientDate.isSameOrBefore(monthLater);
                    });
                    break;
                default:
                  // Only include appointments that are after the current time
                  currentTime = moment().tz('Europe/Istanbul');
                  filteredPatients = allPatients.filter(patient => {
                      let appointmentTime = moment(`${patient.date} ${patient.time}`, "DD.MM.YYYY HH.mm");
                      return appointmentTime.isAfter(currentTime);
                  });
                  break;
            }
            // After filtering, sort the patients by datetime
            filteredPatients.sort((a, b) => {
              let dateTimeA = moment(`${a.date} ${a.time}`, "DD.MM.YYYY HH.mm");
              let dateTimeB = moment(`${b.date} ${b.time}`, "DD.MM.YYYY HH.mm");
              return dateTimeA - dateTimeB; // Ascending order
            });

            return filteredPatients;
      }
      patients = await filterPatients(filter);

      // what i want is filter the patients again according to their doctor.
      // if the req.session.user.name + " " + req.session.user.surname is equal to the doctor of the patient then filter it.
      if(req.session.user.title == "Doctor"){
        let doctorName = req.session.user.name + " " + req.session.user.surname;
        console.log("Doctor name: " + doctorName);
        patients.forEach(patient => {
          console.log("Patient doctor: " + patient.doctor);
        });
        patients = patients.filter(patient => patient.doctor == doctorName);
      }

      res.json(patients);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
    finally {
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB in read_appointments');
    }
  });



//Hasta geçmişi ile ilgili olan kısım

  const patientHistorySchema = new mongoose.Schema({
    name: String,
    surname: String,
    phoneNum: String,
    email: String,
    records: [{ doctor: String, clinic: String , date: String, time: String, price: String, more: String, doctorComment: String }]
  });





  router.post('/add_record', async (req, res) => {
    
    const { name, surname, phoneNum, email, doctor, clinic, date, time, price, more, doctorComment } = req.body;
    
    await mongoose.connect(`${process.env.URL}clinicDB`);

    const PatientHistory = mongoose.model('patienthistory', patientHistorySchema);


    try {
      // Check if 'patientHistory' collection exists
      const collectionExists = await mongoose.connection.db.listCollections({ name: 'patienthistory' }).hasNext();
  
      if (!collectionExists) {
        // Create 'patientHistory' collection if it doesn't exist
        await mongoose.connection.db.createCollection('patienthistory');
      }
  
      // Check if the document with given name, surname, and phoneNum exists
      const existingPatient = await PatientHistory.findOne({ name, surname, phoneNum });
  
      if (!existingPatient) {
        // Create a new document if it doesn't exist
        const newPatient = new PatientHistory({
          name,
          surname,
          phoneNum,
          email,
          records: [{ doctor, clinic, date, time, price, more, doctorComment }]
        });
        await newPatient.save();
      } else {
        // Add a new record to the existing document
        existingPatient.records.push({ doctor, clinic, date, time, price, more, doctorComment });
        await existingPatient.save();
      }

      // Geçmiş randevu hasta geçmişine eklendiği için artık pastDueAppointments database'inde bulunmasına gerek yok.
      await mongoose.connection.db.collection('pastdueappointments').deleteOne({ name, surname, phoneNum, date, time });

      if(req.session.user.title == "Doctor") {
        res.render("admin_panel_doctor/pastDueAppointments.ejs", {savePastAppointmentSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
      }
      else if(req.session.user.title == "Admin") {
        res.render("admin_panel/pastDueAppointments.ejs", {savePastAppointmentSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
      }
      else if(req.session.user.title == "Assistant") {
        res.render("admin_panel_assistant/pastDueAppointments.ejs", {savePastAppointmentSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
      }

    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error in add_record');
    }
    finally {
      await mongoose.connection.close();
    }
  });




router.post('/create_past_patient_appointment', async (req, res) => {
    let name, surname, phoneNum, email, doctor, clinic, date, time, price, more;
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    ({name, surname, phoneNum, email, doctor, clinic, date, time, price, more} = req.body);
    //console.log("LAAAAAANNNN!");

    // there is no email verification. Because these datas will be added by person.
    
    // Database'e bağlanıyoruz. (Burada database ismi vs değiişmeli!!!)
    // await mongoose.connect("mongodb://127.0.0.1:27017/clinicDB", {useNewUrlParser: true});
    await mongoose.connect(url + "clinicDB", { useNewUrlParser: true, useUnifiedTopology: true });

    let patientList;

    //dentistSchema'ya uyacak bir collection oluşturuyoruz. Eğer PersonelList collection'ı yoksa oluşturuyoruz. (ANCAK KLİNİK MANTIĞINDA DOKTORUN HANGİ KLİNİKTE OLDUĞU BELİRTİLMELİ. YA DA KLİNİK İÇİN BİR COLLECTİON OLUŞTURULUP O COLLECTİON İÇİNE OLUŞTURULAN DOKTORLAR EKLENMELİ.)
    try {
        patientList = mongoose.model('pastDueAppointments');
    } catch {
        const patientSchema = new mongoose.Schema({
          name: String,
          surname: String,
          phoneNum: String,
          email: String,
          doctor: String,
          clinic: String,
          date: String,
          time: String,
          price: String,
          more: String
        });
      
        patientList = mongoose.model('pastDueAppointments', patientSchema);
    }    
    //Burada neden try catch yapısı kullandık? Neden direkt dentistSchema'yı tanımlayıp Dentistlit objesi oluşturmadık? Çünkü eğer PersonelList collection'ı yoksa oluşturuyoruz. Eğer PersonelList collection'ı varsa, direkt PersonelList objesini oluşturuyoruz. Bu yüzden try catch kullandık. Eğer PersonelList collection'ı yoksa, try bloğu çalışacak ve PersonelList objesini oluşturacak. Eğer PersonelList collection'ı varsa, catch bloğu çalışacak ve PersonelList objesini oluşturacak.
    // Ayrıca try catch içinde yazmasaydım garip bir şekilde password invalid hatasından sonra yeni valid doktor eklemesi yapınca hata alıyordum.

    
    const personel = new patientList({
        name: name,
        surname: surname,
        phoneNum: phoneNum,
        email: email,
        doctor: doctor,
        clinic: clinic,
        date: date,
        time: time,
        price: price,
        more: more
        
    });

    await personel.save();

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/pastDueAppointments.ejs", {addPastAppointmentSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/pastDueAppointments.ejs", {addPastAppointmentSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/pastDueAppointments.ejs", {addPastAppointmentSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }


    console.log("\npastDueAppointments Database'ine eklendi!");

    await mongoose.connection.close();


});  





router.get('/read_past_appointments', async (req, res) => {
  //console.log("Doctosdayım");
  //WARN!!! Bu normalde fonksiyonun dışında idi. Burada içeri yazdık. Buradaki pastDueAppointments kısmı da sıkıntı çıkarabilir.


  await mongoose.connect(url + 'clinicDB', { useNewUrlParser: true, useUnifiedTopology: true });

  //create doctors'ta collection'un ismini PersonelLists diye oluşturuyorum ancak database'de personelslists


  try {
    // Fetch doctors from the database
    let patients = await PastPatientlist.find();

    // get them according to the doctor if the user is a doctor
    if(req.session.user.title == "Doctor"){
      let doctorName = req.session.user.name + " " + req.session.user.surname;
      console.log("Doctor name: " + doctorName);
      patients.forEach(patient => {
        console.log("Patient doctor: " + patient.doctor);
      });
      patients = patients.filter(patient => patient.doctor == doctorName);
    }

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
  finally {
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB in read_past_appointments');
  }
});



router.post('/delete_past_patient_appointment', async (req, res) => {
  let name, surname, phoneNum, email, doctor, clinic, date, time, more;
  //Buradaki verilerin boş olmadığını kabul ediyoruz.
  //Çarpı butonuna basılarak randevu iptal ediliyor. O halde o kısımdaki tüm bilgilerin input olarak alındığını kabul ediyorum. Sonradan değiştirebiliriz. 
  ({name, surname, phoneNum, doctor, date, time, more} = req.body);


  const dbName = 'clinicDB';
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB in delete_past_patient_appointment');

    const db = client.db(dbName);
    const collection = db.collection('pastdueappointments');


    // Delete documents where name, surname, email, and title match the provided values
    const result = await collection.deleteMany({ name: name, surname: surname, phoneNum: phoneNum, date: date, time:time });

    console.log(`Removed ${result.deletedCount} documents with name ${name}, surname ${surname}, and phoneNum ${phoneNum}`);

    if(req.session.user.title == "Doctor"){
      res.render("admin_panel_doctor/pastDueAppointments.ejs", {deletePastAppointmentSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/pastDueAppointments.ejs", {deletePastAppointmentSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant"){
      res.render("admin_panel_assistant/pastDueAppointments.ejs", {deletePastAppointmentSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }

  } catch (error) {
    console.error('Error deleting documents:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB in delete_past_patient_appointment');
  }    

});




router.post('/update_patient_history', async (req, res) => {

  //Warn!!! TÜm özellikler girilmeli derken; update deyince eski özellikler orada gözükür. Dolayısıyla onları değiştirmezsek zaten oradan veri gelecektir. Ancak boş bırakılmasına izin verilmez. 
  const {_id, name, surname, phoneNum, email } = req.body;
  //if (!name || !surname || !phoneNum || !email || !doctor || !clinic || !date  || !time) {

  // console.log("----------UPDATE POST REQUESTTEYİM-----------");
  // console.log("ID İn update patient appo post: " + _id);
  // console.log("Veri tipi: " + typeof _id);
  const objectId = new ObjectId(_id);

  if (!name || !surname || !phoneNum) {    
      return res.status(400).json({ error: "Missing required parameters" });
  }    

  else{

      const dbName = 'clinicDB';

      const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    
      try {
        await client.connect();
        console.log('Connected to MongoDB in update_patient_history');
    
        const db = client.db(dbName);
        const collection = db.collection('patienthistories');
    
        // Update documents where email matches the provided value
        const result = await collection.updateMany(
          {_id: objectId },
          {
            $set: {
              name: name,
              surname: surname,
              phoneNum: phoneNum,
              email: email
            }
          }
        );
    
        console.log(`Updated ${result.modifiedCount} appointments documents with email ${email}`);

        if(req.session.user.title == "Doctor") {
          res.render("admin_panel_doctor/hastalar.ejs", {updatePatientHistorySuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
        }
        else if(req.session.user.title == "Admin") {
          res.render("admin_panel/hastalar.ejs", {updatePatientHistorySuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
        }
        else if(req.session.user.title == "Assistant") {
          res.render("admin_panel_assistant/hastalar.ejs", {updatePatientHistorySuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
        }
        
        //res.status(200).json({ message: `${result.modifiedCount} documents updated` });
      } catch (error) {
        console.error('Error updating documents:', error);
      } finally {
        await client.close();
        
        console.log('Disconnected from MongoDB in update_patient_history');
      }        

  }

});






router.post('/delete_patient_history', async (req, res) => {
  //Buradaki verilerin boş olmadığını kabul ediyoruz.
  //Çarpı butonuna basılarak randevu iptal ediliyor. O halde o kısımdaki tüm bilgilerin input olarak alındığını kabul ediyorum. Sonradan değiştirebiliriz. 
  const {_id} = req.body;

  const id = new ObjectId(_id);


  const dbName = 'clinicDB';
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB in delete_patient_history');

    const db = client.db(dbName);
    const collection = db.collection('patienthistories');


    // Delete documents where name, surname, email, and title match the provided values
    const result = await collection.deleteMany({ _id: id });

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/hastalar.ejs", {deletePatientHistorySuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/hastalar.ejs", {deletePatientHistorySuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/hastalar.ejs", {deletePatientHistorySuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }

    //console.log(`Removed ${result.deletedCount} documents with name ${name}, surname ${surname}, email ${email}, and title ${title}`);
  } catch (error) {
    console.error('Error deleting documents:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB in delete_patient_history');
  }   

});







const PatientHistoryList = mongoose.model('patienthistories', {
  name: String,
  surname: String,
  phoneNum: String,
  email: String,
  records: [{ doctor: String, clinic: String , date: String, time: String, price: String, more: String, doctorComment: String }]
});



router.get('/read_patient_histories', async (req, res) => {
  //console.log("Doctosdayım");
  //WARN!!! Bu normalde fonksiyonun dışında idi. Burada içeri yazdık. Buradaki pastDueAppointments kısmı da sıkıntı çıkarabilir.


  await mongoose.connect(url + 'clinicDB', { useNewUrlParser: true, useUnifiedTopology: true });

  //create doctors'ta collection'un ismini PersonelLists diye oluşturuyorum ancak database'de personelslists


  try {
    // Fetch doctors from the database and sort them alphabetically
    let patients = await PatientHistoryList.find().collation({ locale: 'tr', strength: 2, }).sort({ name: 1, surname: 1, });

    // if(req.session.user.title == "Doctor"){
    //   let doctorName = req.session.user.name + " " + req.session.user.surname;
    //   console.log("Doctor name: " + doctorName);
    //   patients.forEach(patient => {
    //     console.log("Patient doctor: " + patient.records[0].doctor);
    //   });
    //   patients = patients.filter(patient => patient.records[0].doctor == doctorName);
    // }

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error in read_patient_histories');
  }
  finally {
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB in read_patient_histories');
  }
});





router.get('/read_patient_records/:_id', async (req, res) => {
  const { _id } = req.params;

  // if (!ObjectId.isValid(id)) {
  //   return res.status(400).json({ error: 'Invalid ID' });
  // }

  const id = new ObjectId(_id);

  await mongoose.connect(`${process.env.URL}clinicDB`, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const patient = await PatientHistoryList.findById(id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    //console.log("HASTA KAYITLARIIII: \n" + patient.records);

    res.json(patient.records);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error in get_records');
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB in get_records');
  }
});






router.post('/delete_one_record', async (req, res) => {
  //Buradaki verilerin boş olmadığını kabul ediyoruz.
  //Çarpı butonuna basılarak randevu iptal ediliyor. O halde o kısımdaki tüm bilgilerin input olarak alındığını kabul ediyorum. Sonradan değiştirebiliriz. 
  const {_patient_id, _record_id} = req.body;

  const patient_id = new ObjectId(_patient_id);
  const record_id = new ObjectId(_record_id);


  const dbName = 'clinicDB';
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB in delete_one_record');

    const db = client.db(dbName);
    const collection = db.collection('patienthistories');


    // Delete documents where name, surname, email, and title match the provided values
    //const result = await collection.deleteMany({ _id: id });
    const result = await collection.updateOne(
      { _id: patient_id },
      { $pull: { records: { _id: record_id } } }
    );

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/hastalar.ejs", {deletePatientRecordSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/hastalar.ejs", {deletePatientRecordSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/hastalar.ejs", {deletePatientRecordSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }

    //console.log(`Removed ${result.deletedCount} documents with name ${name}, surname ${surname}, email ${email}, and title ${title}`);
  } catch (error) {
    console.error('Error deleting documents:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB in delete_patient_history');
  }   

});



router.post('/update_one_record', async (req, res) => {
  try {
    const { _patientID, _id, doctor, clinic, date, time, price, more, doctorComment } = req.body;

    await mongoose.connect(`${process.env.URL}clinicDB`, { useNewUrlParser: true, useUnifiedTopology: true });

    const patient = await PatientHistoryList.findOneAndUpdate(
      {
        _id: new ObjectId(_patientID),
        'records._id': new ObjectId(_id)
      },
      {
        $set: {
          'records.$.doctor': doctor,
          'records.$.clinic': clinic,
          'records.$.date': date,
          'records.$.time': time,
          'records.$.price': price,
          'records.$.more': more,
          'records.$.doctorComment': doctorComment
        }
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found or record not found' });
    }

    if(req.session.user.title == "Doctor") {
      res.render("admin_panel_doctor/hastalar.ejs", {updatePatientRecordSuccessful: 1, doctorName: req.session.user.name + " " + req.session.user.surname, doctorEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Admin") {
      res.render("admin_panel/hastalar.ejs", {updatePatientRecordSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/hastalar.ejs", {updatePatientRecordSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }

    //res.status(200).send('Record updated successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error in update_one_record');
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB in update_one_record');
  }
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.isAuthenticated = false;
  req.session.save((err) => {
    if(err){
      console.log(err);
      throw err;
    }
    req.session.regenerate((err) => {
      if(err){
        console.log(err);
        throw err;
      }
      res.redirect("/login");
    });
  });
});

router.get('/read_searched_patient/:name/:surname', async (req, res) => {
  
  
  
  const { name, surname } = req.params;

  //console.log("read_searched_patient'a girdik: " + name + surname);

  // if (!ObjectId.isValid(id)) {
  //   return res.status(400).json({ error: 'Invalid ID' });
  // }

  await mongoose.connect(`${process.env.URL}clinicDB`, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    //const patient = await PatientHistoryList.find({ name: name, surname: surname });

    const nameRegex = new RegExp(name, "i");
    const surnameRegex = new RegExp(surname, "i");
    
    // Şimdi bu regex'leri kullanarak arama işlemlerini gerçekleştirebilirsiniz
    // Örneğin, bir MongoDB sorgusu:
    let patient = await PatientHistoryList.find({
      $or: [
        { name: nameRegex },
        { surname: surnameRegex }
      ]
    });


    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    //console.log("ARANAN HASTA: \n" + patient);


    // // if the session is for a doctor, then filter the patients according to the doctor
    // if(req.session.user.title == "Doctor"){
    //   let doctorName = req.session.user.name + " " + req.session.user.surname;
    //   console.log("Doctor name: " + doctorName);

    //   console.log("Patient's doctor: " + patient[0].records[0].doctor);

    //   patient = patient.filter(patient => patient.records[0].doctor == doctorName);
    // }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error in get_records');
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB in get_records');
  }
});



const AppointmentRequests = mongoose.model('appointmentrequests', {
  name: String,
  telNo: String,
  email: String,
  availableHours: String,
  doctor: String,
  complaint: String
});



router.get('/read_appointment_requests', async (req, res) => {
  console.log("Doctosdayım");

  await mongoose.connect(process.env.URL + "clinicDB", { useNewUrlParser: true, useUnifiedTopology: true });

  //create doctors'ta collection'un ismini PersonelLists diye oluşturuyorum ancak database'de personelslists


  try {
    // Fetch doctors from the database
    const doctors = await AppointmentRequests.find();

    // Render the doctors.ejs template with the fetched data
    //console.log("Okundu");
    //console.log(doctors);
    //res.render('admin_panel/dumen.ejs', { doctors });
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error in read_appointment_requests');
  }
  finally {
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB in read_appointment_requests');
  }
});


const axios = require('axios');


router.post('/create_patient_appointment2', async (req, res) => {
  let _id, name, surname, phoneNum, email, doctor, clinic, date, time, price, more;
  //Buradaki verilerin boş olmadığını kabul ediyoruz.
  ({_id, name, surname, phoneNum, email, doctor, clinic, date, time, price, more} = req.body);
  //console.log("LAAAAAANNNN!");

  // there is no email verification. Because these datas will be added by person.
  
  // Database'e bağlanıyoruz. (Burada database ismi vs değiişmeli!!!)
  // await mongoose.connect("mongodb://127.0.0.1:27017/clinicDB", {useNewUrlParser: true});
  await mongoose.connect(url + "clinicDB");

  //dentistSchema'ya uyacak bir collection oluşturuyoruz. Eğer PersonelList collection'ı yoksa oluşturuyoruz. (ANCAK KLİNİK MANTIĞINDA DOKTORUN HANGİ KLİNİKTE OLDUĞU BELİRTİLMELİ. YA DA KLİNİK İÇİN BİR COLLECTİON OLUŞTURULUP O COLLECTİON İÇİNE OLUŞTURULAN DOKTORLAR EKLENMELİ.)
  try {
      patientList = mongoose.model('patientList');
  } catch {
      const patientSchema = new mongoose.Schema({
        name: String,
        surname: String,
        phoneNum: String,
        email: String,
        doctor: String,
        clinic: String,
        date: String,
        time: String,
        price: String,
        more: String
      });
    
      patientList = mongoose.model('patientList', patientSchema);
  }    
  //Burada neden try catch yapısı kullandık? Neden direkt dentistSchema'yı tanımlayıp Dentistlit objesi oluşturmadık? Çünkü eğer PersonelList collection'ı yoksa oluşturuyoruz. Eğer PersonelList collection'ı varsa, direkt PersonelList objesini oluşturuyoruz. Bu yüzden try catch kullandık. Eğer PersonelList collection'ı yoksa, try bloğu çalışacak ve PersonelList objesini oluşturacak. Eğer PersonelList collection'ı varsa, catch bloğu çalışacak ve PersonelList objesini oluşturacak.
  // Ayrıca try catch içinde yazmasaydım garip bir şekilde password invalid hatasından sonra yeni valid doktor eklemesi yapınca hata alıyordum.

  
  const personel = new patientList({
      name: name,
      surname: surname,
      phoneNum: phoneNum,
      email: email,
      doctor: doctor,
      clinic: clinic,
      date: date,
      time: time,
      price: price,
      more: more
      
  });

  await personel.save();
  
  if(req.session.user.title == "Admin") {
    res.render("admin_panel/appointmentRequests.ejs", {addAppointmentSuccessful: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
  }
  else if(req.session.user.title == "Assistant") {
    res.render("admin_panel_assistant/appointmentRequests.ejs", {addAppointmentSuccessful: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
  }
  else {
    res.redirect("/login");
  }

  console.log("\npatientlists collection'una eklendi!");

  // const secondApiResponse = await axios.post("http://localhost:3000/admin_panel/delete_appointment_request", { _id:_id });
  // const secondApiResponse = await axios.post("https://www.berrakdis.tech/admin_panel/delete_appointment_request", { _id:_id });

  let currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  if(currentUrl.includes("wwww")) {
    secondApiResponse = await axios.post("https://www.berrakdis.tech/admin_panel/delete_appointment_request", { _id:_id });
  }
  else {
    secondApiResponse = await axios.post("https://berrakdis.tech/admin_panel/delete_appointment_request", { _id:_id });
  }

  console.log("\nappointmentrequests collection'undan silindi!");

  await mongoose.connection.close();
});



router.post('/delete_appointment_request', async (req, res) => {

  const { _id } = req.body;
  const id = new ObjectId(_id);  
  //console.log("\n _id: " + _id);

  const dbName = 'clinicDB';
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB in delete_appointment_request');

    const db = client.db(dbName);
    const collection = db.collection('appointmentrequests');


    // Delete documents where name, surname, email, and title match the provided values
    const result = await collection.deleteMany({ _id: id });

    //console.log(`KALDIRILDI ${result}`);

    //console.log(`Removed ${result.deletedCount} documents with name ${name}, surname ${surname}, email ${email}, and title ${title}`);
    
    if(req.session.user.title == "Admin") {
      res.render("admin_panel/appointmentRequests.ejs", {isAppointmentRequestDeleted: 1, adminName: req.session.user.name + " " + req.session.user.surname, adminEmail: req.session.user.email});
    }
    else if(req.session.user.title == "Assistant") {
      res.render("admin_panel_assistant/appointmentRequests.ejs", {isAppointmentRequestDeleted: 1, assistantName: req.session.user.name + " " + req.session.user.surname, assistantEmail: req.session.user.email});
    }
    else {
      res.redirect("/login");
    }

  } catch (error) {
    console.error('Error deleting documents:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB in delete_appointment_request');
  }

});



module.exports = router;