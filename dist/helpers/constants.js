"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORS_OPTION = exports.pass_phrase = exports.email_passowrd = exports.email_username = exports.jwt_lifetime = exports.jwt_secret = exports.redis_url = exports.db_url = exports.port = exports.salt_round = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.salt_round = Number(process.env.SALT_ROUND);
exports.port = process.env.PORT;
exports.db_url = process.env.DATABASE_URL;
exports.redis_url = process.env.REDIS_URL;
exports.jwt_secret = process.env.JWT_SECRET;
exports.jwt_lifetime = process.env.JWT_LIFETIME;
exports.email_username = process.env.EMAIL_USERNAME;
exports.email_passowrd = process.env.EMAIL_PASSWORD;
exports.pass_phrase = process.env.PASSPHRASE;
const allowedOrigins = [
    "https://credit-repair-client.vercel.app",
    "http://localhost:3000",
    "http://localhost:4500",
];
exports.CORS_OPTION = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    exposedHeaders: ["x-id-key"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "x-id-key",
    ],
    optionsSuccessStatus: 204,
};
//# sourceMappingURL=constants.js.map