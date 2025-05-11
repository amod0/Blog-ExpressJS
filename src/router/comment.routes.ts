import express from "express";
import { protect } from "../middleware/auth.middleware";
import { createComment, editComment } from "../controller/comment.controller";

const router = express.Router();

router.route("/:slug").post(protect, createComment);
router.route("/:slug/:commentId").put(protect, editComment);

export default router;
