const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
console.log("Girdim1!");


const path = require("path");
const { URL } = require("url");
const dirName = path.dirname(require.main.filename);

//Form'un verilerini okumak için bu 3 satıra ihtiyaç var. req.body yapabilmek için gerekli. 
//ANCAK BUNLARIN APP YERINE ROUTER OLMASI SIKINTI ÇIKARABİLİR
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.static(dirName + '/public'));


let dentistName, dentistSurname, dentistPhoneNum, dentistEmail, dentistPassword;

//this will create new dentist account. And will add it to database.

router.post('/create_dentist_account', async (req, res) => {
    
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    ({dentistName, dentistSurname, dentistPhoneNum, dentistEmail, dentistPassword} = req.body);
    console.log("Girdim2!");
    if(isStrongPassword(dentistPassword) == false){
        console.log("password is not strong enough!");
        //BURAYA BİR EKRAN YA DA POP UP'IN GELMESİ GEREKİYOR.
        //res.render("create_dentist_account.ejs", { error: "password is not strong enough!" });

        //BELKI STATUSCODE 404 DE VERILMELİ BİLEMİYORUM
        res.status(404);

        return;
    }

    // there is no email verification. Because these datas will be added by admin.
    
    // Database'e bağlanıyoruz. (Burada database ismi vs değiişmeli!!!)
    await mongoose.connect("mongodb://localhost:27017/fruitsDB", {useNewUrlParser: true});

    //dentistSchema'ya uyacak bir collection oluşturuyoruz. Eğer dentistList collection'ı yoksa oluşturuyoruz.
    try {
        DentistsList = mongoose.model('DentistList');
    } catch {
        const dentistSchema = new mongoose.Schema({
          name: String,
          surname: String,
          phoneNum: String,
          email: String,
          password: String
        });
      
        DentistsList = mongoose.model('DentistList', dentistSchema);
    }    
    //Burada neden try catch yapısı kullandık? Neden direkt dentistSchema'yı tanımlayıp Dentistlit objesi oluşturmadık? Çünkü eğer DentistList collection'ı yoksa oluşturuyoruz. Eğer DentistList collection'ı varsa, direkt DentistList objesini oluşturuyoruz. Bu yüzden try catch kullandık. Eğer DentistList collection'ı yoksa, try bloğu çalışacak ve DentistList objesini oluşturacak. Eğer DentistList collection'ı varsa, catch bloğu çalışacak ve DentistList objesini oluşturacak.
    // Ayrıca try catch içinde yazmasaydım garip bir şekilde password invalid hatasından sonra yeni valid doktor eklemesi yapınca hata alıyordum.

    
    const dentist = new DentistsList({
        name: dentistName,
        surname: dentistSurname,
        phoneNum: dentistPhoneNum,
        email: dentistEmail,
        password: dentistPassword
    });

    await dentist.save();
    

    console.log("\nDatabase'e eklendi!");


});

function isStrongPassword(password) {
    // Define a regular expression pattern for a strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  
    // Test the password against the pattern
    return strongPasswordRegex.test(password);
  } 


module.exports = router;





/*
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
console.log("Girdim1!");


const path = require("path");
const { URL } = require("url");
const dirName = path.dirname(require.main.filename);

//Form'un verilerini okumak için bu 3 satıra ihtiyaç var. req.body yapabilmek için gerekli. 
//ANCAK BUNLARIN APP YERINE ROUTER OLMASI SIKINTI ÇIKARABİLİR
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.static(dirName + '/public'));



//this will create new dentist account. And will add it to database.
router.post('/create_dentist_account', (req, res) => {
    
    console.log("We are in create_dentist_account");

});

function isStrongPassword(password) {
    // Define a regular expression pattern for a strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  
    // Test the password against the pattern
    return strongPasswordRegex.test(password);
  } 


module.exports = router;
*/







/*
//Route olmadan database'e ekliyor. 
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = 3000;

const mongoose = require("mongoose");
console.log("Girdim1!");

const path = require("path");
const { URL } = require("url");
const dirName = path.dirname(require.main.filename);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(dirName + '/public'));

//this will create new dentist account. And will add it to database.

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

let dentistName, dentistSurname, dentistPhoneNum, dentistEmail, dentistPassword;
  
app.post('/create_dentist_account', async (req, res) => {
    
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    ({dentistName, dentistSurname, dentistPhoneNum, dentistEmail, dentistPassword} = req.body);
    console.log("Girdim2!");
    if(isStrongPassword(dentistPassword) == false){
        console.log("password is not strong enough!");
        //BURAYA BİR EKRAN YA DA POP UP'IN GELMESİ GEREKİYOR.
        //res.render("create_dentist_account.ejs", { error: "password is not strong enough!" });

        //BELKI STATUSCODE 404 DE VERILMELİ BİLEMİYORUM
        //res.status(404);

        return;
    }

    // there is no email verification. Because these datas will be added by admin.
    
    // Database'e bağlanıyoruz. (Burada database ismi vs değiişmeli!!!)
    await mongoose.connect("mongodb://localhost:27017/fruitsDB", {useNewUrlParser: true});

    const dentistSchema = new mongoose.Schema({
        name: String,
        surname: String,
        phoneNum: String, //Bunu da string yaptım
        email: String,
        password: String
    });

    //üstteki dentistSchema'ya uyacak bir collection oluşturuyoruz.
    const DentistsList = mongoose.model("DentistList", dentistSchema);
    const dentist = new DentistsList({
        name: dentistName,
        surname: dentistSurname,
        phoneNum: dentistPhoneNum,
        email: dentistEmail,
        password: dentistPassword
    });

    await dentist.save();
    

    console.log("\nDatabase'e eklendi!");


});

function isStrongPassword(password) {
    // Define a regular expression pattern for a strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  
    // Test the password against the pattern
    return strongPasswordRegex.test(password);
} 

*/
