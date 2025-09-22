import { BadRequest } from "./errors";

export async function validateSignup(data){
    if (!data.firstName || !data.lastName || !data.email || !data.password || !data.dob){
        throw BadRequest('Missing Required Fields.')
    }
    return data
}

export async function validateLogin({email, password}){
    if(!email || !password){
        throw BadRequest('Email and password are required')
    }
    return {email, password};
}