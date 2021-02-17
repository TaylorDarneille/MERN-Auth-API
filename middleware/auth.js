const passport = require('passport')
const Strategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')

const options = {
    secretOrKey: process.env.JWT_SECRET,
    // How passport should find and extract the token from the request.
    // It's a function that accepts a request as the only parameter 
    // and returns either the JWT as a string or null. 
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const findUser = (jwt_payload, done) => {
    User.findById(jwt_payload.id)
      .then(foundUser => done(null, foundUser))
      .catch(err => done(err))
}

// construct the strategy
const strategy = new Strategy(options, findUser)

// Now that we've constructed the strategy, we 'register' it so that
// passport uses it when we call the `passport.authenticate()`
// method later in our routes
passport.use(strategy)

// Initialize the passport middleware based on the above configuration
passport.initialize()

const createUserToken = (req, user) => {
    // first, we check the password using bcrypt (you'll need to import it!)
    const validPassword = req.body.password ? 
        bcrypt.compareSync(req.body.password, user.password) : false
    // The following is equivalent:
        // const validPassword
        // if(req.body.password) {
        //     validPassword = bcrypt.compareSync(req.body.password, user.password)
        // } else {
        //     validPassword = false
        // }
    // if we didn't get a user or the password wasn't validated, then throw error
    if(!user || !validPassword){
        const err = new Error('The provided username or password is incorrect')
        err.statusCode = 422
        throw err
    } else { // otherwise create and sign a new token
        const payload = {
            id: user._id,
            email: user.email,
            motto: user.motto
        }
        return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 3600})
    }
}

// Create a variable that holds the authenticate method so we can
// export it for use in our routes
const requireToken = passport.authenticate('jwt', {session: false})

module.exports = { createUserToken, requireToken }