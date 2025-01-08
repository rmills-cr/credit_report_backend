import { Request, Response, NextFunction } from 'express';
import Joi from 'joi'


export const signup_validation = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const schema = Joi.object({

            last_name: Joi.string().trim().required(),
            first_name: Joi.string().trim().required(),
            email: Joi.string().trim().email().required(),
            password: Joi.string().trim().required(),
            phone_number: Joi.string().trim().required(),
            avatar: Joi.string().trim().optional(),
            user_role: Joi.string().trim().required(),
        })

        const { error: validation_error } = schema.validate(req.body)

        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next()
    } catch (err:any) {
        console.log('Error occured in signup validation function ',err)
        return res.status(422).json({err: 'Error occured in signup validation funtion ', error: err})
        
    }
}

export const business_validation = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const schema = Joi.object({

            business_name: Joi.string().trim().required(),
            business_address: Joi.string().trim().required(),
            avatar: Joi.string().trim().email().allow('').optional(),

        })

        const { error: validation_error } = schema.validate(req.body)

        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next()
    } catch (err:any) {
        console.log('Error occured in business validation function ',err)
        return res.status(422).json({err: 'Error occured in business validation funtion ', error: err})
        
    }
}


export const login_validation = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const schema = Joi.object({

            email: Joi.string().trim().required(),
            password: Joi.string().trim().required(),

        })

        const { error: validation_error } = schema.validate(req.body)

        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next()
    } catch (err:any) {
        console.log('Error occured in login validation function ',err)
        return res.status(422).json({err: 'Error occured in login validation funtion ', error: err})
        
    }
}


export const reset_password_validation = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const schema = Joi.object({

            email: Joi.string().trim().required(),
            new_password: Joi.string().trim().required(),

        })

        const { error: validation_error } = schema.validate(req.body)

        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next()
    } catch (err:any) {
        console.log('Error resetting password ',err)
        return res.status(422).json({err: 'Error resetting password ', error: err})
        
    }
}


export const profile_validation = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const schema = Joi.object({

            first_name: Joi.string().trim().required(),
            last_name: Joi.string().trim().required(),
            phone_number: Joi.string().trim().required(),
            email: Joi.string().email().required(),
            credit_score: Joi.number().optional(),
            report_data: Joi.string().trim().required(),

        })

        const { error: validation_error } = schema.validate(req.body)

        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next()
    } catch (err:any) {
        console.log('Error creating profile ',err)
        return res.status(422).json({err: 'Error creating profile ', error: err})
        
    }
}


export const user_validation = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const schema = Joi.object({

            first_name: Joi.string().trim().required(),
            last_name: Joi.string().trim().required(),
            phone_number: Joi.string().trim().required(),
            email: Joi.string().email().required(),
            password: Joi.string().trim().required(),
            avatar: Joi.string().trim().allow('').optional(),
            user_role: Joi.string().trim().required(),

        })

        const { error: validation_error } = schema.validate(req.body)

        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next()
    } catch (err:any) {
        console.log('Error creating user ',err)
        return res.status(422).json({err: 'Error creating user ', error: err})
    }
}


export const profile_manag_validation = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const schema = Joi.object({

            first_name: Joi.string().trim().required(),
            last_name: Joi.string().trim().required(),
            phone_number: Joi.string().trim().required(),
            password: Joi.string().trim().allow('').optional(),
            avatar: Joi.string().trim().allow('').optional(),
            credit_score: Joi.number().required()
        })

        const { error: validation_error } = schema.validate(req.body)

        if (validation_error) {
            const error_message = validation_error.message.replace(/"/g, '');
            return res.status(400).json({ err: error_message });
        }
        return next()
    } catch (err:any) {
        console.log('Error creating user ',err)
        return res.status(422).json({err: 'Error creating user ', error: err})
    }
}

