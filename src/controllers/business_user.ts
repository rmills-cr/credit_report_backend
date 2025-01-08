import { Request, Response, NextFunction } from 'express'
import prisma from '../helpers/prisma_initializer'
import { salt_round } from '../helpers/constants'
import converted_datetime from '../helpers/date_time_elements'
import { mobile_redis_auth_store, redis_auth_store, redis_otp_store, redis_value_update } from '../helpers/redis_funtions'
import {generate_otp, generate_referral_code} from '../helpers/generated_entities'
import { CustomRequest } from '../helpers/interface'
import { admin_welcome_mail_messenger, otp_messanger } from '../helpers/emails'
const bcrypt = require('bcrypt')



export const all_business_users = async(req: CustomRequest, res: Response)=>{
    try {
        
        const user = await prisma.user.findMany({})

        return res.status(200).json({
            msg: 'All users',
            total_business_users: user.length,
            business_users: user
        })
    } catch (err:any) {
        console.log('Error fetching all business users ', err);
        return res.status(500).json({err:'Error fetching all business users ', error:err});
    }
}

export const all_paginated_profile = async(req: CustomRequest, res: Response) => {
    try {
        const user_id = req.account_holder.user.user_id;
        const user_role = req.account_holder.user.user_role;

        const { page_number } = req.params;
        
        // Determine if the user is an admin
        const is_admin = user_role === 'admin';

        const [number_of_profiles, profiles] = await Promise.all([
            prisma.profile.count({
                where: is_admin ? {} : { user_id }
            }),
            prisma.profile.findMany({
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

    } catch (err: any) {
        console.log('Error occurred while fetching all users', err);
        return res.status(500).json({ err: 'Error occurred while fetching all users', error: err });
    }
}


export const create_profile = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {report_data, ...profile_box} = req.body
    try {

        const user = req.account_holder.user

        if (user.user_role !== 'business_user') { return res.status(401).json({err: 'only users registered as business users can create profile '}) }

        const [last_profile, last_credit_report] = await Promise.all([
            prisma.profile.findFirst({ orderBy: {created_at: 'desc'}, select: {profile_ind: true} }),
            prisma.creditReport.findFirst({ orderBy: {created_at: 'desc'}, select: {credit_report_ind: true} }),
            
        ])

        const last_profile_number = last_profile ? parseInt(last_profile.profile_ind.slice(2)) : 0;
        const new_profile_number = last_profile_number + 1;
        const new_profile_ind = `PR${new_profile_number.toString().padStart(4, '0')}`;

        const last_credit_report_number = last_credit_report ? parseInt(last_credit_report.credit_report_ind.slice(2)) : 0;
        const new_credit_report_number = last_credit_report_number + 1;
        const new_credit_report_ind = `PR${new_credit_report_number.toString().padStart(4, '0')}`;


        profile_box.user_id = user.user_id

        const new_profile = await prisma.profile.create({
            data: {
                profile_ind: new_profile_ind,
                ...profile_box,
                created_at: converted_datetime(), updated_at: converted_datetime()
            }
        })
        
        if (new_profile) {
            await prisma.creditReport.create({
                data: {
                    credit_report_ind: new_credit_report_ind,
                    profile_id: new_profile.profile_id, report_data,
                    created_at: converted_datetime(), updated_at: converted_datetime()
                }
            })
            
        }

        return res.status(200).json({
            msg: 'Profile created successfully',
            profile: new_profile
        })


    } catch (err) {
        console.error('Error creating profile : ', err);
        return res.status(500).json({ err: 'Error creating profile' });
    }

}

export const edit_profile = async (req: CustomRequest, res: Response, next: NextFunction) => {

    const { report_data, ...new_box} = req.body

    try {

        const user = req.account_holder.user

        const {profile_id} =  req.params

        const [profile_exist, profile_email_exist, user_email_exist] = await Promise.all([

            prisma.profile.findFirst({ where: {profile_id} }),
            prisma.profile.findFirst({where: {email: req.body.email}}),
            prisma.user.findFirst({where: {email: req.body.email}}),

        ]) 

        if (!profile_exist) { return res.status(404).json({err: 'Profile not found '}) }


        if ((profile_exist.email !== req.body.email) && (profile_email_exist || user_email_exist)) {
            return res.status(400).json({err: 'Email already taken'})
        }

        const [update_profile, update_credit_report] = await Promise.all([

            prisma.profile.update({
                where: {profile_id},
                data: {
                    ...new_box,
                    updated_at: converted_datetime()
                }
            }),
            prisma.creditReport.update({
                where: {profile_id},
                data: {
                    report_data: report_data,
                    updated_at: converted_datetime()
                }
            })
        ]) 

        return res.status(201).json({
            msg: 'Profile updated successfully',
            profile: update_profile
        })


    } catch (err) {
        console.error('Error updating profile', err);
        return res.status(500).json({ err: 'Error updating profile'});
    }

}