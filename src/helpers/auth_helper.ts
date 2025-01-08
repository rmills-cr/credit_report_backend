import { Request, Response, NextFunction } from 'express'
import prisma from '../helpers/prisma_initializer'
import { CustomRequest } from './interface'
import redis_client from './redis_initializer'
import { jwt_secret } from './constants'
const jwt = require('jsonwebtoken')

export const email_exist = async(req: Request, res: Response, next: NextFunction)=>{
    const {email} = req.body
    try {
        
        const [user, profile] = await Promise.all([
            prisma.user.findFirst({ where: {email} }),
            prisma.profile.findFirst({ where: {email} }),
        ]) 
        

        if (user || profile){
            return res.status(409).json({ err: 'Email already taken' })
        }

        return next()
    } catch (err:any) {
        console.log('Error occured while checking if email exist ', err)
        return res.status(500).json({err: 'Error occured while checking if email exist ', error: err})
        
    }
}

export const verify_otp = async(req: CustomRequest, res: Response, next: NextFunction)=> {
    const {email, otp} = req.body
    try {

        const value: any = await (await redis_client).get(`${email}`)

        if (!value){ return res.status(401).json({err: "session id has expired, generate a new OTP."}) }

        const otp_data = await jwt.verify(value, jwt_secret)

        if (otp_data.sent_otp !== otp ) {  return res.status(401).json({err: 'Incorrect OTP entered '})  }
        
        return next()
        
    } catch (err:any) {
        console.log('Error while verifying otp')
        return res.status(500).json({err: `Error occured while verifying admin otp`})
    }
}

export const verify_auth_id = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const auth_id = req.headers['x-id-key'];

        if (!auth_id) {
            return res.status(401).json({ err: 'x-id-key is missing' })
        }   

        if (!(await redis_client).isOpen) {
            console.log('Redis client not connected, attempting to reconnect...');
            await (await redis_client).connect();
        }

        const value = await (await redis_client).get(`${auth_id}`)

        if (!value) {
            return res.status(401).json({ err: `auth session id expired, please generate otp`})
        }

        const decode_value = await jwt.verify(value, jwt_secret)
        
        const user_id = decode_value.user.user_id || null        
        
        if (user_id == null){ 
            return res.status(401).json({err: 'Please enter the correct x-id-key'}) 
        }
        
        req.account_holder = decode_value
        
        return next()

    } catch (err: any) {

        if (err.name === 'TokenExpiredError') {

            return res.status(410).json({ err: `jwt token expired, regenerate OTP` })

        }
        console.error('Error in verify auth id function : ', err)
    }
}