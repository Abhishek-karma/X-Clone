import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app  = express();
app.use(express.json()); // to parse req.body
const PORT = process.env.PORT || 3000;


app.use(express.urlencoded({extended:true})); // to parse data from req.body
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.listen(PORT,()=>{
    console.log(`Server is running at ${PORT}`);
    connectMongoDB();
});
