import express from "express";
import {
  login,
  register,
  logout,
  sendVerificationCode,
  verifyCode,
} from "../controller/user.controller";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/send-verification-code").post(sendVerificationCode);
router.route("/verify-code").post(verifyCode);

export default router;
