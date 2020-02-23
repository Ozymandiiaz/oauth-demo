const passport = require("passport");
const GitHubStrategy = require("passport-github");
const keys = require("./keys");
const User = require("../models/user-model");

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
// passport.serializeUser((user, callback) => {
//   callback(null, user.id);
// });

// deserialize the cookieUserId to user in the database
// passport.deserializeUser((id, callback) => {
//   User.findById(id)
//     .then(user => {
//       callback(null, user);
//     })
//     .catch(e => {
//       callback(new Error("Failed to deserialize user"));
//     });
// });

passport.use(
  new GitHubStrategy(
    {
      clientID: keys.GITHUB_CLIENT_ID,
      clientSecret: keys.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/redirect"
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null,profile);
    }
  ));
//     async (accessToken, refreshToken, profile, cb) => {
//       //See what's in profile
//       //console.log("Profile: " + JSON.stringify(profile));
//       // find current user in UserModel
//       const currentUser = await User.findOne({
//         id: profile.id + "@github"
//       });
//       // create new user if the database doesn't have this user
//       if (!currentUser) {
//         const newUser = await new User({
//           id: profile.username + "@github",
//           name: profile.displayName,
//           userName: profile.username,
//           provider: 'github',
//           profileImageUrl: profile.photos[0].value
//         }).save();
//         if (newUser) {
//           cb(null, newUser);
//         }
//       }
//       cb(null, currentUser);
//     }
//   )
// );
