import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken";
import { IUser, User } from "../model/user.model";

interface AuthRequest extends Request {
  user?: IUser;
}

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.headers.authorization;

  if (token) {
    try {
      const decoded = JWT.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };

      const user = await User.findById(decoded.id).select("role");

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      req.user = user;
      if (!req.user) {
        res.status(401).json({ message: "User not found" });
        return;
      }
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

export { admin, protect };
