import {  Response } from 'express'
import prisma from '../helpers/prisma_initializer'
import { salt_round } from '../helpers/constants'
import converted_datetime from '../helpers/date_time_elements'
import { redis_auth_store, } from '../helpers/redis_funtions'
import { CustomRequest } from '../helpers/interface'
import { business_user_welcome_mail_messenger, single_user_welcome_mail_messenger } from '../helpers/emails'
const bcrypt = require('bcrypt')




export const add_users = async(req: CustomRequest, res: Response)=>{
    const {user_role} = req.body
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

        if (new_user.user_role == 'business_user') {
            const new_auth_id:any = await redis_auth_store(new_user, 60 * 60 * 23)
            res.setHeader('x-id-key', new_auth_id)
            business_user_welcome_mail_messenger(new_user)
        }
        else if (new_user.user_role == 'single_user') {
            const new_auth_id:any = await redis_auth_store(new_user, 60 * 60 * 23)
            res.setHeader('x-id-key', new_auth_id)
            single_user_welcome_mail_messenger(new_user)
        }

    } catch (err:any) {
        console.log('Error creating user ', err)
        return res.status(500).json({err:'Error creating user ', error:err})
    }
}

export const all_users = async(req: CustomRequest, res: Response)=>{
    try {
        
        const user = await prisma.user.findMany({})

        return res.status(200).json({
            msg: 'All users',
            total_users: user.length,
            users: user
        })
    } catch (err:any) {
        console.log('Error fetching all users ', err);
        return res.status(500).json({err:'Error fetching all users ', error:err});
    }
}

export const all_paginated_user = async(req: CustomRequest, res: Response)=>{
    try {
        const user_id = req.account_holder.user.user_id; const user_role = req.account_holder.user.user_role;

        const {page_number} = req.params

        const [number_of_users, users ] = await Promise.all([

            prisma.user.count({
                where: {user_role: {not: 'admin'}}
            }),
            prisma.user.findMany({
                where: {user_role: {not: 'admin'}}, include: {profiles: true},
                skip: (Math.abs(Number(page_number)) - 1) * 15, take: 15, orderBy: { created_at: 'desc'  } 
            }),

        ])
        
        const number_of_users_pages = (number_of_users <= 15) ? 1 : Math.ceil(number_of_users / 15)

        return res.status(200).json({ total_number_of_users: number_of_users, total_number_of_pages: number_of_users_pages, users })

    } catch (err:any) {
        console.log('Error occured while fetching all users ', err);
        return res.status(500).json({err:'Error occured while fetching all users ', error:err});
    }
}

