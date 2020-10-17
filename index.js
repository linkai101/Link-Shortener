const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const path = require('path');
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main');


// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/homepage'));

app.use('/api', require('./routes/api'));

app.use('/', require('./routes/links')); // Links

// 404 route
app.use(function(req, res, next) {
    res.status(404);
    res.type('txt').send('404: Not found');
});

// 500 route
app.use(function(error, req, res, next) {
    res.status(500);
    res.type('txt').send(`500: Internal server error\n${error}`);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});


