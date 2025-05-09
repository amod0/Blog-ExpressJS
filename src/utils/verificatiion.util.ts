import bcrypt from "bcryptjs";
import { User } from "../model/user.model";

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeVerifyToken(
  email: string,
  code: string
): Promise<boolean> {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedCode = await bcrypt.hash(code, salt);

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          verifytoken: hashedCode,
          verifyTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return true;
  } catch (error) {
    console.error("Error storing verification token:", error);
    return false;
  }
}

export async function verifyToken(
  email: string,
  inputCode: string
): Promise<{
  valid: boolean;
  message: string;
}> {
  try {
    const user = await User.findOne({ email });

    if (!user || !user.verifytoken) {
      return { valid: false, message: "token nor found" };
    }

    if (user.verifyTokenExpiresAt && new Date() > user.verifyTokenExpiresAt) {
      await User.updateOne(
        { email },
        { $unset: { verifytoken: "", verifyTokenExpiresAt: "" } }
      );
      return { valid: false, message: "Verification code has expired" };
    }

    const isMatch = await bcrypt.compare(inputCode, user.verifytoken);

    if (isMatch) {
      await User.updateOne(
        { email },
        { $unset: { verifytoken: "", verifyTokenExpiresAt: "" } }
      );
      return { valid: true, message: "Verification successful" };
    } else {
      return { valid: false, message: "Invalid verification code" };
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return { valid: false, message: "verification error" };
  }
}
