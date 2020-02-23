const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: String,
  name: String,
  userName: String,
  provider: String,
  profileImageUrl: String,
});

const User = mongoose.model("user", userSchema);

module.exports = User;
