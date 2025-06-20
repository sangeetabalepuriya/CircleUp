import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnection from "./config/dbConnection.js";
import userRoute from "./routes/userRoute.js";
import postRoute from "./routes/postRoute.js";
import messageRoute from "./routes/messageRoute.js";
import { app, server} from "./socket/socket.js";
import path from "path";


const __dirname = path.resolve();


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
    origin: process.env.URL,
    credentials: true
}
app.use(cors(corsOptions));


dbConnection();

app.use("/user", userRoute);
app.use("/post", postRoute);
app.use("/message", messageRoute);


app.use(express.static(path.join(__dirname, "/Frontend/dist")));
app.get("*", (req, res)=> {
    res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
})


server.listen(process.env.PORT, () => {
    console.log(`Server is Rnning on Port ${process.env.PORT}`);
})