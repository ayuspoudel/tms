
import { userPool } from "./cognito";
import { userProfileTable } from "./dynamodb";

// Export important outputs

export const cognitoPoolId = userPool.id;
export const dynamoTableName = userProfileTable.name;