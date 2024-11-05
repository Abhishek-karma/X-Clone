import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.Routes.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app  = express();
app.use(express.json()); // to parse req.body
const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({extended:true})); // to parse data from req.body
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
    connectMongoDB();
});
