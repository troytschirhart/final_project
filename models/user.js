const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('./position.js');
require('./stock.js');
const PositionSchema = mongoose.model('Position').schema;
const StockSchema = mongoose.model('Stock').schema;

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    positionList: [StockSchema]
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
