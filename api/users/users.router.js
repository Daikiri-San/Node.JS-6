const { Router } = require("express");
const { UserController } = require("./users.controller");
const { AuthController } = require("../auth/auth.controller");
const { upload, compressImage } = require("../auth/upload.middlewares");

const userRouter = Router();

userRouter.get("/current", AuthController.authorize, UserController.getCurrent);
userRouter.patch(
  "/avatars",
  upload.single("avatar"),
  AuthController.authorize,
  compressImage,
  UserController.updateAvatar
);
userRouter.patch(
  "/",
  AuthController.authorize,
  UserController.updateSubscription
);

module.exports = {
  userRouter,
};
