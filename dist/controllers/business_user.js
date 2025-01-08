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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.edit_profile = exports.create_profile = exports.all_paginated_profile = exports.all_business_users = void 0;
const prisma_initializer_1 = __importDefault(require("../helpers/prisma_initializer"));
const date_time_elements_1 = __importDefault(require("../helpers/date_time_elements"));
const bcrypt = require('bcrypt');
const all_business_users = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_initializer_1.default.user.findMany({});
        return res.status(200).json({
            msg: 'All users',
            total_business_users: user.length,
            business_users: user
        });
    }
    catch (err) {
        console.log('Error fetching all business users ', err);
        return res.status(500).json({ err: 'Error fetching all business users ', error: err });
    }
});
exports.all_business_users = all_business_users;
const all_paginated_profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.account_holder.user.user_id;
        const user_role = req.account_holder.user.user_role;
        const { page_number } = req.params;
        // Determine if the user is an admin
        const is_admin = user_role === 'admin';
        const [number_of_profiles, profiles] = yield Promise.all([
            prisma_initializer_1.default.profile.count({
                where: is_admin ? {} : { user_id }
            }),
            prisma_initializer_1.default.profile.findMany({
                where: is_admin ? {} : { user_id },
                include: { credit_reports: true, user: true },
                skip: (Math.abs(Number(page_number)) - 1) * 15, take: 15, orderBy: { created_at: 'desc' }
            }),
        ]);
        const number_of_profiles_pages = (number_of_profiles <= 15) ? 1 : Math.ceil(number_of_profiles / 15);
        return res.status(200).json({
            total_number_of_profiles: number_of_profiles,
            total_number_of_pages: number_of_profiles_pages,
            profiles
        });
    }
    catch (err) {
        console.log('Error occurred while fetching all users', err);
        return res.status(500).json({ err: 'Error occurred while fetching all users', error: err });
    }
});
exports.all_paginated_profile = all_paginated_profile;
const create_profile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { report_data } = _a, profile_box = __rest(_a, ["report_data"]);
    try {
        const user = req.account_holder.user;
        if (user.user_role !== 'business_user') {
            return res.status(401).json({ err: 'only users registered as business users can create profile ' });
        }
        const [last_profile, last_credit_report] = yield Promise.all([
            prisma_initializer_1.default.profile.findFirst({ orderBy: { created_at: 'desc' }, select: { profile_ind: true } }),
            prisma_initializer_1.default.creditReport.findFirst({ orderBy: { created_at: 'desc' }, select: { credit_report_ind: true } }),
        ]);
        const last_profile_number = last_profile ? parseInt(last_profile.profile_ind.slice(2)) : 0;
        const new_profile_number = last_profile_number + 1;
        const new_profile_ind = `PR${new_profile_number.toString().padStart(4, '0')}`;
        const last_credit_report_number = last_credit_report ? parseInt(last_credit_report.credit_report_ind.slice(2)) : 0;
        const new_credit_report_number = last_credit_report_number + 1;
        const new_credit_report_ind = `PR${new_credit_report_number.toString().padStart(4, '0')}`;
        profile_box.user_id = user.user_id;
        const new_profile = yield prisma_initializer_1.default.profile.create({
            data: Object.assign(Object.assign({ profile_ind: new_profile_ind }, profile_box), { created_at: (0, date_time_elements_1.default)(), updated_at: (0, date_time_elements_1.default)() })
        });
        if (new_profile) {
            yield prisma_initializer_1.default.creditReport.create({
                data: {
                    credit_report_ind: new_credit_report_ind,
                    profile_id: new_profile.profile_id, report_data,
                    created_at: (0, date_time_elements_1.default)(), updated_at: (0, date_time_elements_1.default)()
                }
            });
        }
        return res.status(200).json({
            msg: 'Profile created successfully',
            profile: new_profile
        });
    }
    catch (err) {
        console.error('Error creating profile : ', err);
        return res.status(500).json({ err: 'Error creating profile' });
    }
});
exports.create_profile = create_profile;
const edit_profile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { report_data } = _a, new_box = __rest(_a, ["report_data"]);
    try {
        const user = req.account_holder.user;
        const { profile_id } = req.params;
        const [profile_exist, profile_email_exist, user_email_exist] = yield Promise.all([
            prisma_initializer_1.default.profile.findFirst({ where: { profile_id } }),
            prisma_initializer_1.default.profile.findFirst({ where: { email: req.body.email } }),
            prisma_initializer_1.default.user.findFirst({ where: { email: req.body.email } }),
        ]);
        if (!profile_exist) {
            return res.status(404).json({ err: 'Profile not found ' });
        }
        if ((profile_exist.email !== req.body.email) && (profile_email_exist || user_email_exist)) {
            return res.status(400).json({ err: 'Email already taken' });
        }
        const [update_profile, update_credit_report] = yield Promise.all([
            prisma_initializer_1.default.profile.update({
                where: { profile_id },
                data: Object.assign(Object.assign({}, new_box), { updated_at: (0, date_time_elements_1.default)() })
            }),
            prisma_initializer_1.default.creditReport.update({
                where: { profile_id },
                data: {
                    report_data: report_data,
                    updated_at: (0, date_time_elements_1.default)()
                }
            })
        ]);
        return res.status(201).json({
            msg: 'Profile updated successfully',
            profile: update_profile
        });
    }
    catch (err) {
        console.error('Error updating profile', err);
        return res.status(500).json({ err: 'Error updating profile' });
    }
});
exports.edit_profile = edit_profile;
//# sourceMappingURL=business_user.js.map