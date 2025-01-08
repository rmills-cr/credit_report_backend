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
exports.profile_manag_validation = exports.user_validation = exports.profile_validation = exports.reset_password_validation = exports.login_validation = exports.business_validation = exports.signup_validation = void 0;
const joi_1 = __importDefault(require("joi"));
const signup_validation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            last_name: joi_1.default.string().trim().required(),
            first_name: joi_1.default.string().trim().required(),
            email: joi_1.default.string().trim().email().required(),
            password: joi_1.default.string().trim().required(),
            phone_number: joi_1.default.string().trim().required(),
            avatar: joi_1.default.string().trim().optional(),
            user_role: joi_1.default.string().trim().required(),
        });
        const { error: validation_error } = schema.validate(req.body);
        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next();
    }
    catch (err) {
        console.log('Error occured in signup validation function ', err);
        return res.status(422).json({ err: 'Error occured in signup validation funtion ', error: err });
    }
});
exports.signup_validation = signup_validation;
const business_validation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            business_name: joi_1.default.string().trim().required(),
            business_address: joi_1.default.string().trim().required(),
            avatar: joi_1.default.string().trim().email().allow('').optional(),
        });
        const { error: validation_error } = schema.validate(req.body);
        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next();
    }
    catch (err) {
        console.log('Error occured in business validation function ', err);
        return res.status(422).json({ err: 'Error occured in business validation funtion ', error: err });
    }
});
exports.business_validation = business_validation;
const login_validation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().trim().required(),
            password: joi_1.default.string().trim().required(),
        });
        const { error: validation_error } = schema.validate(req.body);
        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next();
    }
    catch (err) {
        console.log('Error occured in login validation function ', err);
        return res.status(422).json({ err: 'Error occured in login validation funtion ', error: err });
    }
});
exports.login_validation = login_validation;
const reset_password_validation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            email: joi_1.default.string().trim().required(),
            new_password: joi_1.default.string().trim().required(),
        });
        const { error: validation_error } = schema.validate(req.body);
        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next();
    }
    catch (err) {
        console.log('Error resetting password ', err);
        return res.status(422).json({ err: 'Error resetting password ', error: err });
    }
});
exports.reset_password_validation = reset_password_validation;
const profile_validation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            first_name: joi_1.default.string().trim().required(),
            last_name: joi_1.default.string().trim().required(),
            phone_number: joi_1.default.string().trim().required(),
            email: joi_1.default.string().email().required(),
            credit_score: joi_1.default.number().optional(),
            report_data: joi_1.default.string().trim().required(),
        });
        const { error: validation_error } = schema.validate(req.body);
        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next();
    }
    catch (err) {
        console.log('Error creating profile ', err);
        return res.status(422).json({ err: 'Error creating profile ', error: err });
    }
});
exports.profile_validation = profile_validation;
const user_validation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            first_name: joi_1.default.string().trim().required(),
            last_name: joi_1.default.string().trim().required(),
            phone_number: joi_1.default.string().trim().required(),
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().trim().required(),
            avatar: joi_1.default.string().trim().allow('').optional(),
            user_role: joi_1.default.string().trim().required(),
        });
        const { error: validation_error } = schema.validate(req.body);
        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next();
    }
    catch (err) {
        console.log('Error creating user ', err);
        return res.status(422).json({ err: 'Error creating user ', error: err });
    }
});
exports.user_validation = user_validation;
const profile_manag_validation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schema = joi_1.default.object({
            first_name: joi_1.default.string().trim().required(),
            last_name: joi_1.default.string().trim().required(),
            phone_number: joi_1.default.string().trim().required(),
            password: joi_1.default.string().trim().allow('').optional(),
            avatar: joi_1.default.string().trim().allow('').optional(),
            credit_score: joi_1.default.number().required()
        });
        const { error: validation_error } = schema.validate(req.body);
        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next();
    }
    catch (err) {
        console.log('Error creating user ', err);
        return res.status(422).json({ err: 'Error creating user ', error: err });
    }
});
exports.profile_manag_validation = profile_manag_validation;
//# sourceMappingURL=index.js.map