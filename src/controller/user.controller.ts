import { Request, Response, NextFunction } from "express";
import { ROLE_ENUM } from "../enum/role.enum";
import JWT from "jsonwebtoken";
import { User } from "../model/user.model";
import {
  generateVerificationCode,
  storeVerifyToken,
  verifyToken,
} from "../utils/verificatiion.util";
import { sendVerificationEmail } from "../utils/email.util";

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role: ROLE_ENUM;
    };
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please fill all fields");
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    if (user) {
      const code = generateVerificationCode();
      const [emailSent, tokenStored] = await Promise.all([
        sendVerificationEmail(email, code),
        storeVerifyToken(email, code),
      ]);

      if (emailSent && tokenStored) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          verifyToken: tokenStored,
          message: "User registered and code sent",
        });
      } else {
        res.status(500);
        throw new Error("Failed to send code or store verification token");
      }
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    res.status(500);
    console.log(error);
    next(new Error("Server Error"));
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req?.body);
    const { email, password } = req.body;
    const user: any = await User.findOne({ email });
    if (!user) {
      res.status(400);
      throw new Error("User not found");
    }

    const passwordMatch = await user.matchPassword(password);
    if (passwordMatch) {
      const accessToken = JWT.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken,
      });
    } else {
      res.status(400);
    }
    return next(new Error("Invalid password"));
  } catch (error) {
    res.status(500);
    return next(new Error("Server error"));
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
};

const sendVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body as { email: string };
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400);
      throw new Error("User not found");
    }
    const code = generateVerificationCode();
    const [emailSent, tokenStored] = await Promise.all([
      sendVerificationEmail(email, code),
      storeVerifyToken(email, code),
    ]);

    if (emailSent && tokenStored) {
      res
        .status(200)
        .json({ success: true, message: "Verification code sent and stored" });
    } else {
      res.status(500);
      throw new Error("Failed to send or store verification code");
    }
  } catch (error) {
    res.status(500);
    console.error(error);
    next(new Error("Server error"));
  }
};

const verifyCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body as { email: string; code: string };
    const result = await verifyToken(email, code);

    if (result.valid) {
      res.status(200).json({ success: true, message: result.message });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    res.status(500);
    console.error(error);
    next(new Error("Server error"));
  }
};

export { register, login, logout, sendVerificationCode, verifyCode };
