import mongoose from "mongoose";
import { ROLE_ENUM } from "../enum/role.enum";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: ROLE_ENUM;
  verifytoken: string;
  verifyTokenExpiresAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(ROLE_ENUM),
      default: ROLE_ENUM.USER,
    },

    verifytoken: {
      type: String,
    },
    verifyTokenExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (
  givenPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, (this as IUser).password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export { User };
