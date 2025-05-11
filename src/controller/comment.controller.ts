import { Request, Response, NextFunction } from "express";
import { Comment, IComment } from "../model/comment.model";
import { Blog } from "../model/blog.model";

const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { comment } = req.body;

    const data: Partial<IComment> = {
      comment,
      //@ts-ignore

      blog: slug,
      //@ts-ignore
      commentedBy: req.user.id,
    };
    //@ts-ignore
    const user = req.user;

    const commented = await Comment.create(data);
    res.status(201).json({
      _id: commented._id,
      comment: commented.comment,
      commentedBy: user.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating comment",
    });
  }
};

const editComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug, commentId } = req.params;
    const { comment } = req.body;
    //@ts-ignore
    const user = req.user;

    const existingComment = await Comment.findOne({
      _id: commentId,
      blog: slug,
      commentedBy: user.id,
    });

    if (!existingComment) {
      res.status(404).json({
        message: "Comment not found or you're not authorized to edit it",
      });
      return;
    }

    existingComment.comment = comment;
    const updatedComment = await existingComment.save();

    res.status(200).json({
      _id: updatedComment._id,
      comment: updatedComment.comment,
      commentedBy: user.id,
    });
    console.log(req.params);
  } catch (error) {
    res.status(500).json({
      message: "Error editing the Comment",
      error: (error as Error).message,
    });
  }
};

export { createComment, editComment };
