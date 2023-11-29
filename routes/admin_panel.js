const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
//console.log("Girdim1!");


const path = require("path");
const { URL } = require("url");
const dirName = path.dirname(require.main.filename);

//Form'un verilerini okumak için bu 3 satıra ihtiyaç var. req.body yapabilmek için gerekli. 
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(express.static(dirName + '/public'));







//localhost:3000/admin_panel/create_account'e post etmeli

//this will create new personel account. And will add it to database.
router.post('/create_account', async (req, res) => {
    let personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelTitle, personelClinic;
    //Buradaki verilerin boş olmadığını kabul ediyoruz.
    ({personelName, personelSurname, personelPhoneNum, personelEmail, personelPassword, personelTitle, personelClinic} = req.body);
    //console.log("Girdim2!");
    if(isStrongPassword(personelPassword) == false){
        console.log("password is not strong enough!");
        //BURAYA BİR EKRAN YA DA POP UP'IN GELMESİ GEREKİYOR.
        //res.render("create_dentist_account.ejs", { error: "password is not strong enough!" });

        //BELKI STATUSCODE 404 DE VERILMELİ BİLEMİYORUM
        res.status(404);

        return;
    }

    // there is no email verification. Because these datas will be added by admin.
    
    // Database'e bağlanıyoruz. (Burada database ismi vs değiişmeli!!!)
    await mongoose.connect("mongodb://localhost:27017/clinicDB", {useNewUrlParser: true});

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
    

    console.log("\nDatabase'e eklendi!");


});

function isStrongPassword(password) {
    // Define a regular expression pattern for a strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  
    // Test the password against the pattern
    return strongPasswordRegex.test(password);
} 


module.exports = router;