import dotenv from 'dotenv';
dotenv.config();


export const salt_round = Number(process.env.SALT_ROUND)
export const port = process.env.PORT
export const db_url = process.env.DATABASE_URL
export const redis_url = process.env.REDIS_URL
export const jwt_secret = process.env.JWT_SECRET
export const jwt_lifetime = process.env.JWT_LIFETIME
export const email_username = process.env.EMAIL_USERNAME
export const email_passowrd = process.env.EMAIL_PASSWORD
export const pass_phrase = process.env.PASSPHRASE


export const CORS_OPTION ={
    origin: "*",
    credentials: true,
    exposedHeaders: ['x-id-key'],
    optionsSuccessStatus: 200
}