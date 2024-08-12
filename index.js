import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
//App configuration
const app = express();
app.use(express.json());
dotenv.config();

//routes
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";
app.use("/posts", postRoutes);
app.use("/user", userRoutes);

//mongoDB configuration
const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 8080;

mongoose
  .connect(MONGODB_URL)
  .then(() =>
    app.listen(PORT, () => console.log(`Server open in port: ${PORT}`))
  )
  .catch((error) => console.log(error));
