import mongoose, { Model, Schema } from "mongoose";

export interface IComment {
  comment: string;
  blog: mongoose.Schema.Types.String;
  commentedBy: mongoose.Schema.Types.ObjectId;
}

const commentSchema: Schema<IComment> = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    blog: {
      type: String,
      // ref: "Blog",
      required: true,
    },
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Comment: Model<IComment> = mongoose.model<IComment>(
  "Comment",
  commentSchema
);
export { Comment };
