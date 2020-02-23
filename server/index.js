const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const port = 4000;
const passport = require("passport");
const passportSetup = require("./config/passport-setup");
const session = require("express-session");
const authRoutes = require("./routes/auth-routes");
const mongoose = require("mongoose");
const keys = require("./config/keys");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // parse cookie header

// connect to mongodb
mongoose.connect(keys.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log("Connected to MongoDB");
});

//Set up cookie session
app.use(
  cookieSession({
    name: "session",
    keys: [keys.COOKIE_KEY],
    maxAge: 24 * 60 * 60 * 100
  })
);

// Set up cookie parser
app.use(cookieParser());

// initalize passport
app.use(passport.initialize());

// deserialize cookie from the browser
app.use(passport.session());

// set up cors to allow us to accept requests from our client
app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
  })
);

// set up routes
app.use("/auth", authRoutes);

const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated"
    });
  } else {
    next();
  }
};

// Perform authCheck before navigating to home page.
// If the user is authenticated, send the profile response,
// otherwise, send a 401 response that the user is not authenticated.
app.get("/", authCheck, (req, res) => {
  res.status(200).json({
    authenticated: true,
    message: "user has successfully authenticated",
    user: req.user,
    cookies: req.cookies
  });
});

// connect react to nodejs express server
app.listen(port, () => console.log(`Server is running on port ${port}!`));
