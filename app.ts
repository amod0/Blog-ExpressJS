import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { dcConnect } from "./src/config/db.config";
import userRouter from "./src/router/user.routes";
import blogRouter from "./src/router/blog.routes";
import path from "path";

dcConnect();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "./Uploads")));

app.use("/api/user", userRouter);

app.use("/api/blog", blogRouter);

app.listen(port, () => console.log(`Server running on port ${port}`));
