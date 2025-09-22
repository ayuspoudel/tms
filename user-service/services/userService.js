import bycrypt from 'bycryptjs'
import {v4 as uuid} from 'uuid'

const TABLE = process.env.USER_TABLE

export async function validateSignup(data){
    return data
}
export async function dynamoput(user){
    return user
}
export async function createUser(data){
    validateSignup(data)

    const user = {
        id: uuid(),
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        email: data.email.tolowercase(),
        password: bycrypt.hashSync(data.password, 8),
        team: data.team,
        provider: local,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }

    await dynamoput(user);

    return {
        id: uuid(),
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        email: data.email.tolowercase(),
        team: data.team,
        provider: local,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
}