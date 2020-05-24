const { userModel } = require("./users.model");
const { promises: fsPromises } = require("fs");

class UserController {
  async getCurrent(req, res, next) {
    try {
      const user = await userModel.findUserById(req.user._id);
      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }
      return res
        .status(200)
        .json({ email: user.email, subscription: user.subscription });
    } catch (err) {
      next(err);
    }
  }

  async updateSubscription(req, res, next) {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({
        message: "missing field subscription",
      });
    }
    const subscriptionTypes = ["free", "pro", "premium"];

    if (!subscriptionTypes.includes(subscription)) {
      return res.status(400).json({
        message: "this type of subscription does not exist",
      });
    }

    try {
      const user = await userModel.findUserByToken(req.token);
      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }
      const updatedContact = await userModel.updateUserById(user._id, {
        subscription,
      });

      return res.status(200).json(updatedContact);
    } catch (err) {
      next(err);
    }
  }

  async updateAvatar(req, res, next) {
    if (!req.file && !req.file.fieldname === "avatar") {
      return res.status(400).json({
        message: "missing avatar",
      });
    }

    try {
      const user = await userModel.findUserByToken(req.token);
      if (!user) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const avatarURL = `${process.env.SERVER_URL}${process.env.COMPRESSED_IMAGES_BASE_URL}/${req.file.filename}`;

      await fsPromises.unlink(
        `${process.env.COMPRESSED_IMAGES_FOLDER}/${user.avatarURL.replace(
          `${process.env.SERVER_URL}${process.env.COMPRESSED_IMAGES_BASE_URL}`,
          ""
        )}`
      );

      await userModel.updateUserById(user._id, {
        avatarURL,
      });

      return res.status(200).json({ avatarURL });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = {
  UserController: new UserController(),
};
