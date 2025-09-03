### **User Actions on the Frontend**

#### **1. Authentication & User Profile**

* **Sign Up**: Users should be able to create a new account via email, username, and password.
* **Login**: Users should log in using email/username and password, receiving a **JWT token** for secure API access.
* **Logout**: Users should be able to log out, invalidating their session and JWT token.
* **View Profile**: Users can view their own profile, which includes:

  * **Name**, **Email**, and **Role** (Admin, Manager, User).
  * **Task history**: A list of tasks they've been involved in.



#### **2. Task Dashboard**

* **View Task Overview**:

  * Display a list of all tasks assigned to the logged-in user.
  * Tasks should be **filterable** by:

    * **Status**: To Do, In Progress, Completed, Blocked.
    * **Priority**: Low, Medium, High.
    * **Due Date**: Tasks due soon or overdue.
    * **Assignee**: For managers or admins, tasks can be filtered by the assigned user.
    * **Search by Title/Description**: Allow searching for specific tasks based on keywords.

* **Sort Tasks**: Ability to sort tasks by:

  * **Due Date**: Upcoming or overdue tasks.
  * **Priority**: Show tasks with the highest priority at the top.
  * **Status**: Group tasks by their status (e.g., To Do first).

* **View Task Status & Progress**: Users should be able to see the current status of their tasks (e.g., In Progress, Pending).

#### **3. Task Management (CRUD Operations)**

* **Create a Task**:

  * Users should be able to create a new task by entering:

    * **Title**, **Description**, **Priority**, **Due Date**, and **Assignee**.
  * Optionally, set an **SLA deadline** for time-sensitive tasks.
* **Edit a Task**:

  * Users can update the following fields (depending on role):

    * **Title**, **Description**, **Priority**, **Due Date**, **Assigned User**, **Status**.
  * **Status Updates**: Mark the task as **In Progress**, **Completed**, or **Blocked**.
* **Assign a Task**:

  * Admins and Managers can assign tasks to specific users.
* **Delete a Task**:

  * Users can delete tasks they’ve created. Admins or Managers can delete any task.



#### **4. Task Details & Activity Tracking**

* **View Task Details**:

  * A user can click on any task to view detailed information:

    * **Title**, **Description**, **Priority**, **Status**, **Due Date**, **Assignee**, **Task Logs**.
    * **Activity Logs**: A history of all actions (e.g., task creation, status changes, assignments).
    * **Comments Section**: Users can view comments made on the task (if enabled).
* **Add Comments to Task**:

  * Users can add comments to a task for collaboration (e.g., status updates, feedback).
* **View Task History**:

  * A complete list of all updates made to the task, including:

    * **Who changed what** (e.g., assignee, status).
    * **When the change occurred**.



#### **5. Notifications**

* **Real-Time Task Notifications**:

  * Users will receive notifications when:

    * They are **assigned to a task**.
    * The **status of a task** they are working on changes.
    * **Task deadlines** are approaching or missed (SLA tracking).
* **View Notifications**:

  * Users can view all notifications in a dedicated **Notification Center**.
  * Notifications should be **marked as read** once viewed.
  * Option to **filter** notifications by type (e.g., task assignments, status updates).



#### **6. SLA Tracking**

* **Track SLA Deadlines**:

  * Users can see which tasks are **approaching their SLA deadlines** or have **missed them**.
  * Tasks nearing their deadline should be **highlighted** (e.g., red for overdue, yellow for approaching).
* **View Overdue Tasks**:

  * Admins and Managers can easily filter and view tasks that have **missed their SLA deadlines**.
* **SLA Breach Alerts**:

  * Real-time notifications will be sent when a task has missed its SLA deadline.



#### **7. Analytics & Reporting**

* **View Task Metrics**:

  * Users can view task-related performance metrics:

    * **MTTR (Mean Time to Repair)**: Average time taken to resolve a task.
    * **Task Completion Rate**: Number of tasks completed in a given period (e.g., weekly/monthly).
    * **SLA Compliance**: Percentage of tasks completed within the SLA timeframe.

* **Dashboard for Admin/Manager**:

  * Admins and Managers can see aggregated metrics:

    * **Total number of tasks** created, **completed**, **blocked**, etc.
    * **Performance metrics** for each user (e.g., number of completed tasks, average completion time).
    * **SLA compliance** for the team.



#### **8. Admin and Manager-Specific Actions**

* **Manage Users** (Admin):

  * Admins can create new users, assign them roles (Admin, Manager, User), and modify existing users’ profiles.
* **Assign Tasks to Users** (Manager/Admin):

  * Managers or Admins can assign tasks to team members and ensure appropriate task allocation.
* **Monitor Team Performance** (Manager/Admin):

  * Admins and Managers can monitor overall team performance and task progress, tracking **MTTR**, **SLA compliance**, and **task backlog**.



#### **9. Task Assignment Automation**

* **Automatic Task Assignment from CI/CD Failures**:

  * When a **CI/CD pipeline** fails, automatically create and assign tasks for fixing the issue (e.g., deploy fix or investigate error).
* **Automatic Task Assignment from System Alerts**:

  * When a **system alert** (e.g., CPU high, service down) triggers, automatically create and assign tasks to relevant team members.



### **10. Miscellaneous Features**

* **Search Tasks**:

  * Allow users to search for tasks by keywords in the **title** or **description**.

* **Task Filtering**:

  * Filter tasks by **assignee**, **status**, **priority**, and **due date**.

* **Role-Based Views**:

  * Depending on the user’s role (Admin, Manager, User), they will have access to different views of the task dashboard and task management features.



### **Summary of User Actions**

1. **Authentication**: Sign up, log in, log out, view profile.
2. **Task Management**: Create, update, assign, delete tasks.
3. **Task Details**: View task details, activity logs, add comments.
4. **Notifications**: Receive real-time notifications, mark as read.
5. **SLA Management**: Track SLA deadlines, view overdue tasks, get breach alerts.
6. **Analytics**: View performance metrics like MTTR, SLA compliance.
7. **Admin/Manager Actions**: Manage users, assign tasks, monitor team performance.
8. **Automation**: Automatically create and assign tasks from CI/CD or system alerts.
9. **Search & Filter**: Search and filter tasks by various attributes (assignee, status, priority).




