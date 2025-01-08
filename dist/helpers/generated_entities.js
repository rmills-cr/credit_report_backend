"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gen_token = void 0;
exports.generate_otp = generate_otp;
exports.generate_referral_code = generate_referral_code;
const jwt = require('jsonwebtoken');
const constants_1 = require("./constants");
const gen_token = (payload, jwt_useful_life = constants_1.jwt_lifetime || '') => {
    return jwt.sign(payload, constants_1.jwt_secret, {
        expiresIn: jwt_useful_life
    });
};
exports.gen_token = gen_token;
function generate_otp() {
    const characters = '0123456789';
    let otp = '';
    for (let i = 0; i < 6; i++) {
        const random_index = Math.floor(Math.random() * characters.length);
        otp += characters.charAt(random_index);
    }
    return otp;
}
function generate_referral_code() {
    const characters = 'abcdefchijklmnoopqrstuvwxyz';
    let otp = '';
    for (let i = 0; i < 6; i++) {
        const random_index = Math.floor(Math.random() * characters.length);
        otp += characters.charAt(random_index);
    }
    return otp;
}
//# sourceMappingURL=generated_entities.js.map