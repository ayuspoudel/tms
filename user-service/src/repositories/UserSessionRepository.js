import {dynamo} from "../utils/db.js";
import {v4 as uuid} from 'uuid';

const TABLE_NAME = process.env.USER_SESSIONS_TABLE || "UserSessions";



export class UserSessionRepository {
    async createSession({userId, refreshToken, expiresAt}){
        const session = {id: uuid(), userId, refreshToken, expiresAt, createAt: new Date().toISOString}
        await dynamo.put({TableName: TABLE_NAME, item: session}).promise();
        return session;
    }

    async findBySession(rereshToken){
        const res = dynamo.query({TableName: TABLE_NAME, IndexName: 'refreshToken-index', KeyConditionExpression: "refreshToken = :rt", ExpressionAttributeValues: {":rt": refreshToken}}).promise;
        if(res.Count === 0) return null;
        return res.items[0];
    }
    
    async deleteByToken(refreshToken) {
        const session = await this.findByToken(refreshToken);
        if (!session) return null;

        await dynamo
        .delete({
            TableName: TABLE,
            Key: { id: session.id },
        })
        .promise();

        return session;
  }
    async deleteByUser(userId) {
        const res = await dynamo
        .query({
            TableName: TABLE,
            IndexName: "userId-index",
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: { ":uid": userId },
        })
        .promise();

        if (res.Count === 0) return;

        for (const session of res.Items) {
        await dynamo
            .delete({
            TableName: TABLE,
            Key: { id: session.id },
            })
            .promise();
        }
    }
}