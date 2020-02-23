const router = require("express").Router();
const passport = require("passport");
const CLIENT_HOME_PAGE_URL = "http://localhost:3000";

router.get('/auth/github',passport.authenticate('github'));
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);

//when login is successful, retrieve user info
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: "User successfully authenticated",
      user: req.user,
      cookies: req.cookies
    });
  }
});

//when login fails, send failed msg
router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "User failed to authenticate."
  });
});

//When logged out, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_HOME_PAGE_URL);
});

//authenticate with github
router.get("/github", passport.authenticate("github",{session: false}));

//redirect to home page after successfully logging in via provider
router.get(
  "/github/redirect",
  passport.authenticate("github", {
    session: false,
    successRedirect: CLIENT_HOME_PAGE_URL,
    failureRedirect: "/auth/login/failed"
  })
);

module.exports = router;
