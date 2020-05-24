const mongoose = require("mongoose");
const { Schema, Types } = require("mongoose");
const { ObjectId } = Types;

const userSchema = new Schema({
  email: String,
  password: String,
  avatarURL: String,
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  status: {
    type: String,
    enum: ["NOT_VERIFIED", "ACTIVE"],
    default: "NOT_VERIFIED",
  },
  token: String,
  verificationToken: String,
});

userSchema.statics.findUserById = findUserById;
userSchema.statics.createUser = createUser;
userSchema.statics.updateUserById = updateUserById;
userSchema.statics.findUserByEmail = findUserByEmail;
userSchema.statics.findUserByToken = findUserByToken;
userSchema.statics.findUserByVerificationToken = findUserByVerificationToken;

async function findUserById(id) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return this.findById(id);
}

async function createUser(userParams) {
  return this.create(userParams);
}

async function updateUserById(id, userParams) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return this.findByIdAndUpdate(id, { $set: userParams }, { new: true });
}

async function findUserByEmail(email) {
  return this.findOne({ email });
}

async function findUserByToken(token) {
  return this.findOne({ token });
}

async function findUserByVerificationToken(verificationToken) {
  return this.findOne({ verificationToken });
}

module.exports = {
  userModel: mongoose.model("User", userSchema),
};
