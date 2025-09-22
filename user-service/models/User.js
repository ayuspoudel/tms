import {v4 as uuid} from 'uuid';
import bycrypt from bycryptjs;
import dynamo from '../utils/db.js';

export class User{
    constructor({
        id = uuid(),
        firstName,
        lastName, 
        dob,
        passwordHash,
        team,
        provider,
        createdAt,
        updatedAt
    }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dob = dob;
        this.passwordHash = passwordHash;
        this.email = email ? email.toLowerCase() : null;
        this.team = team || 'general';
        this.provider= provider || 'local';
        this.createdAt = createdAt || new Date().toISOString();
        this.updatedAt = updatedAt || new Date.toISOString();
    }

    async save() {
        this.updatedAt = new Date().toISOString();
        await dynamo.put({
            TableName: TABLE,
            Item: this
        }). promise();
        return this
    }

    safe(){
        const {passwordHash, ...rest} = this;
        return rest;
    }

    static async findByEmail(email){
        const res = await dynamo.query({
            TableName: TABLE,
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {'email': email.toLowerCase()}
        }).promise();

        if (res.count === 0) {return null;};
        return new User(res.Items[0]);
    }

    async delete(){
        await dynamo.delete({
                TableName: TABLE,
                Key: {id: this.id}
            }).promise()
    }


}