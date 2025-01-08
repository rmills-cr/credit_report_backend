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
exports.all_paginated_user = exports.all_users = exports.add_users = void 0;
const prisma_initializer_1 = __importDefault(require("../helpers/prisma_initializer"));
const constants_1 = require("../helpers/constants");
const date_time_elements_1 = __importDefault(require("../helpers/date_time_elements"));
const redis_funtions_1 = require("../helpers/redis_funtions");
const emails_1 = require("../helpers/emails");
const bcrypt = require('bcrypt');
const add_users = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_role } = req.body;
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
        if (new_user.user_role == 'business_user') {
            const new_auth_id = yield (0, redis_funtions_1.redis_auth_store)(new_user, 60 * 60 * 23);
            res.setHeader('x-id-key', new_auth_id);
            (0, emails_1.business_user_welcome_mail_messenger)(new_user);
        }
        else if (new_user.user_role == 'single_user') {
            const new_auth_id = yield (0, redis_funtions_1.redis_auth_store)(new_user, 60 * 60 * 23);
            res.setHeader('x-id-key', new_auth_id);
            (0, emails_1.single_user_welcome_mail_messenger)(new_user);
        }
    }
    catch (err) {
        console.log('Error creating user ', err);
        return res.status(500).json({ err: 'Error creating user ', error: err });
    }
});
exports.add_users = add_users;
const all_users = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_initializer_1.default.user.findMany({});
        return res.status(200).json({
            msg: 'All users',
            total_users: user.length,
            users: user
        });
    }
    catch (err) {
        console.log('Error fetching all users ', err);
        return res.status(500).json({ err: 'Error fetching all users ', error: err });
    }
});
exports.all_users = all_users;
const all_paginated_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.account_holder.user.user_id;
        const user_role = req.account_holder.user.user_role;
        const { page_number } = req.params;
        const [number_of_users, users] = yield Promise.all([
            prisma_initializer_1.default.user.count({
                where: { user_role: { not: 'admin' } }
            }),
            prisma_initializer_1.default.user.findMany({
                where: { user_role: { not: 'admin' } }, include: { profiles: true },
                skip: (Math.abs(Number(page_number)) - 1) * 15, take: 15, orderBy: { created_at: 'desc' }
            }),
        ]);
        const number_of_users_pages = (number_of_users <= 15) ? 1 : Math.ceil(number_of_users / 15);
        return res.status(200).json({ total_number_of_users: number_of_users, total_number_of_pages: number_of_users_pages, users });
    }
    catch (err) {
        console.log('Error occured while fetching all users ', err);
        return res.status(500).json({ err: 'Error occured while fetching all users ', error: err });
    }
});
exports.all_paginated_user = all_paginated_user;
//# sourceMappingURL=admin_users.js.map