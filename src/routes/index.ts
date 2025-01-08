import express from 'express'

import {navigation_content} from "../controllers/general"

import { signup_validation, business_validation, login_validation, reset_password_validation, profile_validation, user_validation, profile_manag_validation } from '../validations'

import { email_exist, verify_auth_id, verify_otp,  } from '../helpers/auth_helper'

import { add_new_business, change_profile_active_status,generate_verification_otp, reset_password, signup, user_login, verify_email_otp } from '../controllers/authentication'

import {all_business_users, all_paginated_profile, create_profile, edit_profile} from "../controllers/business_user"

import {add_users, all_paginated_user, all_users} from "../controllers/admin_users"
import { edit_user_management, user_managment } from '../controllers/single_user'

const router = express.Router()


// Authentication 

router.route('/signup').post(email_exist, signup_validation, signup )

router.route('/add-business').post(verify_auth_id, business_validation, add_new_business)

router.route('/login').post(login_validation, user_login)

router.route('/generate-otp').post(generate_verification_otp)

router.route('/verify-otp').patch(verify_otp, verify_email_otp)

router.route('/reset-password').patch(verify_auth_id, reset_password_validation, reset_password )

router.route('/change-profile-status/:status/:profile_id').patch(verify_auth_id, change_profile_active_status )

// Admin User

router.route('/all-paginated-users/:page_number').get(verify_auth_id, all_paginated_user)

router.route('/admin-user-dashboard').get(verify_auth_id, )

router.route('/add-user').post(verify_auth_id, user_validation, email_exist, add_users )

// General 

router.route('/navigation').get(verify_auth_id, navigation_content )


// Single User

router.route('/single-user-dashboard').get(verify_auth_id, )

router.route('/user-managment').get(verify_auth_id, user_managment)

router.route('/edit-user-management/:user_id').patch(verify_auth_id, profile_manag_validation, edit_user_management)

// Business User

router.route('/all-users').get( all_business_users)

router.route('/business-user-dashboard').get(verify_auth_id, )

router.route('/all-paginated-profile/:page_number').get(verify_auth_id, all_paginated_profile)

router.route('/add-profile').post(verify_auth_id, profile_validation, email_exist, create_profile)

router.route('/edit-profile/:profile_id').patch(verify_auth_id, profile_validation, edit_profile  )




export default router