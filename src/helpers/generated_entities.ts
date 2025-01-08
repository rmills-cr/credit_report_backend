const jwt = require('jsonwebtoken');
import { jwt_secret, jwt_lifetime } from "./constants";

interface Jwt_payload {
    [key: string]: string | any;
}

export const gen_token = (payload: Jwt_payload, jwt_useful_life: string = jwt_lifetime || '') => {
    return jwt.sign(payload, jwt_secret, {
        expiresIn: jwt_useful_life
    });
}

export function generate_otp() {
    const characters = '0123456789';
    let otp = '';

    for (let i = 0; i < 6; i++) {
        const random_index = Math.floor(Math.random() * characters.length);
        otp += characters.charAt(random_index);
    }

    return otp;
}

export function generate_referral_code() {
    const characters = 'abcdefchijklmnoopqrstuvwxyz';
    let otp = '';

    for (let i = 0; i < 6; i++) {
        const random_index = Math.floor(Math.random() * characters.length);
        otp += characters.charAt(random_index);
    }

    return otp;
}

