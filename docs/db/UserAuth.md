### Access Patterns

1. **User Registration (Sign-Up)**

   * **Pattern**: When a new user signs up, their data is stored in the DynamoDB table.
   * **How it's satisfied**: The table stores user profile data (`user_id`, `email`, `role`, `name`, `created_at`, and `updated_at`) after the user is created via Cognito. We use the **`user_id`** as the partition key and **`email`** as the sort key for efficient lookups.

2. **User Login (Authentication)**

   * **Pattern**: When a user logs in, they provide their `email` and `password` to authenticate. We need to check if the user exists and validate their credentials.
   * **How it's satisfied**: While the **password validation** is handled by **Cognito**, the **email** can be used as the sort key (`email`) to identify the user in the table. The **`user_id`** can be used as the partition key for this query if needed (after authentication via Cognito).
   * **Enhancement**: A **Global Secondary Index (GSI)** on `email` can be added to enable fast lookups by email, which would make it more efficient when querying by `email`.

3. **Get User Profile**

   * **Pattern**: Fetch the user profile information based on the `user_id` or `email`.
   * **How it's satisfied**:

     * **Query by `user_id`**: The **`user_id`** is the partition key, allowing efficient retrieval of a user's profile using `user_id`.
     * **Query by `email`**: Using the **Global Secondary Index (GSI)** on `email` makes it possible to quickly query the user profile by `email` as well.

4. **Update User Profile**

   * **Pattern**: Allow users to update their profile information (like `name`, `role`, etc.).
   * **How it's satisfied**: The **`user_id`** is the partition key, which allows for direct updates to the user's profile by querying the table using the `user_id`. Updates to user attributes (such as `name`, `role`, and timestamps) can be performed efficiently.

5. **Logout (Invalidate Session)**

   * **Pattern**: Logout involves clearing the JWT token on the client side, which doesn't require changes to the database.
   * **How it's satisfied**: **DynamoDB** doesn't need to store session data, as this is managed through **Cognito's JWT tokens**. The session invalidation is handled client-side by removing the token.

---

### How the Table Satisfies These Patterns:

| **Pattern**                     | **Table Design**                                                                                                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Registration (Sign-Up)** | The **`user_id`** is stored as the partition key, and the **`email`** is stored as the sort key. This ensures that new users are stored and easily queried by both `user_id` and `email`. |
| **User Login (Authentication)** | Password validation is handled by **Cognito**, while user data is retrieved by querying **`email`** or **`user_id`** using the sort or partition key.                                     |
| **Get User Profile**            | **Query by `user_id`** (partition key) for direct user profile retrieval. The **GSI on `email`** allows querying by email as well.                                                        |
| **Update User Profile**         | **`user_id`** is the partition key, so the profile can be updated efficiently using `user_id`.                                                                                            |
| **Logout (Invalidate Session)** | Handled by client-side token management via **Cognito**. No need for session data in the DynamoDB table.                                                                                  |

---

### Table Design Summary:

1. **Partition Key**: `user_id` (unique for each user) enables efficient lookups and updates.
2. **Sort Key**: `email` (unique for each user) supports queries and retrieval of user data by email.
3. **Global Secondary Index (GSI)** on `email`: Provides an efficient way to query by email for user profile retrieval.
4. **Attributes**: Stores non-sensitive profile data such as `role`, `name`, `created_at`, and `updated_at`.

With these attributes and keys, the table design supports the necessary access patterns for your **User Authentication Service**.
