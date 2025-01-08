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
exports.CORS_OPTION = {
    origin: "*",
    credentials: true,
    exposedHeaders: ['x-id-key'],
    optionsSuccessStatus: 200
};
//# sourceMappingURL=constants.js.map