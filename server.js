/*
const express = require('express');
const app = express();

const admin_panelRoutes = require('./routes/admin_panel.js');
const loginRoutes = require('./routes/login.js');

// Use the route handlers
app.use('/admin_panel', admin_panelRoutes); // change '/admin_panel.js' to '/admin_panel'
app.use('/login', loginRoutes); // change '/login.js' to '/login'

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
*/


// define __dirname 
global.__basedir = __dirname;  // this is the base directory of our project
// it has public, node_modules, routes etc.


const express = require('express');
const app = express();


const appointment_requestRoutes = require('./routes/appointment_request.js');

const admin_panelRoutes = require('./routes/admin_panel.js');
const loginRoutes = require('./routes/login.js');

// Use the route handlers
app.use('/appointment_request', appointment_requestRoutes);
app.use('/admin_panel', admin_panelRoutes); // change '/admin_panel.js' to '/admin_panel'
app.use('/login', loginRoutes); // change '/login.js' to '/login'

// declaring static files under the public directory
app.use(express.static("public"));


// landing page.
app.get("/",(req, res) => {
  // send the file from the public/landing_page/index.html
  res.sendFile(__dirname + "/public/landing_page/index.html");
});

// randevu al
app.post("/randevu_al", (req, res) => {
  
});


//Warn!!! Bunun işlevini tam bilmiyorum. Kaldırılabilir.
app.set('view engine', 'ejs');


app.get("/dumen",(req, res) => {
  // send the file from the public/landing_page/index.html
  res.render('admin_panel/dumen');

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
