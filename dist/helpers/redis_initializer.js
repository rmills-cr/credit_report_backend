"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const redis_1 = require("redis");
if (!constants_1.redis_url) {
    throw new Error('REDIS URL not found');
}
const redis_client = (0, redis_1.createClient)({
    url: String(constants_1.redis_url)
})
    .on('error', err => console.log('Redis Client Error', err))
    .connect();
exports.default = redis_client;
//# sourceMappingURL=redis_initializer.js.map