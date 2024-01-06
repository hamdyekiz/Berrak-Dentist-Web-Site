
const date = document.getElementById("date");
date.innerHTML = new Date().getFullYear(); 
const navToggle = document.querySelector(".nav-toggle");
const linksContainer = document.querySelector(".links-container");





navToggle.addEventListener("click", function () {
  linksContainer.classList.toggle("show-links");
});




// local reviews data
const reviews = [
  {
    id: 1,
    name: 'özge aydın',
    img: 'https://lh3.googleusercontent.com/a-/ALV-UjVm_GbsWFTVuiLzmZ-Dh9-UeFA_WyDTCS60F-hsDCxXTQ=w68-h68-p-rp-mo-br100',
    text: "Uzun araştırmalarım sonucunda berrak ağız diş kliniği ve Özlem hocaya geldim .İşinde uzman, hasta kaygılarını en iyi anlayan ve çözüme kavuşturan Özlem hocanın o değerli ellerine bıraktım .Kesinlikle tavsiye ediyorum.",

    star: 4,
  },
  {
    id: 2,
    name: 'Sena Güler',
    img: 'https://lh3.googleusercontent.com/a/ACg8ocIJ1rgct8c9ULdKmZR-PE5b2sjOF1heHToyaZ7gwDh4=w68-h68-p-rp-mo-br100',
    text: 'Uzun süredir tedavi için buraya gidiyorum ilgili ve temiz bir klinik.Özlem Hanıma pek  çok işlem yaptırdım.Hepsinde aldığım sonuç kesinlikle tatmin ediciydi.Güleryüzlü ve ilgili bir diş hekimi. Sorduğunuz her soruya anlayabileceğiniz bir dille cevap veriyor.Gözünüz kapalı güvenebileceğiniz bir hekim.',
    star: 3,
  },
  {
    id: 3,
    name: 'RASİM ALBAYRAK',
    img: 'https://lh3.googleusercontent.com/a-/ALV-UjXbS3klJdGBZ_i24C6rpt_b42538ST-lmkacrGXmpxghc0=w68-h68-p-rp-mo-br100',
    text: 'Dünyanın en iyi diş hekimi Özgür Bey bence Allah hayırlı sağlıklı bir ömür nasip etsin İnşallah.',
    star: 2,
  },
  {
    id: 4,
    name: 'Vesile Kurt',
    img: 'https://lh3.googleusercontent.com/a/ACg8ocJMu0IkoAlRUFoUj4nFMOxCQothtfuE6OWkm0d8ZPEU=w68-h68-p-rp-mo-br100',
    text: 'Özlem aydın hocamıza ilgisi alakası güler yüzü icin çok teşekkürler gönül rahatlığıyla kesinlikle tavsiye ederim🤗🤗🤗🤗',
    star: 5,
  },

  {
    id: 5,
    name: 'Aytaç Yıldırım',
    img: 'https://lh3.googleusercontent.com/a-/ALV-UjUa-4ZZbwD1QTG2ZDR53HcG_-oqleI2TEkCvCTkUX6hYKg=w68-h68-p-rp-mo-br100',
    text: 'Özlem Hocayla tanışmadan önce onlarla dişçiyle haşır neşir biri olarak Özlem hoca’nın çok ilgili ve işinde de çok iyi olduğunu gönül rahatlığıyla söyleyebilirim. Yani gönül rahatlığıyla gidebileceğiniz fiyat performans bie dişçi ama performansın daha da artması için Özlem hocayı öneririm her şey için teşekkürler.',
    star: 5,
  },
];
// select items
const img = document.querySelector('.review__img');
const author = document.querySelector('.review__text');
const info = document.querySelector('.review__');
const stars = document.querySelectorAll('.stars .fa.fa-star');

const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

console.log(stars);
// set starting item
let currentItem = 0;

// load initial item
// Load initial item
// Load initial item
window.addEventListener('DOMContentLoaded', function () {
  showPerson(currentItem)
});



function showPerson(person) {
  const item = reviews[person];
  img.src = item.img;
  author.textContent = item.name;
  info.textContent = item.text;

  stars.forEach(function (star, index) {
    star.classList.remove('checked');
    if (index < item.star) { // Subtract 1 to account for 0-based index
      star.classList.add('checked');
    }
  });

}

// show next person
nextBtn.addEventListener('click', function () {
  currentItem++;
  if (currentItem > reviews.length - 1) {
    currentItem = 0;
  }
  showPerson(currentItem);
});
// show prev person
prevBtn.addEventListener('click', function () {
  currentItem--;
  if (currentItem < 0) {
    currentItem = reviews.length - 1;
  }
  showPerson(currentItem);
});