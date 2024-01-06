const date = document.getElementById("date");
date.innerHTML = new Date().getFullYear(); 
const navToggle = document.querySelector(".nav-toggle");
const linksContainer = document.querySelector(".links-container");
navToggle.addEventListener("click", function () {
    linksContainer.classList.toggle("show-links");
});


