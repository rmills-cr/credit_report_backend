import { Request, Response, NextFunction } from 'express'
import prisma from '../helpers/prisma_initializer'
import { salt_round } from '../helpers/constants'
import converted_datetime from '../helpers/date_time_elements'
import { mobile_redis_auth_store, redis_auth_store, redis_otp_store, redis_value_update } from '../helpers/redis_funtions'
import {generate_otp, generate_referral_code} from '../helpers/generated_entities'
import { CustomRequest } from '../helpers/interface'
import { admin_welcome_mail_messenger, business_user_welcome_mail_messenger, otp_messanger, single_user_welcome_mail_messenger } from '../helpers/emails'
const bcrypt = require('bcrypt')

export const signup = async(req: Request, res: Response, next: NextFunction)=>{
    try {

        const last_user = await prisma.user.findFirst({ orderBy: {created_at: 'desc'} })

        const last_user_number = last_user ? parseInt(last_user.user_ind.slice(2)) : 0;
        const new_user_number = last_user_number + 1;
        const new_user_ind = `US${new_user_number.toString().padStart(4, '0')}`;


        req.body.password = await bcrypt.hash(req.body.password, salt_round)
        req.body.user_ind = new_user_ind
        req.body.created_at = converted_datetime()
        req.body.updated_at = converted_datetime()


        const new_user = await prisma.user.create({
            data: req.body
        })

        if (new_user.user_role == 'admin') {
            
            admin_welcome_mail_messenger(new_user)   
            
            return res.status(201).json({msg: 'Admin created successfully', user: new_user})
            
        }else if (new_user.user_role == 'business_user') {
            
            const new_auth_id:any = await redis_auth_store(new_user, 60 * 60 * 23)
            
            business_user_welcome_mail_messenger(new_user)
            
            res.setHeader('x-id-key', new_auth_id)
            
        }else if (new_user.user_role == 'single_user') {
            
            const new_auth_id:any = await redis_auth_store(new_user, 60 * 60 * 23)
            
            single_user_welcome_mail_messenger(new_user)
            
            res.setHeader('x-id-key', new_auth_id)
            
        }

        return res.status(201).json({msg: 'User created successfully', user: new_user})
        
    } catch (err:any) {
        console.log(`Error occured while signing in `, err);
        return res.status(500).json({err: 'Error occured while signing in ', error: err})
    }
}

export const add_new_business = async(req: CustomRequest, res: Response)=>{
    try {
        const user = req.account_holder.user        

        if (user.user_role !== 'business_user') { return res.status(401).json({err: 'Not authorized to create multi user porter'}) }

        const [ user_business, last_business ] = await Promise.all([
            prisma.business.findFirst({ where: {user_id: user?.user_id} }),
            prisma.business.findFirst({orderBy: {created_at: 'desc'}})
        ])

        if (user_business) { return res.status(400).json({err: 'Already have a multi user porter '}) }

        const last_business_number = last_business ? parseInt(last_business.business_ind.slice(2)) : 0;
        const new_business_number = last_business_number + 1;
        const new_business_ind = `BS${new_business_number.toString().padStart(4, '0')}`;


        const create_business = await prisma.business.create({
            data: {
                user_id:user.user_id, business_ind: new_business_ind,
                ...req.body,
                created_at: converted_datetime(), updated_at: converted_datetime()
            }
        })

        return res.status(200).json({
            msg: 'Business Created',
            busines: create_business
        })

    } catch (err:any) {
        console.log('Error occured while add buisness ', err);
        return res.status(500).json({err:'Error occured while add buisness ', error: err});
    }
}

export const user_login = async(req: CustomRequest, res: Response)=>{
    const {email, password} = req.body
    try {
                
        const user = await prisma.user.findFirst({ 
            where: {email},
            include: {
                business: true
            }
        })
        
        if (!user) { return res.status(404).json({err: 'Incorrect email provided'}) }
        
        if (!user.email_verified) { return res.status(402).json({err: 'Email not verified, kindly verify before proceeding'}) }
                
        const encrypted_password = user.password
        
        const match_password: boolean = await bcrypt.compare(password, encrypted_password)
        
        if (!match_password) { console.log('Incorrect password'); return res.status(401).json({ err: `Incorrect password` }); }
        
        const new_auth_id:any = await redis_auth_store(user, 60 * 60 * 23)
        
        res.setHeader('x-id-key', new_auth_id)
                
        return res.status(200).json({
            msg: 'Login successful',
            user: user
        })

    } catch (err:any) {
        console.log('Error during login ', err);
        return res.status(500).json({err:'Error during login ', error: err});
    }
}


