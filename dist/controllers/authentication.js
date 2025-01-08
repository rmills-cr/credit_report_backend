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
exports.change_profile_active_status = exports.reset_password = exports.verify_email_otp = exports.generate_verification_otp = exports.user_login = exports.add_new_business = exports.signup = void 0;
const prisma_initializer_1 = __importDefault(require("../helpers/prisma_initializer"));
const constants_1 = require("../helpers/constants");
const date_time_elements_1 = __importDefault(require("../helpers/date_time_elements"));
const redis_funtions_1 = require("../helpers/redis_funtions");
const generated_entities_1 = require("../helpers/generated_entities");
const emails_1 = require("../helpers/emails");
const bcrypt = require('bcrypt');
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const last_user = yield prisma_initializer_1.default.user.findFirst({ orderBy: { created_at: 'desc' } });
        const last_user_number = last_user ? parseInt(last_user.user_ind.slice(2)) : 0;
        const new_user_number = last_user_number + 1;
        const new_user_ind = `US${new_user_number.toString().padStart(4, '0')}`;
        req.body.password = yield bcrypt.hash(req.body.password, constants_1.salt_round);
        req.body.user_ind = new_user_ind;
        req.body.created_at = (0, date_time_elements_1.default)();
        req.body.updated_at = (0, date_time_elements_1.default)();
        const new_user = yield prisma_initializer_1.default.user.create({
            data: req.body
        });
        if (new_user.user_role == 'admin') {
            (0, emails_1.admin_welcome_mail_messenger)(new_user);
            return res.status(201).json({ msg: 'Admin created successfully', user: new_user });
        }
        else if (new_user.user_role == 'business_user') {
            const new_auth_id = yield (0, redis_funtions_1.redis_auth_store)(new_user, 60 * 60 * 23);
            (0, emails_1.business_user_welcome_mail_messenger)(new_user);
            res.setHeader('x-id-key', new_auth_id);
        }
        else if (new_user.user_role == 'single_user') {
            const new_auth_id = yield (0, redis_funtions_1.redis_auth_store)(new_user, 60 * 60 * 23);
            (0, emails_1.single_user_welcome_mail_messenger)(new_user);
            res.setHeader('x-id-key', new_auth_id);
        }
        return res.status(201).json({ msg: 'User created successfully', user: new_user });
    }
    catch (err) {
        console.log(`Error occured while signing in `, err);
        return res.status(500).json({ err: 'Error occured while signing in ', error: err });
    }
});
exports.signup = signup;
const add_new_business = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.account_holder.user;
        if (user.user_role !== 'business_user') {
            return res.status(401).json({ err: 'Not authorized to create multi user porter' });
        }
        const [user_business, last_business] = yield Promise.all([
            prisma_initializer_1.default.business.findFirst({ where: { user_id: user === null || user === void 0 ? void 0 : user.user_id } }),
            prisma_initializer_1.default.business.findFirst({ orderBy: { created_at: 'desc' } })
        ]);
        if (user_business) {
            return res.status(400).json({ err: 'Already have a multi user porter ' });
        }
        const last_business_number = last_business ? parseInt(last_business.business_ind.slice(2)) : 0;
        const new_business_number = last_business_number + 1;
        const new_business_ind = `BS${new_business_number.toString().padStart(4, '0')}`;
        const create_business = yield prisma_initializer_1.default.business.create({
            data: Object.assign(Object.assign({ user_id: user.user_id, business_ind: new_business_ind }, req.body), { created_at: (0, date_time_elements_1.default)(), updated_at: (0, date_time_elements_1.default)() })
        });
        return res.status(200).json({
            msg: 'Business Created',
            busines: create_business
        });
    }
    catch (err) {
        console.log('Error occured while add buisness ', err);
        return res.status(500).json({ err: 'Error occured while add buisness ', error: err });
    }
});
exports.add_new_business = add_new_business;
const user_login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma_initializer_1.default.user.findFirst({
            where: { email },
            include: {
                business: true
            }
        });
        if (!user) {
            return res.status(404).json({ err: 'Incorrect email provided' });
        }
        if (!user.email_verified) {
            return res.status(402).json({ err: 'Email not verified, kindly verify before proceeding' });
        }
        const encrypted_password = user.password;
        const match_password = yield bcrypt.compare(password, encrypted_password);
        if (!match_password) {
            console.log('Incorrect password');
            return res.status(401).json({ err: `Incorrect password` });
        }
        const new_auth_id = yield (0, redis_funtions_1.redis_auth_store)(user, 60 * 60 * 23);
        res.setHeader('x-id-key', new_auth_id);
        return res.status(200).json({
            msg: 'Login successful',
            user: user
        });
    }
    catch (err) {
        console.log('Error during login ', err);
        return res.status(500).json({ err: 'Error during login ', error: err });
    }
});
exports.user_login = user_login;
const generate_verification_otp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const otp = (0, generated_entities_1.generate_otp)();
        if (!email) {
            return res.status(422).json({ err: 'Email is required' });
        }
        const user = yield prisma_initializer_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ err: 'Invalid email entered' });
        }
        yield (0, redis_funtions_1.redis_otp_store)(email, otp, 'unverified', 60 * 60 * 2 / 6);
        (0, emails_1.otp_messanger)(user, otp);
        return res.status(201).json({ msg: `A six digit unique code has been sent to your email, and it is only valid for 20min` });
    }
    catch (err) {
        console.error('Error during otp generation : ', err);
        return res.status(500).json({ err: 'Error while generatting verification otp.' });
    }
});
exports.generate_verification_otp = generate_verification_otp;
const verify_email_otp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, email } = req.body;
    try {
        const [verified_user, last_profile] = yield Promise.all([
            prisma_initializer_1.default.user.update({
                where: { email },
                data: { email_verified: true, updated_at: (0, date_time_elements_1.default)() },
                include: {
                    profiles: true
                }
            }),
            prisma_initializer_1.default.profile.findFirst({ orderBy: { created_at: 'desc' }, select: { profile_ind: true } })
        ]);
        const last_profile_number = last_profile ? parseInt(last_profile.profile_ind.slice(2)) : 0;
        const new_profile_number = last_profile_number + 1;
        const new_profile_ind = `PR${new_profile_number.toString().padStart(4, '0')}`;
        if (verified_user && verified_user.user_role == 'single_user' && !verified_user.profiles.length) {
            yield prisma_initializer_1.default.profile.create({
                data: {
                    profile_ind: new_profile_ind,
                    user_id: verified_user.user_id, first_name: verified_user.first_name,
                    last_name: verified_user.last_name, email: verified_user.email,
                    phone_number: verified_user.phone_number,
                    created_at: (0, date_time_elements_1.default)(), updated_at: (0, date_time_elements_1.default)()
                }
            });
        }
        const auth_id = yield (0, redis_funtions_1.redis_auth_store)(verified_user, 60 * 60 * 23);
        if (auth_id) {
            res.setHeader('x-id-key', auth_id);
        }
        return res.status(200).json({ msg: 'Verification successful' });
    }
    catch (err) {
        console.error('Error verifying otp : ', err);
        return res.status(500).json({ err: 'Error verifying otp' });
    }
});
exports.verify_email_otp = verify_email_otp;
const reset_password = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, new_password } = req.body;
    try {
        const email_exist = yield prisma_initializer_1.default.user.findUnique({ where: { email } });
        if (!email_exist) {
            return res.status(404).json({ err: 'Incorrect email provided' });
        }
        const encrypted_password = yield bcrypt.hash(new_password, constants_1.salt_round);
        const update_user = yield prisma_initializer_1.default.user.update({
            where: { email },
            data: {
                password: new_password, updated_at: (0, date_time_elements_1.default)()
            }
        });
        return res.status(200).json({
            msg: 'Password updated successful',
            user: update_user,
        });
    }
    catch (err) {
        console.error('Error verifying otp : ', err);
        return res.status(500).json({ err: 'Error verifying otp' });
    }
});
exports.reset_password = reset_password;
const change_profile_active_status = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, new_password } = req.body;
    try {
        const user = req.account_holder.user;
        const { status, profile_id } = req.params;
        const profile_exist = yield prisma_initializer_1.default.profile.findFirst({
            where: { profile_id },
            select: {
                status: true,
                status_updater: true
            }
        });
        if (!profile_exist) {
            return res.status(404).json({ err: 'Incorrect profile id provided ' });
        }
        const update_profile_status = yield prisma_initializer_1.default.profile.update({
            where: { profile_id },
            data: {
                status: status,
                status_updater: user.user_id, updated_at: (0, date_time_elements_1.default)()
            }
        });
        return res.status(200).json({
            msg: 'Profile updated successfully',
            profile: update_profile_status
        });
    }
    catch (err) {
        console.error('Error changing profile status : ', err);
        return res.status(500).json({ err: 'Error changing profile status' });
    }
});
exports.change_profile_active_status = change_profile_active_status;
//# sourceMappingURL=authentication.js.map