import { User } from "../models/User.js";
import { dynamo } from "../utils/db.js";

const TABLE = process.env.USER_TABLE || 'Users';

export class UserRepository {
    async findByEmail(email) {
        const res = await dynamo.query({
            TableName: TABLE,
            IndexName: 'email-index',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email.toLowerCase() }
        }).promise();

        if (res.Count === 0) return null;
        return new User(res.Items[0]);
    }

    async findById(id) {
        const res = await dynamo.get({
            TableName: TABLE,
            Key: { id }
        }).promise();

        if (!res.Item) return null; 
        return new User(res.Item);
    }

    async createUser(userData) {
        const user = new User(userData);
        user.updatedAt = new Date().toISOString();
        await dynamo.put({
            TableName: TABLE,
            Item: user
        }).promise();
        return user;
    }

    async updateUser(id, updates) {
        const user = await this.findById(id);
        if (!user) return null;
        Object.assign(user, updates);
        user.updatedAt = new Date().toISOString();
        await dynamo.put({
            TableName: TABLE,
            Item: user
        }).promise();
        return user;
    }

    async deleteUser(id) {
        await dynamo.delete({
            TableName: TABLE,
            Key: { id }
        }).promise();
        return true;
    }
}