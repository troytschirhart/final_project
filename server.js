// =============================================================================
//  SERVERS.JS => THIS FILE IS THE ENTRY POINT; IT SETS EVERYTHING UP
// =============================================================================

// ===================================== Dependencies
const express = require('express');
const app = express();
// Require 'dotenv' because it contains the MongoDB Atlas project link
require('dotenv').config();
const session = require('express-session');
const mongoose = require('mongoose');
const db = mongoose.connection;
const PORT = process.env.PORT || 3000;

// ===================================== Middleware
app.use(express.static('public'));     // Use public folder for static assets
app.use(express.json());               // Middleware that parses JSON
app.use(session({                      // parameters for creating user sessions
    secret: 'cavaliergrandcherokee',
    resave: false,
    saveUninitialized: false
}));

// ===================================== Database
// Set a const for the link to the database on Atlas
const FINALPROJECT_DB = process.env.FINALPROJECT_DB;

// Suppress deprication warnings from Mongoose
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// Connect to the database
mongoose.connect(FINALPROJECT_DB, {useNewUrlParser: true, useUnifiedTopology: true });

// Announce that the connection has been opened
mongoose.connection.once('open', () => {
    console.log('connected to mongo ...');
})

// ===================================== User Session Route
app.get('/app', (req, res) => {
    if(req.session.currentUser){
        res.json(req.session.currentUser);
    } else {
        res.status(401).json({
            status: 401,
            message: 'not logged in'
        })
    }
})

// ===================================== Controllers

const stockController = require('./controllers/stocks.js');
app.use('/stocks', stockController);

const userController = require('./controllers/users.js');
app.use('/users', userController);

const sessionsController = require('./controllers/sessions.js');
app.use('/sessions', sessionsController);

// ===================================== Listeners
app.listen(PORT, () => {
    console.log('Listening to port: ', PORT);
})
