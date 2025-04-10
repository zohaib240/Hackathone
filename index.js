import express from "express";
import connectDB from "./src/db/index.js";
import dotenv from "dotenv";
import router from "./src/routes/users.routes.js"// Correct import path
import cookieParser from "cookie-parser";
import productRouter from "./src/routes/products.routes.js";
import { orderRouter } from "./src/routes/orders.routes.js";
dotenv.config();

const app = express(); // `app` ko pehle initialize karo

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1", router);
app.use("/api/v1", productRouter);
app.use("/api/v1", orderRouter);  


app.get('/',(req,res)=>{
  res.send('hello world')
})

// Database connection and server start
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
  });

console.log("Server started...");
