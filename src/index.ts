import express from "express";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import webpush from "web-push";
import apn from "apn";
import cors from "cors";
import colors from "colors";
import dotenv from "dotenv";
import { CORS_OPTION } from "./helpers/constants";
import index from "./routes/index";
import not_found from "./middlewares/not_found";
import check_network_availability from "./middlewares/network_availability";
import prisma from "./helpers/prisma_initializer";

dotenv.config();

const app = express();

// Initialize Socket.io for serverless
let io: any;
if (process.env.NODE_ENV !== "production") {
  const server = require("http").createServer(app);
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Start server for development
  const PORT = process.env.PORT || 4500;
  server.listen(PORT, () => {
    console.log(
      `Credit Resolution App server started and running on port ${PORT}`.cyan
        .bold
    );
  });
} else {
  // For production (Vercel), we'll initialize Socket.io differently
  io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
}

// Middleware
app.use(express.json());
app.use(cors(CORS_OPTION));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(check_network_availability);

// Routes
app.use("/api/v1/app", index);
app.use(not_found);

// Export io for use in other files
export { io };

// Export the express app for Vercel
export default app;
