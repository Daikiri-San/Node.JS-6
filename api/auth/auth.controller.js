const { createControllerProxy } = require("../controllerProxy");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { uuid } = require("uuidv4");
const sgMail = require("@sendgrid/mail");
const { userModel } = require("../users/users.model");

const defaultAvatar =
  "https://icon-library.net/images/avatar-icon-images/avatar-icon-images-7.jpg";

class AuthController {
  constructor() {
    this._saltRounds = 8;
    sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
  }

  async registerUser(req, res, next) {
    try {
      const { email, password, subscription } = req.body;
      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email in use" });
      }
      const passwordHash = await this.hashPassword(password);

      const avatarURL =
        req.file && req.file.fieldname === "avatar"
          ? `${process.env.SERVER_URL}${process.env.COMPRESSED_IMAGES_BASE_URL}/${req.file.filename}`
          : defaultAvatar;

      const verificationToken = uuid();

      await this.sendVerification(email, verificationToken);

      const createdUser = await userModel.createUser({
        email,
        password: passwordHash,
        subscription,
        avatarURL,
        verificationToken,
      });

      const token = this.createToken(createdUser._id);
      await userModel.updateUserById(createdUser._id, { token });

      return res.status(201).json({
        message: "We send activation link to your email, please open it",
        user: {
          email: createdUser.email,
          subscription: createdUser.subscription,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  async sendVerification(email, verificationToken) {
    const verificationLink = `${process.env.SERVER_URL}/auth/verify/${verificationToken}`;
    const result = await sgMail.send({
      to: email,
      from: process.env.SEND_GRID_FROM,
      subject: "Email verification",
      html: `<a href="${verificationLink}">Click to verify your email</a>`,
    });

    return console.log(result);
  }

  async verifyEmail(req, res, next) {
    try {
      const { verificationToken } = req.params;
      const existingUser = await userModel.findUserByVerificationToken(
        verificationToken
      );
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      await userModel.updateUserById(existingUser._id, {
        verificationToken: null,
        status: "ACTIVE",
      });
      return res.status(200).json({ message: "Verified! :)" });
    } catch (err) {
      next(err);
    }
  }

  async logInUser(req, res, next) {
    try {
      const { email, password } = req.body;
      const existingUser = await userModel.findUserByEmail(email);
      if (!existingUser) {
        return res.status(400).json({ message: "Email is not registrate" });
      }

      const isPasswordCorrect = await this.comparePassword(
        password,
        existingUser.password
      );

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid login or password" });
      }

      if (existingUser.status !== "ACTIVE") {
        return res.status(400).json({ message: "User not verified!" });
      }

      const token = this.createToken(existingUser._id);
      await userModel.updateUserById(existingUser._id, { token });

      return res.status(200).json({
        user: {
          email: existingUser.email,
          subscription: existingUser.subscription,
        },
        token,
      });
    } catch (err) {
      next(err);
    }
  }

  async authorize(req, res, next) {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace("Bearer ", "");

      try {
        jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const user = await userModel.findUserByToken(token);
      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      req.user = user;
      req.token = token;

      next();
    } catch (err) {
      next(err);
    }
  }

  async logOut(req, res, next) {
    try {
      await userModel.updateUserById(req.user._id, { token: null });
      return res.status(200).json({ message: "Logout success" });
    } catch (err) {
      next(err);
    }
  }

  validateUser(req, res, next) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(422).json({ message: "missing required email field" });
    }
    if (typeof email !== "string") {
      return res.status(422).json({ message: "email is not a string" });
    }
    if (!password) {
      return res
        .status(422)
        .json({ message: "missing required password field" });
    }
    if (typeof password !== "string") {
      return res.status(422).json({ message: "password is not a string" });
    }
    next();
  }

  async hashPassword(password) {
    return bcryptjs.hash(password, this._saltRounds);
  }

  async comparePassword(password, passwordHash) {
    return bcryptjs.compare(password, passwordHash);
  }

  createToken(uid) {
    return jwt.sign({ uid }, process.env.JWT_SECRET);
  }
}

module.exports = {
  AuthController: createControllerProxy(new AuthController()),
};
