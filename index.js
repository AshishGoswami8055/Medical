require('dotenv').config();
require("./config/passportJWT")

// server and database
const express = require('express');
const db = require('./config/db');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const path = require('path');

// passport
const passport = require("passport");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads',express.static(path.join(__dirname, 'uploads')));

app.use(passport.initialize());
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/chemist', require('./routes/chemist.routes'));
app.use('/api/mr', require('./routes/MR.routes'));
app.use('/api/stockist', require('./routes/stockist.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/order', require('./routes/order.routes'));

// app.use('/api/salesman', require('./routes/salesman.routes'));

app.listen(port, (err) => {
    err ? console.log(err) : console.log(`Server is running on port ${port}`);
});
