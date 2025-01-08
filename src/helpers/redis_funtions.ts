import { v4 as uuidv4 } from 'uuid';
import { gen_token } from './generated_entities';
import redis_client from './redis_initializer';

export const redis_call_store = async (user_id: string, availability: any, useful_time: number) => {
    try {
        const uuid: string = uuidv4();
        const token = gen_token({ availability });
        await (await redis_client).set(`${user_id}`, JSON.stringify(token), { EX:3600});
        return user_id;
    } catch (err) {
        console.error('Error in redis call store:', err);
        
    }
}

export const redis_auth_store = async (user: any, useful_time: number) => {
    try {
        const uuid: string = uuidv4();
        const token = String(gen_token({ user }));
        await (await redis_client).set(`${uuid}`, token, {EX: useful_time});
        return uuid;

    } catch (err) {
        console.error('Error in redis auth store function:', err);
        
    }
}

export const mobile_redis_auth_store = async (user: any) => {
    try {
        const uuid: string = uuidv4();
        const token = String(gen_token({ user }));
        await (await redis_client).set(`${uuid}`, token);
        return uuid;

    } catch (err) {
        console.error('Error in redis auth store function:', err);
        
    }
}

export const redis_otp_store = async (email: string, sent_otp: string, status: string, useful_time: number) => {
    try {
        const token = gen_token({ email, sent_otp, status })
        await (await redis_client).set(`${email}`, String(token), {EX: useful_time})

    } catch (err) {
        console.error('Error in redis otp store func:', err);
        
    }
}


export const redis_value_update = async (uuid: string, user: any, useful_time: number) => {
    try {
        const data_exist = await (await redis_client).get(`${uuid}`)
        if (!data_exist) {
            const new_uuid = await redis_auth_store(user, useful_time)
            return new_uuid
        } else {
            const token = gen_token({ user });
            const update_redis = await (await redis_client).set(`${uuid}`, String(token), {EX: useful_time})
            return uuid
        }
    } catch (err) {
        console.error('Error in redis data update : ', err);
        
    }
}