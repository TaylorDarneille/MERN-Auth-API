[![General Assembly Logo](https://camo.githubusercontent.com/1a91b05b8f4d44b5bbfb83abac2b0996d8e26c92/687474703a2f2f692e696d6775722e636f6d2f6b6538555354712e706e67)](https://generalassemb.ly/education/web-development-immersive)

# Express API & Authentication

Throughout this tutorial, we'll build an Express API as the back end to a boilplate application that has users and authenticates them using Passport middleware.

## Basic Express API Setup

First let's quickly set up a basic project environment.

### Scaffold the Project

1. From the command line, create a new directory and switch into it with `mkdir MERN-AUTH-API && cd MERN-AUTH-API`.
1. Run `git init` to initialize the repository for Git.
1. Create a `.gitignore` and add the node_modules directory to it with `echo node_modules > .gitignore`
1. Creat a `.env` file with `touch .env`
1. Create an entry point (or main file) with `touch server.js`.
1. Create some directories inside your project to organize your code with `mkdir models db controllers middleware`.
1. Run `npm init -y` to initialize the repository for npm.
1. Install dependencies with `npm i express cors mongoose dotenv`.
1. Open the directory in VS Code with `code .`.

1.  Create your directory folders:
<!-- INIT_DIRECTORY_DIAGRAM - START -->
```md
MERN-AUTH-API
    ├── index.js
    ├── controllers
    ├── middleware
    └── models
```
<!-- INIT_DIRECTORY_DIAGRAM - START -->
<!-- prettier-ignore-end -->

12. Save, add, and commit your files:

```bash
git add .
git commit -m "Initial commit"
```

13. Create a new repository on GitHub and copy the code in the section that reads: **`…or push an existing repository from the command line`** by clicking the copy icon on the right side of the code block.
1. Paste the code in the Terminal window.

### Set up cluster on Atlas

First, let's set our app up to use Atlas instead of our local mongo database.

[DOCS](https://docs.atlas.mongodb.com/getting-started/)

1. Create a an account [here](https://account.mongodb.com/account/register)

2. Create a free tier cluster by following [these instructions](https://docs.atlas.mongodb.com/tutorial/deploy-free-tier-cluster/)
 * **NOTE:** Step 3's screenshots haven't been updated so it may look a little different when you do it. Just make sure to choose the *free* tier.
 * **TODO:** Add notes about why you may pick one region over another.
3. Go to Securty > Network Access (from menu on left of page) to [Whitelist your IP address](https://docs.atlas.mongodb.com/tutorial/whitelist-connection-ip-address/)
 * Whitelist your current IP address and also click the *allow access from anywhere* button
4. Go to Security > Database Access to [add a user](https://docs.atlas.mongodb.com/tutorial/create-mongodb-user-for-cluster/)
 * **NOTE:** Make sure you know the password!!!
5. [Connect your cluster](https://docs.atlas.mongodb.com/tutorial/connect-to-your-cluster/):
 * Click "connect", then "connect your application"
 * choose the NodeJS driver for step 1
 * copy the connection string from step 2 (we'll use it in the next step)

### Connect to MongoDB

1. Create a file in the `models` directory called `index.js` and add the following code:

```js
const mongoose = require('mongoose');
const MONGODB_URI = `<put your connection string here>`

mongoose.connect(MONGODB_URI)

mongoose.connection.once('open', () =>
  console.log(`🔗 Connected to db: ${mongoose.connection.name}`)
)
mongoose.connection.on('error', err => 
  console.log('🔥 Connection failed!', err)
)

module.exports = mongoose;
```

Make sure to add a db username and password and name to the appropriate parts of the connection string. For example: `mongodb+srv://sei:seisei@sei-mern-auth.a0ell.mongodb.net/SEI-MERN-Auth?retryWrites=true&w=majority`

2.Back in the Terminal make sure you're in the `MERN-AUTH-API` directory and run the file to test your connection using NodeJS with `node models/index.js`. If you get a `Connection failed` error or do not see `Connected to db: job-board`, [check and make sure that your MongoDB server is running](https://git.generalassemb.ly/seir-129/mongo-install-homework). Otherwise, you should see output similar to the following:

```bash
(node:48059) DeprecationWarning: current URL string parser is deprecated, and will be removed
in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
(node:48059) DeprecationWarning: current Server Discovery and Monitoring engine is deprecated,
and will be removed in a future version. To use the new Server Discover and Monitoring engine,
pass option { useUnifiedTopology: true } to the MongoClient constructor.
Connected to db: job-board
```

3. Let's get rid of the warnings by modifying the `mongoose.connect()` method like so [mongoose deprecation docs](https://mongoosejs.com/docs/deprecations.html):

```js
mongoose
  .connect(DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  ...
```

4. Back in the Terminal, type `control + C` to stop the process that's running and return to the command prompt. Now, try running the `index.js` file again with `node models/index.js`. This time you should only see the connection message.

5. Great! But, we know that this API isn't always going to be run on our Atlas cluster, so we should use an environment variable for the connection string. 

* Move your connection string to be an environment variable by putting it in your `.env` file, then import and configure `dotenv` at the top of `models/index.js`.

* You'll also need to change the `connect` argument to include the `process.env.MONGODB_URI`. 

6. Finally, export your connected mongoose instance for use in other files by adding `module.exports = mongoose`

The completed file will look like this:

```js
// Import dotenv and configure it for use in this file
require('dotenv').config()
// Import Mongoose to interface with MongoDB
const mongoose = require('mongoose');

// Use Mongoose's connect method to connect to MongoDB by passing it the db URI.
// Pass a second argument which is an object with the options for the connection.
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  // If the connection is successful, give a message in the Terminal with the db name
  .then(instance =>
    console.log(`Connected to db: ${instance.connections[0].name}`)
  )
  // If the connection fails, give a message and pass along the error so we see it in
  // the Terminal.
  .catch(error => console.log('Connection failed!', error));

// Export the connection so we can use it elsewhere in our app, we will change this eventually
module.exports = mongoose;
```

6. Save and close the file in VS Code and back in the Terminal, type `control + C` to stop the process that's running and return to the command prompt. Add and commit your changes!

### Setup a Server

1. In the `server.js` file lets create a basic Express server and get it running. We need to require Express and store it in a variable called `express`. Then we'll invoke express to instantiate the Express application object and store that in a variable called `app`. Finally, we'll listen on port 8000 for requests and add a callback so we know its running. The basic server looks like this:

```js
const express = require('express');
const app = express();

app.listen(8000, () => {
  console.log('listening on port 8000');
});
```

2. Use `nodemon` to run the server.

3. This server doesn't do anything at all, so lets build it out a bit more. We know we'll be adding our routes in here so let's require `mongoose` and while we're at it import the [cors package](https://www.npmjs.com/package/cors) and set up the middleware. Remember, to use a middleware in Express we need to pass it to the `app.use()` method.
4. We're also going to have to use two of the built-in middleware packages since we're going to be making requests via AJAX to the server, so add `app.use(express.json())` and `app.use(express.urlencoded({ extended: true }))`.
5. Lastly, again, we know that eventually we'll be running this on a remote server, so lets create a PORT environment variable. We can assign the variable the value of the PORT environment variable that will be set in Heroku OR if that environment variable doesn't exist, it should use 8000.

The completed file should look like this when done:

```js
// Require necessary NPM packages
const express = require('express');
const mongoose = require('./models');
const cors = require('cors');

// Instantiate express application object
const app = express();

// The `.use` method sets up middleware in Express

// Set up cors middleware and make sure that it
// comes before our routes are used.
app.use(cors());

// The urlencoded middleware parses requests which use
// a specific content type (such as when using Axios)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Run server on designated port
app.listen(process.env.PORT || 8000, () => {
  console.log(`🎧 You're listening to the sounds of Port ${process.env.PORT || 8000} 🎧`)
})
```

### Create the User Model

1. Create a new file in the `models` directory called `user.js`.
2. Create a basic user model. To keep things simple, our model is going to be super streamlined with just `email` and `password` fields. We'll also add a timestamp [option](https://mongoosejs.com/docs/guide.html#options) so we automatically get the `createdAt` and `updatedAt` fields.

```js
const mongoose = require('mongoose');
const options = {
  timestamps: true
}
const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
}, options)

module.exports = mongoose.model('User', userSchema);
```
3. Add it to your `index.js` file as an export!

```js
require('dotenv').config();
const mongoose = require('mongoose');
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

mongoose.connection.once('open', () =>
  console.log(`🔗 Connected to db: ${mongoose.connection.name}`)
)

mongoose.connection.on('error', err => 
  console.log('🔥 Connection failed!', err)
)

module.exports.User = require('./user');

```

### Test User Model

Create a `models/userTest.js` file and import the user model. Add mongoose code to create a new user ([mongoose docs for inserting](https://mongoosejs.com/docs/models.html#compiling)):

```js
const db = require('./index');

db.User.create({
    email: 'test@test.com',
    password: 'testpassword'
}, (err, createdUser) => {
    if (err) console.log('Error added test user', err)
    else console.log('success!', createdUser)
    process.exit()
});
```
Run `node db/userTest.js` and check that the test user was added successfully (you'll see the console log if it did, but also look in your collection on Atlas)!

### Create Routes for the User Resource

1. Create a new file in the `controllers` directory called `users.js`.
1. Require express, the user model, and create a router and export it:

```js
const express = require('express');
const router = express.Router();

// routes/controllers here

module.exports = router;
```

You'll also need to write the controller middleware for users in `server.js`:



1. Stub out the routes for our user resource. They will be:

- /signup: a POST route that will create a new user in the database
- /login: a POST route that will create a new authorization token for the user

```js
// SIGN UP
// POST /api/signup
router.post('/signup', (req, res) => {
    res.send('hit signup post route')
})

// Log IN
// POST /api/signin
router.post('/login', (req, res) => {
    res.send('hit login post route')
})
```

Import the user controllers to `server.js` underneath any other middleware you have:

```js
// Import the user resource actions
app.use('/api', require('./controllers/users'))
```

Test that these routes are being hit via Insomnia!

3. Import the `User` model into your users controller via the `index.js`
`const db = require('../models')`

4. Add create to the signup controller:

```js
router.post('/signup', (req, res, next) => {
  db.User.create(req.body)
    .then((createdUser) => res.send(createdUser))
    .catch(err=>{
      console.log('Oops, there was an error creating the user!')
    })
})
```

Use Insomnia to sign up a new user!

5. We're building an API that will send data in JSON format, so let's be legit and use the [JSON response method](http://expressjs.com/en/api.html#res.json) provided by express. 

```js
router.post('/signup', (req, res, next) => {
  User.create(req.body)
    .then(createdUser => res.json(createdUser)) 
    .catch(err => {console.log(err)})
})
```

In order for this to work, we also have to include the [express JSON middleware](http://expressjs.com/en/api.html#express.json) in `index.js`:

```js
// Add `express.json` middleware which will
// parse JSON requests into JS objects before
// they reach the route files.
app.use(express.json());
```

Check out [this medium article](https://medium.com/gist-for-js/use-of-res-json-vs-res-send-vs-res-end-in-express-b50688c0cddf) or the express docs to learn more about the differences between `.json` and `.send`.

Try signing up another user to make sure all is still functioning. You shouldn't notice any difference in behavior of your app.

### Prevent Passwords from Being Sent to Clients

You may have noticed that when you created a new user, you got back a user document with the user's password. That's a huge security hole in our API right now. We can fix it using Mongoose [Virtuals](https://mongoosejs.com/docs/tutorials/virtuals.html) pretty easily though. Virtuals are used to transform data without persisting the transformation in MongoDB. We'll create a virtual that will automatically remove the password field any time we use a toJSON method (including `JSON.stringify()`, Mongoose's `.toJSON()` method or Express' `.json()` method). Even though the field is being deleted by the virtual, it remains safe and sound in our database.

1. Open the `models/User.js` file.
1. Update the schema as follows to add a virtual:

```js
const options = { 
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform: (_doc, userDocToReturn) => {
            delete userDocToReturn.password
            return userDocToReturn
        }
    },
}
```

Create a new user in Insomnia. :tada: No more password being sent! However, it seems we introduced another issue. Now, we have both an `_id` and an `id` field. Technically, this additional `id` field is just a virtual because we used a toJSON virtual. You can verify that itʼs not storing the value in MongoDB separately. If it bugs you, you can add `id: false` as a key/value pair in the options object that has the `timestamps` and `toJSON` properties.

### Store a Hashed Password

We're breaking a cardinal rule of user security by saving the user's password in plain text. Even in a-just-for-fun, non-commercial app, we're opening ourselves up to financial liability and risking the security of users who often reuse the same password on multiple sites. So lets fix that, shall we?

When it comes to storing password data securely, the only thing we can do is not store it at all. Instead we should store a hash of the password. Hashing is a **one-way function**. Hashed values are not designed to be reversed to obtain the original input value like encrypted values, which are designed to be decrypted. If you apply the same hashing algorithm to the same value you'll always get the same hash though. That means we can store the hash of the password and when users sign into the system, we can hash the password they send and compare it with the hash in the database to verify that they provided the correct password.

1. We'll use a popular npm package called `bcrypt` to hash our passwords, so in the Terminal run `npm i bcrypt`.
1. Require the `bcrypt` package in your `controllers/users.js` file with `const bcrypt = require('bcrypt');`.
1. To hash the password, we'll use the `bcrypt.hash()` method which takes two arguments. The first argument is the value we want to hash and the second is the number of salt rounds. Salting is a way to make the hash stronger. Each time the value is salted, it is transformed in some way by adding another value to it. The more times you salt, the more the original value is changed and obscured. We're going to use `10` salt rounds. The bcrypt `.hash()` method is asynchronous.

```js
  ...
const bcrypt = require('bcrypt');
  ...

//Using promise chain
router.post('/signup', (req, res) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => db.User.create({email: req.body.email, password : hash }))
  .then(createdUser => res.json(createdUser))
  .catch(err => {console.log('ERROR CREATING USER:', ERR)})
})
```

Create a new user with a different email address in Insomnia. If you look in Mongo, you should see that the password is now hashed and looks something like this:

```json
"password" : "$2b$10$5g62t1K7SUovJ2.XonHfy.kiDWQr/UEpR1ha8DSwAWWpBob5WXAKy"
```
If your passwords are hashed, add and commit your changes.

## Add Authentication

In this part of the tutorial, we'll be tackling the steps needed to add authentication to our app. We'll be using [Passport](http://www.passportjs.org/) to simplify the authentication process. To use Passport, we need to install it in our app along with one (or more) of the over [500 strategies](http://www.passportjs.org/packages/) it offers for authentication. For this tutorial, we'll be employing a strategy which uses JSON Web Tokens ([JWT](https://jwt.io/introduction/)).

JWT is an open standard and an excellent choice for modern applications based on REST architectures. The fundamental premise of the REST architectural style is that the **server does not store any state** about the client session on the server side, hence the name Representational **State Transfer**. In REST, every HTTP request happens in complete isolation. It is up to the client to send (i.e., transfer) whatever state is needed to carry out the request. JWT provides a lightweight approach to transferring state from the client to the server in a secure fashion.

### Configure Passport

Each Passport strategy has to be configured for your specific app. Basically, Passport gives us a callback and we fill it in with any logic needed to get the user from our database that matches some bit of data that Passport extracts from a request. After configuring the strategy with the code to retrieve the user from the database, we register the strategy, and initialize Passport.

Once initialized, weʼll run the passport strategy as route middleware. When run as middleware, Passport receives the request, extracts the user information from the token, then attaches the user info back to the request object so it is accessible by whatever action (route) it hits.

1. Create a new file in the `middleware` directory called `auth.js`.
2. Install passport
```bash
npm i passport
```
3. import it into `auth.js`. Stub out the generic passport structure:

```js
const passport = require('passport')

// construct the strategy (TODO)
const strategy

// 'Register' the strategy so that passport uses it
//  when we call the `passport.authenticate()`
//  method later in our routes
passport.use(strategy)

// Initialize the passport middleware based on the above configuration
passport.initialize()
```

4. Install passport's [JWT strategy](http://www.passportjs.org/packages/passport-jwt/)
```bash
npm i passport-jwt
```
5. import the `Strategy` constructor from `passport-jwt and construct the strategy:
```js
const passport = require('passport')
const Strategy = require('passport-jwt').Strategy

// construct the strategy (will define options and findUser soon)
const strategy = new Strategy(options, findUser)

...
```
6. Create an `options` object that we'll pass into the `Strategy` constructor.
```js
const Strategy = require('passport-jwt').Strategy

const options = {}

// construct the strategy (will define options and findUser soon)
const strategy = new Strategy(options, findUser)
```
7. The options object requires a `secretOrKey` field

```js
const Strategy = require('passport-jwt').Strategy

const options = {
  secretOrKey: 'some string value only your app knows'
}

// construct the strategy (will define options and findUser soon)
const strategy = new Strategy(options, findUser)
```
> Because this is a secret string, it should be stored in an `.env` file. We will do this later


8. The other required option field is `jwtFromRequest`. This has to be a function that accepts the request object as the only parameter and returns either the JWT as a string or null. This is called an *extractor function* because extracts and deserializes the JWT from the request object. Passport provides several built-in extractor functions and we will use `fromAuthHeaderAsBearerToken()`, which looks for the JWT in the authorization header with the scheme 'bearer'. Visit the passport docs on [extracting the JWT from the request](http://www.passportjs.org/packages/passport-jwt/#extracting-the-jwt-from-the-request) for more details.

```js
const Strategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const options = {
    secretOrKey: 'some string value only your app knows',
    // How passport should find and extract the token from the request.
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}
```

9. Now we need to write the verification callback that gets passed as the second argument to the `Strategy` constructor. This callback is where we write custom code to go get the user's info from the database based on the token info. It will receive two arguments automatically:
* The deserialized JWT payload that has been extracted from the request object, which will contain the user's id
* A `done` callback that is ready to receive the user object and pass it onto our routes. It takes any errors that happen along the way as the first argument, and the user object as the second.

```javascript
const db = require('../models')

const findUser = (jwt_payload, done) => {
  db.User.findById(jwt_payload.id)
    .then(foundUser => done(null, user))
    .catch(err => done(err))
}
```

10. Each time the user logs in, we'll need to create a token for them. We will create a function that uses the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) `.sign` method to turn the user id and secret into a JWT using the RSA SHA256 algorithm. RSA SHA256 will first hash the user id and the secret using the SHA256 algorithm, then encrypt that hash using the RSA algorithm.

 First install the package and import it into the `auth.js` file:
```bash
npm install jsonwebtoken
```
```js
const jwt = require('jsonwebtoken')
```

11. Now we import bcrypt and write the function to be exported:

```javascript
...
const bcrypt = require('bcrypt')
...

// Initialize the passport middleware based on the above configuration
passport.initialize()

// we will export this and use it in the login route to create a token each time a user logs in
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
```

12. Now export `createUserToken` at the bottom of `auth.js` so we can use it in our `/api/login` route. So far, your `auth.js` should look like this:

```javascript
const passport = require('passport')
const Strategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../models')

const options = {
    secretOrKey: 'some string value only your app knows',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

const findUser = (jwt_payload, done) => {
    db.User.findById(jwt_payload.id)
      .then(foundUser => done(null, user))
      .catch(err => done(err))
}

const strategy = new Strategy(options, findUser)

passport.use(strategy)

passport.initialize()

const createUserToken = (req, user) => {
    const validPassword = req.body.password ? 
        bcrypt.compareSync(req.body.password, user.password) : false
    if(!user || !validPassword){
        const err = new Error('The provided username or password is incorrect')
        err.statusCode = 422
        throw err
    } else { 
        return jwt.sign(
          { id: user._id },  
          'some string value only your app knows', 
          {expiresIn: 3600}
        )
    }
}

module.exports = { createUserToken }
```
### Update Auth routes to respond with token

1. Import `createUserToken` into the users controller so we can call it in our routes:
```js
const { createUserToken } = require('../middleware/auth')
```

2. Update signup route to send back token instead of the user:
```js
router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => db.User.create({email: req.body.email, password : hash }))
  .then(createdUser => res.json({ token: createUserToken(req, createdUser) }))
  .catch(err => {
    console.log(err)
    res.json({'error': err})
  })
})
```

3. Finish login route:
```js
// POST /api/login
router.post('/login', (req, res)=>{
  db.User.findOne({ email: req.body.email })
  .then(foundUser => res.status(200).json({ token: createUserToken(req, foundUser) }))
  .catch(err=> {
    console.log('ERROR LOGGING IN:', err)
    res.json({ 'error': err})
  })
})
```
Now use Insomnia to try out both of these routes. You should get a token as the response!

Head over to [jwt.io](https://jwt.io/) to see your token decoded and you can read about the anatomy of a JSON Web Token [here](https://scotch.io/tutorials/the-anatomy-of-a-json-web-token).

4. Now that we know everything is working right, let's move our secret to our `.env` and make it an environment variable called `JWT_SECRET`.

```
JWT_SECRET=some string value only your app knows
```

Make sure to change your secret to `process.env.JWT_SECRET` in `auth.js` where you set the `options` object, and also where you call `jwt.sign`

Test it one more time to make sure all is good by logging in a user again (you may need to restart nodemon).

We're so close to done now! All that's left is to set up our job route to use the token! Add and commit your changes.

### HTTP Status Codes

Our Express API is coming along, but before we add our User model, we need to fix some things. So far, we're kind of breaking a lot of rules when it comes to the HTTP request-response cycle. For one, we're not responding to **all** requests &mdash; only the ones that execute flawlessly. We're not handling any of the error cases. ExpressJS will help us out with some errors by sending a generic 500 server error, but in many cases, we're on our own and the system is simply left to hang :frowning:.

Another issue is that we're not setting the status codes on our responses, so every successful response is the default `200 OK`. Setting acurate status codes is not simply prescribed by REST architecture best practices. [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) are part of the rules defined by HTTP that govern the Web! Plus, it turns out that it's really easy to change the status codes within Express APIs, so letʼs do that:

1. Add a [201 status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201) to the sign up response:
```js
router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => db.User.create({email: req.body.email, password : hash }))
  .then(createdUser => res.status(201).json({ token: createUserToken(req, createdUser) }))
  .catch(err => {
    console.log(err)
    res.json({'error': err})
  })
})
```

> What status code would you add to the catch clause?

## Add Authorization

Along with authenticating the user, we now have to handle user authorization. What's the difference? When the user logs into the system successfully, we _authenticate_ them based on the credentials they send (such as a proper combination of email and password). Authorization means determining whether the user is actually authorized to perform some action in the system.

Let's add a dummy route to our API to see how to protect a route:

Add the following route to your users controller:

```js
// PRIVATE
// GET /api/private
router.get('/private', (req, res)=>{
    return res.json({"message": "thou hath been granted permission to access this route!"})
})
```

Try hitting this route in postman. No problem, right? Wrong! This means any joe blow could hit this route, logged in or not! Let's add the the passport middleware that allows us to authenticate the user based on the token sent by the client.

1. Start by importing Passport at the top:
```js
const passport = require('passport')
```

1. Then add the `passport.authenticate` middleware to the route:

```js
// PRIVATE
// GET /api/private
// this is an example of a protected route
// the client must send a valid token to get 
// the response from this route
router.get('/private', passport.authenticate('jwt', {session: false}), (req, res)=>{
    return res.json({"message": "thou hath been granted permission to access this route!"})
})
```

Now try to hit the route in postman - what happens? You're not authorized!

1. You will likely have several routes that need this middelware, so let's make writing it out a little more concise. Store this method in a variable called `requireToken` at the bottom of `auth.js` and add it to the export:

```js
// Create a variable that holds the authenticate method so we can
// export it for use in our routes
const requireToken = passport.authenticate('jwt', {session: false})

module.exports = { createUserToken, requireToken }
```

1. Now just add `requireToken` to the import at the top of the user controller, and replace it in the route arguments:

```js
...
const { createUserToken, requireToken } = require('../middleware/auth')
...
router.get('/private', requireToken, (req, res)=>{
    return res.json({"message": "thou hath been granted permission to access this route!"})
})
```

### Set the Authorization Header in the Request

1. Log in or sign up a user and copy the token string
1. Open the request you created for the post to the `/api/private` route.
1. In the toolbar below the request URL input field, click the **Headers** tab.
1. Add a header with `Authorization` set for the key and `Bearer <token no quotes or brackets>` set for the value.

With the token, we can determine which user is making a request. With that information, we can determine if the specific user making the request is _authorized_ to carry out a specific action, such as create documents or delete or update a specific document. What sorts of routes will you want to protect in your Project 3?

## Handling Authentication in React

In terms of making the Fetch or Axios requests to the API in React, you'll now have to add the `Authorization` header to authenticated requests, such as:

```js
axios({
  url: `${APIURL}/jobs`
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${props.token}`
  },
  data: job
});

/*** ALTERNATIVELY USING FETCH ***/

fetch(`${APIURL}/jobs`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${props.token}`
  },
  body: JSON.stringify(job)
});
```

One approach to handling the token is to use React's built in Context API to store the value when it is returned after the user logs in. [Storing the user and accessing via useContext Hook](https://www.youtube.com/watch?v=lhMKvyLRWo0) is easier than passing around the token via props and eliminates prop drilling entirely.

Alternatively, you can create state to hold your user in the App.js, along with a method to set the user state and pass that as a prop to your signin form's `handleSubmit` method. When the AJAX call to your server is successful and you get the token back from the API, you can call the method that sets the token in state in App. Now you can pass the token to all of the components that need it as props.

There are also third party state management tools that could be used to store the token. They range from very basic ([`react-hooks-global-state`](https://www.npmjs.com/package/use-global-state)) to complex ([Redux](https://redux.js.org/)).

---

Adapted from https://git.generalassemb.ly/jmeade11/mern-auth-tutorial
