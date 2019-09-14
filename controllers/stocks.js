//==============================================================================
//  STOCKS.JS => CONTROLLER FOR STOCK OBJECTS
//==============================================================================

// ===================================== Dependencies
const express = require('express');
const router = express.Router();
const Stocks = require('../models/stock.js')

// =============================================================================
//  STOCKS CONTROLLER ROUTES
// =============================================================================
// ===================================== Create Stock
router.post('/', (req, res) => {
    Stocks.create(req.body, (error, createdStock) => {
        res.json(createdStock)
        console.log('created stock: ', createdStock);
    })
})

// ===================================== Update Stock
router.put('/:id', (req, res) => {
    Stocks.findByIdAndUpdate(req.params.id, req.body, {new: true},
    (error, updatedStock) => {
        res.json(updatedStock)
        console.log('updated stock: ', updatedStock);
    })
})

// ===================================== Export Router
module.exports = router;
