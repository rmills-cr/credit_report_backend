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
exports.redis_value_update = exports.redis_otp_store = exports.mobile_redis_auth_store = exports.redis_auth_store = exports.redis_call_store = void 0;
const uuid_1 = require("uuid");
const generated_entities_1 = require("./generated_entities");
const redis_initializer_1 = __importDefault(require("./redis_initializer"));
const redis_call_store = (user_id, availability, useful_time) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uuid = (0, uuid_1.v4)();
        const token = (0, generated_entities_1.gen_token)({ availability });
        yield (yield redis_initializer_1.default).set(`${user_id}`, JSON.stringify(token), { EX: 3600 });
        return user_id;
    }
    catch (err) {
        console.error('Error in redis call store:', err);
    }
});
exports.redis_call_store = redis_call_store;
const redis_auth_store = (user, useful_time) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uuid = (0, uuid_1.v4)();
        const token = String((0, generated_entities_1.gen_token)({ user }));
        yield (yield redis_initializer_1.default).set(`${uuid}`, token, { EX: useful_time });
        return uuid;
    }
    catch (err) {
        console.error('Error in redis auth store function:', err);
    }
});
exports.redis_auth_store = redis_auth_store;
const mobile_redis_auth_store = (user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uuid = (0, uuid_1.v4)();
        const token = String((0, generated_entities_1.gen_token)({ user }));
        yield (yield redis_initializer_1.default).set(`${uuid}`, token);
        return uuid;
    }
    catch (err) {
        console.error('Error in redis auth store function:', err);
    }
});
exports.mobile_redis_auth_store = mobile_redis_auth_store;
const redis_otp_store = (email, sent_otp, status, useful_time) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = (0, generated_entities_1.gen_token)({ email, sent_otp, status });
        yield (yield redis_initializer_1.default).set(`${email}`, String(token), { EX: useful_time });
    }
    catch (err) {
        console.error('Error in redis otp store func:', err);
    }
});
exports.redis_otp_store = redis_otp_store;
const redis_value_update = (uuid, user, useful_time) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data_exist = yield (yield redis_initializer_1.default).get(`${uuid}`);
        if (!data_exist) {
            const new_uuid = yield (0, exports.redis_auth_store)(user, useful_time);
            return new_uuid;
        }
        else {
            const token = (0, generated_entities_1.gen_token)({ user });
            const update_redis = yield (yield redis_initializer_1.default).set(`${uuid}`, String(token), { EX: useful_time });
            return uuid;
        }
    }
    catch (err) {
        console.error('Error in redis data update : ', err);
    }
});
exports.redis_value_update = redis_value_update;
//# sourceMappingURL=redis_funtions.js.map