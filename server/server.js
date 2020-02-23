//Github authentication demo from
//https://www.jokecamp.com/tutorial-passportjs-authentication-in-nodejs/

//NOTE: If we want to avoid the need for CORS, shouldn't we be able to serve our
//client app from the same port (origin) as the server--localhost:30000 in this
//case?
//TO DO: Look into this
const CLIENT_HOME_PAGE_URL = "http://localhost:30000";

const express = require('express');
const app = express(); //initialize express app
const PORT = process.env.PORT || 30000;
const passport = require('passport');
const path = require("path");
let rootPath = __dirname.substring(0,__dirname.length-6);


const GithubStrategy = require('passport-github').Strategy;

//initialize new passport object with GitHub strategy
passport.use(new GithubStrategy({
    clientID: "1b903fd9129642776b3c",
    clientSecret: "1e54162ecb7230eca9d26cc6484636e561e4d838",
    callbackURL: "http://localhost:30000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

// Initialize new Express session
const session = require('express-session');

//Serialize the user from a cookie
//TO DO: Set this up
passport.serializeUser(function(user, done) {
    // placeholder for custom user serialization
    // null is for errors
    done(null, user);
});
  
//Deserialize the user from MongoDB
//TO DO: Set this up.
passport.deserializeUser(function(user, done) {
    // placeholder for custom user deserialization.
    // maybe you are going to get the user from mongo by id?
    // null is for errors
    done(null, user);
});

//Set up Express to serve the pages in the client/build directory
app
.use(session({secret: "speedgolf"}))
  .use(passport.initialize())
  .use(passport.session())
  .use(express.static(path.join(rootPath,"client/build")))
  .listen(PORT, () => console.log(`Listening on ${PORT} with path = ${rootPath}`));

//From demo -- replaced with .listen above
// var server = app.listen(30000, function () {
//   console.log('Example app listening at http://%s:%s',
//     server.address().address, server.address().port);
// });

////////////
//APP ROUTES
////////////

//MAIN route: serves the app
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

//AUTHENTICATE route: Uses passport to authenticate with GitHub.
//Should be triggered when user clicks on 'Login with GitHub' button on 
//Log In page.
app.get('/auth/github', passport.authenticate('github'));

//CALLBACK route:  GitHub will call this route after the
//OAuth authentication process is complete.
//req.isAuthenticated tells us whether authentication was successful.
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/'); //sends user back to login screen; req.isAuthenticated is set
  }
);

//LOGOUT route: Use passport's req.logout() method to log the user out and
//redirethe user to the main app page
app.get('/auth/logout', function(req, res){
    console.log('logging out');
    req.logout();
    res.redirect('/');
});

//AUTH TEST route: Tests whether user was successfully authenticated.
//Should be called from client to conditionally render itself.
app.get('/auth/test',function(req, res){
    console.log("auth/test route reached.");
    let userObject = {};
    const isAuth = req.isAuthenticated();
    (isAuth) ? console.log("User is authenticated") : console.log("User is not authenticated");
    if (isAuth) {
        //user property assumed to exist...
        userObject.id = req.user.username + "@github";
        userObject.username = req.user.username;
        userObject.provider = "github";
        userObject.profileImageUrl = req.user.photos[0].value;
    } //else no user property.
    res.json({isAuthenticated: isAuth, user: userObject});
});

// Simple middleware to ensure user is authenticated.
// Use this middleware on any resource that needs to be protected.
// If the request is authenticated (typically via a persistent login session),
// the request will proceed.  Otherwise, the user will be redirected to the
// login page.
// function ensureAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//       // Granted -- req.user is available for use here
//       return next(); }
//     // Denied -- redirect to login
//     res.redirect('/')
//   }

//Demo code (commented out for now)
//   var html = "<ul>\
//     <li><a href='/auth/github'>GitHub</a></li>\
//     <li><a href='/logout'>Log out</a></li>\
//   </ul>";
//   // dump the user for debugging
//   if (req.isAuthenticated()) {
//     html += "<p>authenticated as user:</p>"
//     html += "<pre>" + JSON.stringify(req.user, null, 4) + "</pre>";
//   }
//   res.send(html);


