"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("./helpers/constants");
const index_1 = __importDefault(require("./routes/index"));
const not_found_1 = __importDefault(require("./middlewares/not_found"));
const network_availability_1 = __importDefault(require("./middlewares/network_availability"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Initialize Socket.io for serverless
let io;
if (process.env.NODE_ENV !== "production") {
    const server = require("http").createServer(app);
    exports.io = io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    // Start server for development
    const PORT = process.env.PORT || 4500;
    server.listen(PORT, () => {
        console.log(`Credit Resolution App server started and running on port ${PORT}`.cyan
            .bold);
    });
}
else {
    // For production (Vercel), we'll initialize Socket.io differently
    exports.io = io = new socket_io_1.Server({
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
}
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)(constants_1.CORS_OPTION));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(network_availability_1.default);
// Routes
app.use("/api/v1/app", index_1.default);
app.use(not_found_1.default);
// Export the express app for Vercel
exports.default = app;
//# sourceMappingURL=index.js.map