export const generate_verification_otp = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {email} = req.body
    try {
        const otp = generate_otp()

        if (!email){ return res.status(422).json({err: 'Email is required'}) }

        const user = await prisma.user.findUnique({ where: {email} })

        if (!user){return res.status(401).json({err: 'Invalid email entered'})}

        await redis_otp_store(email, otp, 'unverified', 60 * 60 * 2/6)
        
        otp_messanger(user, otp)
        
        return res.status(201).json({ msg: `A six digit unique code has been sent to your email, and it is only valid for 20min`})
    } catch (err) {
        console.error('Error during otp generation : ', err);
        return res.status(500).json({ err: 'Error while generatting verification otp.' });
    }

}

export const verify_email_otp = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {otp, email} = req.body
    try {

        const [verified_user, last_profile] = await Promise.all([
            prisma.user.update({ 
                where: {email}, 
                data: {email_verified: true, updated_at: converted_datetime()},
                include:{
                    profiles: true
                }
            }),

            prisma.profile.findFirst({ orderBy: {created_at: 'desc'}, select: {profile_ind: true} })
        ]) 

        const last_profile_number = last_profile ? parseInt(last_profile.profile_ind.slice(2)) : 0;
        const new_profile_number = last_profile_number + 1;
        const new_profile_ind = `PR${new_profile_number.toString().padStart(4, '0')}`;


        if (verified_user && verified_user.user_role == 'single_user' && !verified_user.profiles.length ) {
            await prisma.profile.create({
                data: {
                    profile_ind: new_profile_ind,
                    user_id: verified_user.user_id, first_name: verified_user.first_name, 
                    last_name: verified_user.last_name, email: verified_user.email, 
                    phone_number: verified_user.phone_number,
                    created_at: converted_datetime(), updated_at: converted_datetime()
                }
            })
        }

        const auth_id = await redis_auth_store(verified_user, 60 * 60 * 23);

        if (auth_id) {   
            res.setHeader('x-id-key', auth_id)
        }

        return res.status(200).json({ msg: 'Verification successful' })

    } catch (err) {
        console.error('Error verifying otp : ', err);
        return res.status(500).json({ err: 'Error verifying otp' });
    }

}

export const reset_password = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {email, new_password} = req.body
    try {

        const email_exist = await prisma.user.findUnique({where: {email}})

        if (!email_exist) { return res.status(404).json({err: 'Incorrect email provided'}) }

        const encrypted_password = await bcrypt.hash(new_password, salt_round)

        const update_user = await prisma.user.update({
            where: {email},
            data: {
                password: new_password, updated_at: converted_datetime()
            }
        })

        return res.status(200).json({ 
            msg: 'Password updated successful',  
            user: update_user,
        })

    } catch (err) {
        console.error('Error verifying otp : ', err);
        return res.status(500).json({ err: 'Error verifying otp' });
    }

}

export const change_profile_active_status = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {email, new_password} = req.body

    try {

        const user = req.account_holder.user

        const {status, profile_id} = req.params

        const profile_exist = await prisma.profile.findFirst({
            where: {profile_id},
            select: {
                status: true, 
                status_updater: true
            }
        })

        if (!profile_exist) { return res.status(404).json({err: 'Incorrect profile id provided '}) }


        const update_profile_status = await prisma.profile.update({
            where: {profile_id},
            data: {
                status: status,
                status_updater: user.user_id, updated_at: converted_datetime()
            }
        })

        return res.status(200).json({
            msg: 'Profile updated successfully',
            profile: update_profile_status
        })


    } catch (err) {
        console.error('Error changing profile status : ', err);
        return res.status(500).json({ err: 'Error changing profile status' });
    }

}
