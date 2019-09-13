const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    symbol: String,
    shares: Number
});

const Stock = mongoose.model('Stock', StockSchema)

module.exports = Stock;
