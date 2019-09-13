const mongoose = require('mongoose');
require('./stock.js');
const StockSchema = mongoose.model('Stock').schema;

const PositionSchema = new mongoose.Schema ({
    stocks: [StockSchema]
});

const Position = mongoose.model('Position', PositionSchema);

module.exports = Position;
