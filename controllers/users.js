// =============================================================================
//  USERS.JS => CONTROLLER FOR USERS
// =============================================================================

// ===================================== Dependencies
const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const bcrypt = require('bcrypt');


// =============================================================================
//  USER CONTROLLER ROUTES
// =============================================================================
// ===================================== Create User
router.post('/', (req, res) => {
    req.body.password = bcrypt.hashSync(req.body.password,
    bcrypt.genSaltSync(10));
    User.create(req.body, (err, createdUser) => {
        res.status(201).json({
            status: 201,
            message: 'user created'
        })
    })
})

// ===================================== Push a created stock to positionList
router.put('/:id', (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        console.log(foundUser);
        console.log(req.body.stock);
        foundUser.positionList.unshift(req.body.stock);
        foundUser.save((err, savedUser) => {
            // save the updtaed foundUser
        })
        console.log('updated foundUser: ', foundUser);
        res.status(201).json({
            status: 201,
            message: 'stock stored in user'
        })
    })
})

// ===================================== Read stocks from user's positionList
router.get('/:id', (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            console.log('read stocks: ', foundUser.positionList);
            res.json(foundUser.positionList)
        }
    })
})

// ===================================== Update a stock from user's positionList
router.put('/:user/:id', (req, res) => {
    User.findById(req.params.user, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            // Find the index of the stock in the user's positionList
            console.log('req.params: ', req.params);
            let idString = req.params.id.toString();
            console.log('idString: ', idString);

            let checkID = [];
            for (let i = 0; i < foundUser.positionList.length; i++) {
                checkID[i] = foundUser.positionList[i]._id.toString()
            }
            console.log('checkID: ', checkID);

            function isRightIndex (positionNo) {
                return (positionNo == idString)
            }
            let index = checkID.findIndex(isRightIndex)

            console.log('index: ', index);

            if (index !== -1) {
                // remove the original position and add the updated position
                foundUser.positionList.splice(index, 1, req.body.stock)
                foundUser.save((err, savedUser) => {
                    // save the updated foundUser
                })
                console.log('foundUser after replacement splice: ', foundUser);
                res.json(foundUser)
            } else {
                res.status(400).json({
                    status: 400,
                    message: 'unsuccessful attempt to update selected position'
                })
            }

        }
    })

})

// ===================================== Delete a Position from positionList
router.delete('/:user/:id', (req, res) => {
    User.findById(req.params.user, (err, foundUser) => {
        if (err) {
            console.log(err);
        } else {
            // Find the index of the stock in the user's positionList
            console.log('req.params: ', req.params);
            let idString = req.params.id.toString();
            console.log(idString);

            let checkID = [];
            for (let i = 0; i < foundUser.positionList.length; i++) {
                checkID[i] = foundUser.positionList[i]._id.toString()
            }
            console.log('checkID: ', checkID);

            function isRightIndex (stockNo) {
                return (stockNo == idString)
            }
            let index = checkID.findIndex(isRightIndex)

            console.log(index);

            if (index !== -1) {
                // delete the stock from the positionList
                foundUser.positionList.splice(index, 1)
                foundUser.save((err, savedUser) => {
                    // save the updated foundUser
                })
                console.log('foundUser after delete splice: ', foundUser);
                res.status(201).json({
                    status: 201,
                    message: 'position deleted from positionList array'
                })
            } else {
                res.status(400).json({
                    status: 400,
                    message: 'unsuccessful attempt to delete selected position'
                })
            }
        }
    })
})


// ===================================== Export Router
module.exports = router;
