# **User Authentication Service for Task Management System (TMS)**

### **Project Overview**

The **User Authentication Service** is a key component of the **Task Management System (TMS)** designed to securely manage user access and interactions. This service provides essential features such as **user sign-up**, **login**, **profile management**, and **JWT token-based authentication**. It ensures that only authorized users can access the TMS, while also allowing for role-based access control (RBAC) to determine user permissions within the system.

### **Technologies Used**

* **AWS Cognito**: For handling user sign-up, login, and authentication with JWT tokens.
* **AWS Lambda**: To implement the business logic for user registration, login, profile updates, and logout.
* **Amazon API Gateway**: To expose RESTful API endpoints for frontend communication.
* **Amazon DynamoDB**: To store user profile information (name, email, role).
* **JWT Tokens**: For securing APIs and providing stateless authentication.
* **Amazon CloudWatch**: For logging Lambda function invocations and monitoring performance.



### **Features Implemented**

#### **1. User Sign-Up**

**Objective**: Allow users to create an account by providing their email, username, password, and role.

* I set up an **Amazon Cognito User Pool** for user registration and authentication.
* When a user signs up, the **Cognito User Pool** stores their credentials securely (passwords are hashed).
* Upon successful sign-up, the system generates a confirmation email to verify the user's email address.
* User profile data (such as `name`, `role`, `email`) is stored in **Amazon DynamoDB** for easy access and updates.

**API Endpoint**:

* `POST /auth/signup` – Registers a new user.



#### **2. User Login**

**Objective**: Allow registered users to log in using their credentials and receive a **JWT token** for session management.

* Upon login, I used **Cognito’s AdminInitiateAuth API** to authenticate users with their **email/username** and **password**.
* If authentication is successful, the system generates **JWT access and refresh tokens**.
* The **JWT tokens** are then returned to the frontend to be used for securing future API calls.

**API Endpoint**:

* `POST /auth/login` – Authenticates a user and generates a JWT token.



#### **3. Profile Management**

**Objective**: Allow users to view and update their profile information.

* After login, users can retrieve their profile using the **JWT access token**.
* I created an API that fetches user profile data from **DynamoDB**, which stores user information like `name`, `email`, and `role`.
* The system also allows users to update their profiles (e.g., change name or role) via a secure API endpoint.

**API Endpoints**:

* `GET /auth/profile` – Retrieve user profile details.
* `PUT /auth/profile` – Update user profile (name, role).



#### **4. Logout Functionality**

**Objective**: Allow users to log out by invalidating their session and JWT token.

* **JWT tokens** are stored on the frontend (usually in localStorage or sessionStorage). Upon logout, the frontend simply deletes the stored token to invalidate the session.
* **Optional**: For improved security, tokens can also be revoked in **Cognito** (via Admin APIs).

**API Endpoint**:

* `POST /auth/logout` – Invalidates the user’s session.



### **System Design**

#### **1. User Authentication Flow**

1. **Sign-Up**:

   * Users provide their **email**, **username**, and **password**.
   * Cognito handles account creation and sends a confirmation email for verification.
   * User data is stored in **DynamoDB** once verified.

2. **Login**:

   * Users provide their **email** and **password**.
   * The **Cognito User Pool** authenticates the user, and JWT tokens are generated.
   * Tokens are used for secure API communication.

3. **Profile Management**:

   * After login, users can view and edit their profiles.
   * The system retrieves user data from **DynamoDB** and returns it in the API response.

4. **Logout**:

   * JWT tokens are deleted from the frontend, invalidating the session.
   * Optionally, the backend can also invalidate the refresh token if needed.

#### **2. Security Considerations**

* **JWT Tokens**: All API calls (except public ones like sign-up) require authentication via JWT tokens.
* **Cognito** ensures that passwords are securely hashed and stored. Multi-factor authentication (MFA) can also be enabled for additional security.
* **Token Expiration**: JWT access tokens are short-lived (e.g., 1 hour), and **refresh tokens** are used to reauthenticate without requiring the user to log in again.
* **Role-Based Access Control (RBAC)**: Depending on the user’s role (Admin, Manager, User), different levels of access are provided to the APIs. For example, Admins can manage users, while regular users can only manage their own tasks.



### **API Gateway & Lambda Integration**

* **API Gateway** is used to expose RESTful APIs for the frontend to interact with.
* Each API request triggers the appropriate **Lambda function** that handles the logic.
* **Cognito Authorizers** are used in API Gateway to ensure that only authenticated users can access specific routes (e.g., `GET /auth/profile`).



### **DynamoDB Schema for User Profile**

The **User Profile Table** stores the user details (name, email, role) and is designed as follows:

* **Partition Key**: `user_id` (UUID or email)
* **Sort Key**: None
* **Attributes**:

  * `user_id`: Unique identifier for the user.
  * `email`: Email address.
  * `name`: Full name.
  * `role`: Role of the user (Admin, Manager, User).
  * `created_at`: Timestamp when the user account was created.
  * `updated_at`: Timestamp for the last profile update.



### **Challenges & Solutions**

* **Security**: Ensuring secure password storage and token management was key. I leveraged **Amazon Cognito** for secure authentication and **JWT** for stateless authorization.
* **Scalability**: By using **serverless components** like **Lambda** and **DynamoDB**, the authentication system can easily scale as the number of users grows.
* **Seamless User Experience**: By integrating **Cognito** for user management, I was able to quickly implement a secure and reliable authentication system with minimal overhead.



### **Conclusion**

The **User Authentication Service** for the **Task Management System (TMS)** provides a scalable, secure, and efficient way to handle user registration, login, and profile management. By leveraging **AWS Cognito**, **Lambda**, and **DynamoDB**, the system ensures high availability, security, and ease of maintenance, while allowing for seamless integration with other services in the microservices architecture.

This service plays a crucial role in the **Task Management System**, ensuring that only authenticated users can access and modify tasks based on their role.