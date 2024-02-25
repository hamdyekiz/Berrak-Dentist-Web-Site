const navToggle = document.querySelector(".nav-toggle");
const linksContainer = document.querySelector(".links-container");


console.log(navToggle);
console.log(linksContainer);

navToggle.addEventListener("click", function () {
  linksContainer.classList.toggle("show-links");
});