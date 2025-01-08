"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify_auth_id = exports.verify_otp = exports.email_exist = void 0;
const prisma_initializer_1 = __importDefault(require("../helpers/prisma_initializer"));
const redis_initializer_1 = __importDefault(require("./redis_initializer"));
const constants_1 = require("./constants");
const jwt = require('jsonwebtoken');
const email_exist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const [user, profile] = yield Promise.all([
            prisma_initializer_1.default.user.findFirst({ where: { email } }),
            prisma_initializer_1.default.profile.findFirst({ where: { email } }),
        ]);
        if (user || profile) {
            return res.status(409).json({ err: 'Email already taken' });
        }
        return next();
    }
    catch (err) {
        console.log('Error occured while checking if email exist ', err);
        return res.status(500).json({ err: 'Error occured while checking if email exist ', error: err });
    }
});
exports.email_exist = email_exist;
const verify_otp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const value = yield (yield redis_initializer_1.default).get(`${email}`);
        if (!value) {
            return res.status(401).json({ err: "session id has expired, generate a new OTP." });
        }
        const otp_data = yield jwt.verify(value, constants_1.jwt_secret);
        if (otp_data.sent_otp !== otp) {
            return res.status(401).json({ err: 'Incorrect OTP entered ' });
        }
        return next();
    }
    catch (err) {
        console.log('Error while verifying otp');
        return res.status(500).json({ err: `Error occured while verifying admin otp` });
    }
});
exports.verify_otp = verify_otp;
const verify_auth_id = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const auth_id = req.headers['x-id-key'];
        if (!auth_id) {
            return res.status(401).json({ err: 'x-id-key is missing' });
        }
        if (!(yield redis_initializer_1.default).isOpen) {
            console.log('Redis client not connected, attempting to reconnect...');
            yield (yield redis_initializer_1.default).connect();
        }
        const value = yield (yield redis_initializer_1.default).get(`${auth_id}`);
        if (!value) {
            return res.status(401).json({ err: `auth session id expired, please generate otp` });
        }
        const decode_value = yield jwt.verify(value, constants_1.jwt_secret);
        const user_id = decode_value.user.user_id || null;
        if (user_id == null) {
            return res.status(401).json({ err: 'Please enter the correct x-id-key' });
        }
        req.account_holder = decode_value;
        return next();
    }
    catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(410).json({ err: `jwt token expired, regenerate OTP` });
        }
        console.error('Error in verify auth id function : ', err);
    }
});
exports.verify_auth_id = verify_auth_id;
//# sourceMappingURL=auth_helper.js.map