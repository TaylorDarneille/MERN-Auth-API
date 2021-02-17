const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const { createUserToken, requireToken } = require('../middleware/auth')

// SIGN UP
// POST /api/signup
router.post('/signup', (req, res) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => ({
        motto: req.body.motto, 
        email: req.body.email, 
        password : hash 
    }))
    .then(hashedUser => User.create(hashedUser))
    //.then(createdUser => res.status(201).json(createdUser))
    .then(createdUser => createUserToken(req, createdUser))
    .then(token => res.status(201).json({token}))
    .catch(err => console.log('ERROR CREATING USER:', ERR))
})

// LOG IN
// POST /api/login
router.post('/login', (req, res)=>{
    console.log('????')
    User.findOne({email: req.body.email})
    .then(foundUser=>createUserToken(req, foundUser))
    .then(token=>res.json({token}))
    .catch(err => console.log('ERROR LOGGING IN:', ERR))
})

// PRIVATE
// GET /api/private
// this is an example of a protected route
// the client must send a valid token to get 
// the response from this route
router.get('/private', requireToken, (req, res)=>{
    return res.json({"message": "thou hath been granted permission to access this route!"})
})

module.exports = router