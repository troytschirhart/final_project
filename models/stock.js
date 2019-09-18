const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    symbol: String,
    name: String,
    shares: Number,
    cost: Number,
    price: Number,
    value: Number,
    profit: Number
});

const Stock = mongoose.model('Stock', StockSchema)

module.exports = Stock;
