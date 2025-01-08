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
exports.edit_user_management = exports.user_managment = void 0;
const prisma_initializer_1 = __importDefault(require("../helpers/prisma_initializer"));
const constants_1 = require("../helpers/constants");
const date_time_elements_1 = __importDefault(require("../helpers/date_time_elements"));
const bcrypt = require('bcrypt');
const user_managment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.account_holder.user.user_id;
        const profile = yield prisma_initializer_1.default.user.findFirst({
            where: {
                user_id, user_role: "single_user",
            },
            include: {
                profiles: {
                    include: {
                        credit_reports: true
                    }
                }
            }
        });
        return res.status(200).json({
            msg: 'User Profile',
            profile: profile
        });
    }
    catch (err) {
        console.log('Error occured while fetching user managment ', err);
        return res.status(500).json({ err: 'Error occured while fetching user managment ', error: err });
    }
});
exports.user_managment = user_managment;
const edit_user_management = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { avatar, first_name, last_name, phone_number, password, credit_score } = req.body;
    try {
        const { user_id } = req.params;
        const encrypted_password = yield bcrypt.hash(password, constants_1.salt_round);
        const [update_user, update_profile] = yield Promise.all([
            prisma_initializer_1.default.user.update({
                where: { user_id },
                data: {
                    avatar, first_name, last_name, phone_number,
                    password: encrypted_password,
                    updated_at: (0, date_time_elements_1.default)()
                }
            }),
            prisma_initializer_1.default.profile.updateMany({
                where: { user_id },
                data: {
                    credit_score,
                    updated_at: (0, date_time_elements_1.default)()
                }
            })
        ]);
        return res.status(200).json({
            msg: 'Updated Profile',
            profile: update_user
        });
    }
    catch (err) {
        console.log('Error occured while updating profile ', err);
        return res.status(500).json({ error: 'Error occured while updating profile ', erro: err });
    }
});
exports.edit_user_management = edit_user_management;
//# sourceMappingURL=single_user.js.map