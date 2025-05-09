import mongoose, { Schema, Document, Model } from "mongoose";
import {
  attachSlugMiddleware,
  ISlugDocument,
} from "../middleware/slug.middleware";

export interface IBlog extends ISlugDocument {
  content: string;
  thumbnail: string;
  keywords: string;
  author: mongoose.Schema.Types.ObjectId;
}

const blogSchema: Schema<IBlog> = new Schema(
  {
    slug: {
      type: String,
      required: false,
      unique: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      title: String,
      body: String,
      footer: String,
    },

    thumbnail: {
      type: String,
      required: false,
    },
    keywords: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Apply the slug middleware
attachSlugMiddleware<IBlog>(blogSchema);

const Blog: Model<IBlog> = mongoose.model<IBlog>("Blog", blogSchema);
export { Blog };
