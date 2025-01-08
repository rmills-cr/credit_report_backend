"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const general_1 = require("../controllers/general");
const validations_1 = require("../validations");
const auth_helper_1 = require("../helpers/auth_helper");
const authentication_1 = require("../controllers/authentication");
const business_user_1 = require("../controllers/business_user");
const admin_users_1 = require("../controllers/admin_users");
const single_user_1 = require("../controllers/single_user");
const router = express_1.default.Router();
// Authentication 
router.route('/signup').post(auth_helper_1.email_exist, validations_1.signup_validation, authentication_1.signup);
router.route('/add-business').post(auth_helper_1.verify_auth_id, validations_1.business_validation, authentication_1.add_new_business);
router.route('/login').post(validations_1.login_validation, authentication_1.user_login);
router.route('/generate-otp').post(authentication_1.generate_verification_otp);
router.route('/verify-otp').patch(auth_helper_1.verify_otp, authentication_1.verify_email_otp);
router.route('/reset-password').patch(auth_helper_1.verify_auth_id, validations_1.reset_password_validation, authentication_1.reset_password);
router.route('/change-profile-status/:status/:profile_id').patch(auth_helper_1.verify_auth_id, authentication_1.change_profile_active_status);
// Admin User
router.route('/all-paginated-users/:page_number').get(auth_helper_1.verify_auth_id, admin_users_1.all_paginated_user);
router.route('/admin-user-dashboard').get(auth_helper_1.verify_auth_id);
router.route('/add-user').post(auth_helper_1.verify_auth_id, validations_1.user_validation, auth_helper_1.email_exist, admin_users_1.add_users);
// General 
router.route('/navigation').get(auth_helper_1.verify_auth_id, general_1.navigation_content);
// Single User
router.route('/single-user-dashboard').get(auth_helper_1.verify_auth_id);
router.route('/user-managment').get(auth_helper_1.verify_auth_id, single_user_1.user_managment);
router.route('/edit-user-management/:user_id').patch(auth_helper_1.verify_auth_id, validations_1.profile_manag_validation, single_user_1.edit_user_management);
// Business User
router.route('/all-users').get(business_user_1.all_business_users);
router.route('/business-user-dashboard').get(auth_helper_1.verify_auth_id);
router.route('/all-paginated-profile/:page_number').get(auth_helper_1.verify_auth_id, business_user_1.all_paginated_profile);
router.route('/add-profile').post(auth_helper_1.verify_auth_id, validations_1.profile_validation, auth_helper_1.email_exist, business_user_1.create_profile);
router.route('/edit-profile/:profile_id').patch(auth_helper_1.verify_auth_id, validations_1.profile_validation, business_user_1.edit_profile);
exports.default = router;
//# sourceMappingURL=index.js.map