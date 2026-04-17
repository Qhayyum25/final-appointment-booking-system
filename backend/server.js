// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import connectDB from "./config/mongodb.js";
// import connectCloudinary from "./config/cloudinary.js";
// import adminRouter from "./routes/adminRoute.js";
// import doctorRouter from "./routes/doctorRoute.js";
// import userRouter from "./routes/userRoute.js";

// // app config
// const app = express();
// const port = process.env.PORT || 4000;
// connectDB();
// connectCloudinary();

// // middlewares
// app.use(express.json());
// app.use(cors());

// // api endpoints
// app.use("/api/admin", adminRouter);
// app.use("/api/doctor", doctorRouter);
// app.use("/api/user", userRouter);

// app.get("/", (req, res) => {
//   res.send("API WORKING");
// });

// app.listen(port, () => console.log("Server started", port));







import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json());
app.use(cors());

// start server properly
const startServer = async () => {
  try {
    // check env
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI missing in .env file");
    }

    // connect services
    await connectDB();        // ✅ wait for DB connection
    connectCloudinary();

    // routes
    app.use("/api/admin", adminRouter);
    app.use("/api/doctor", doctorRouter);
    app.use("/api/user", userRouter);

    app.get("/", (req, res) => {
      res.send("API WORKING");
    });

    // start server
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });

  } catch (error) {
    console.error("Server Error ❌:", error.message);
    process.exit(1);
  }
};

startServer();