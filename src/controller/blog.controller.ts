import { Request, Response, NextFunction } from "express";
import { Blog, IBlog } from "../model/blog.model";
import { generateUniqueSlug } from "../middleware/slug.middleware";

const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req?.body);
    const { title, content, keywords, slug: customSlug } = req.body;
    8;
    const file = req.file;

    if (!title || !content || !keywords || !file) {
      res.status(400);
      throw new Error("title, content, keywords, and thumbnail are required");
    }

    const thumbnail = `${req.protocol}://${req.get("host")}/uploads/${
      file.filename
    }`;

    console.log(JSON.parse(content));
    const blogData: Partial<IBlog> = {
      title,
      content: JSON.parse(content),
      keywords,
      thumbnail,
      // @ts-ignore
      author: req.user.id,
    };

    // If a custom slug is provided, generate a unique version
    if (customSlug) {
      blogData.slug = await generateUniqueSlug(Blog, customSlug);
    }
    // Otherwise, the middleware will generate the slug from the title

    // @ts-ignore
    const user = req.user;

    const blog = await Blog.create(blogData);

    res.status(201).json({
      _id: blog._id,
      title: blog.title,
      content: blog.content,
      slug: blog.slug,
      keywords: blog.keywords,
      thumbnail: blog.thumbnail,
      author: user.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating blog post",
      error: (error as Error).message,
    });
  }
};

const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, keywords, slug: customSlug } = req.body;
    const { slug } = req.params;

    // @ts-ignore
    const file = req.file;

    const blog = await Blog.findOne({ slug });
    if (!blog) {
      res.status(404);
      throw new Error("Blog post not found");
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (keywords) blog.keywords = keywords;
    if (file) {
      blog.thumbnail = `${req.protocol}://${req.get("host")}/uploads/${
        file.filename
      }`;
    }
    if (customSlug) {
      blog.slug = await generateUniqueSlug(Blog, customSlug);
    } else if (title && title !== blog.title) {
      blog.slug = "";
    }
    await blog.save();

    res.status(200).json({
      _id: blog._id,
      title: blog.title,
      content: blog.content,
      slug: blog.slug,
      keywords: blog.keywords,
      thumbnail: blog.thumbnail,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating blog post",
      error: (error as Error).message,
    });
  }
};

const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      res.status(400);
      throw new Error("Slug is required");
    }

    const blog = await Blog.findOneAndDelete({ slug });
    if (!blog) {
      res.status(404);
      throw new Error("Blog post not found");
    }

    res.status(200).json({
      message: "Blog post deleted successfully",
      _id: blog._id,
      slug: blog.slug,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting blog post",
      error: (error as Error).message,
    });
  }
};

const getBlogBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      res.status(400);
      throw new Error("Slug is required");
    }
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      res.status(404);
      throw new Error("Blog post not found or might have been deleted");
    }
    res.status(200).json({
      _id: blog._id,
      title: blog.title,
      content: blog.content,
      slug: blog.slug,
      keywords: blog.keywords,
      thumbnail: blog.thumbnail,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching blog post",
      error: (error as Error).message,
    });
  }
};

const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blogs = await Blog.find();
    if (!blogs || blogs.length === 0) {
      res.status(404);
      throw new Error("No blog posts found");
    }
    res.status(200).json(
      blogs.map((blog) => ({
        _id: blog._id,
        title: blog.title,
        content: blog.content,
        slug: blog.slug,
        keywords: blog.keywords,
        thumbnail: blog.thumbnail,
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: "Error fetching all blog posts",
      error: (error as Error).message,
    });
  }
};

//image upload
const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400);
      throw new Error("No file uploaded");
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      file.filename
    }`;
    res
      .status(200)
      .json({ message: "Image uploaded successfully", ur: imageUrl });
  } catch (error) {
    res.status(500).json({
      message: "Error Uploading Image",
      error: (error as Error).message,
    });
  }
};

export {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogBySlug,
  getAllBlogs,
  uploadImage,
};
