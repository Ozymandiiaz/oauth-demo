//server.js
//An express.js server app that uses GitHub OAuth to authenticate a user 
//in an ultra-simple single-page React.js app.
//--------------------------------------------------------------------
//To make this work, go to client/ director and do npm run build. Then do
//$ nodemon server.js. Open http://localhost:30000 to view app
//Must do $ npm run build each time client code is updated!
//React + Express OAuth Authentication Demo
//Greatly inspired by fine tutorial at
//https://www.jokecamp.com/tutorial-passportjs-authentication-in-nodejs/
//Inspiration for React client-side code came from 
//https://www.freecodecamp.org/news/how-to-set-up-twitter-oauth-using-passport-js-and-reactjs-9ffa6f49ef0/
//For L. Zhang's server-side code, see index.js, routes/auth-routes.js, config/keys.js
//and config/passport-setup.js. I have combined all of this into server.js for
//this demo, but I may eventually reorganize.

//The URL at which the app is deployed (replace with 'http://localhost:30000'
//when testing)
const DEPLOY_URL = "http://oauth-demo.us-west-2.elasticbeanstalk.com/";

//Set up the port the server will be listening in on
const PORT = process.env.HTTP_PORT || 30000;

//We'll use passport middleware for authentication
const passport = require('passport');

//We'll use GitHub for OAuth authentication in this demo.
const GithubStrategy = require('passport-github').Strategy;

//initialize passport with GitHub strategy
passport.use(new GithubStrategy({
    clientID: "1b903fd9129642776b3c",
    clientSecret: "1e54162ecb7230eca9d26cc6484636e561e4d838",
    callbackURL: DEPLOY_URL + "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

//We'll use passport to serialize the current user from a cookie
//TO DO: Set this up
passport.serializeUser(function(user, done) {
    // placeholder for custom user serialization
    // null is for errors
    done(null, user);
});
  
//We'll use passport to deserialize the user from the database
//TO DO: Set this up.
passport.deserializeUser(function(user, done) {
    // placeholder for custom user deserialization.
    // maybe you are going to get the user from mongo by id?
    // null is for errors
    done(null, user);
});

//We'll use the path middleware to manipulate paths
const path = require("path");

// Initialize new Express (server-side) session
const session = require('express-session');

//Instantiate a new express server app
//It uses session and passport for authentication
//It listens in on PORT
//It serves the React.js app that lives in the ../client/build directory
const express = require('express');
const app = express(); //initialize express app
//Set up Express to serve the pages in the client/build directory
app
.use(session({secret: "speedgolf"}))
  .use(passport.initialize())
  .use(passport.session())
  .use(express.static(path.join(__dirname,"client/build")))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

////////////
//APP ROUTES
////////////
//We define the following routes:

//MAIN route: serves the React.js app
//Note: Commented out because .use(express.static... above takes care of main route
//app.get('/', function (req, res) {
//    res.sendFile(path.join(__dirname, '/client/build/index.html'));
//});

//AUTHENTICATE route: Uses passport to authenticate with GitHub.
//Should be accessed when user clicks on 'Login with GitHub' button on 
//Log In page.
app.get('/auth/github', passport.authenticate('github'));

//CALLBACK route:  GitHub will call this route after the
//OAuth authentication process is complete.
//req.isAuthenticated() tells us whether authentication was successful.
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/'); //sends user back to login screen; req.isAuthenticated() indicates status
  }
);

//LOGOUT route: Use passport's req.logout() method to log the user out and
//redirect the user to the main app page. req.isAuthenticated() is toggled to false.
app.get('/auth/logout', function(req, res){
    console.log('logging out');
    req.logout();
    res.redirect('/');
});

//AUTH TEST route: Tests whether user was successfully authenticated.
//Should be called from the React.js client to set up app state.
app.get('/auth/test',function(req, res){
    console.log("auth/test route invoked.");
    let userObject = {};
    const isAuth = req.isAuthenticated();
    (isAuth) ? console.log("User is authenticated") : console.log("User is not authenticated");
    if (isAuth) {
        //populate 'user' property, which must exist since isAuth===true
        console.log("User is authenticated")
        userObject.id = req.user.username + "@github";
        userObject.username = req.user.username;
        userObject.provider = "github";
        userObject.profileImageUrl = req.user.photos[0].value;
    } else {
        //Keep 'user' property empty: 'user' prop does not exist
        console.log("User is not authenticated");
    }
    //Return JSON object to client with results.
    res.json({isAuthenticated: isAuth, user: userObject});
});

// Simple middleware function to ensure user is authenticated.
// Use this function on any resource that needs to be protected.
// If the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page.
// Note: This is not presently used, but I'm keeping it in the code base just in
// case.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      // Granted -- req.user is available for use here
      return next(); }
    // Denied -- redirect to login
    res.redirect('/')
  }


