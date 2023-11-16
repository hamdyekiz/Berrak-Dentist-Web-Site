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
