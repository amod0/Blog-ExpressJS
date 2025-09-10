import express from "express";
import {
  createBlog,
  deleteBlog,
  updateBlog,
  getBlogBySlug,
  getAllBlogs,
  uploadImage,
  search,
} from "../controller/blog.controller";
import { protect, admin } from "../middleware/auth.middleware";
import { upload } from "../middleware/media.middle";

const router = express.Router();
router.route("/create").post(protect, upload.single("thumbnail"), createBlog);
router
  .route("/update/:slug")
  .put(protect, admin, upload.single("thumbnail"), updateBlog);
router.route("/delete/:slug").delete(protect, admin, deleteBlog);
router.route("/:slug").get(getBlogBySlug);
router.route("/").get(getAllBlogs);
router
  .route("/upload-image")
  .post(protect, upload.single("image"), uploadImage);

router.route("/search").get(search);

export default router;
