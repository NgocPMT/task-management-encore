# API Documentation

This document describes the **API Endpoints** implemented using **Encore**.\
All endpoints are **authenticated** and enforce **organization-based
access control**.

## Note

This Project is built for learning purpose, so doesn't have an Organization endpoint for creating organizations. To create an organization, go to [DB Explorer](http://127.0.0.1:9400/task-management-f7hi/db/tasks) and insert data manually after running the project locally.

## Authorization Model

- **Member** of an organization:
  - Can read tasks belonging to that organization
- **Admin** of an organization:
  - Can create, update, and delete tasks within that organization

Membership and role checks are enforced via `MembershipRepository`.

## Endpoints

### Register

Create a user in the database to authenticate.

**Endpoint**

    POST /v1/register

**Request Body**

```json
{
  "email: "john@example.com",
  "name": "john doe",
  "password": "12345678"
}
```

**Response**

```json
{
  "session": {
    "expiredAt": "2026-01-21T04:01:14.776Z",
    "token": "eocy7BB0Gvvwv3bbGg1PDWDyNo5nit9b"
  },

  "user": {
    "email": "john@example.com",
    "id": "clBhv4yC9DfU8IRirE9FLy64HbkuoPu2",
    "name": "john doe"
  }
}
```

**Errors**

- `400 invalid_argument` -- Invalid request body
- `500 internal` -- Email already exists
- `500 internal` -- Auth service failed to create user

---

### Login

Authenticate users.

**Endpoint**

    POST /v1/login

**Request Body**

```json
{
  "email: "john@example.com",
  "password": "12345678"
}
```

**Response**

```json
{
  "session": {
    "expiredAt": "2026-01-21T04:01:14.776Z",
    "token": "eocy7BB0Gvvwv3bbGg1PDWDyNo5nit9b"
  },

  "user": {
    "email": "john@example.com",
    "id": "clBhv4yC9DfU8IRirE9FLy64HbkuoPu2",
    "name": "john doe"
  }
}
```

**Errors**

- `400 invalid_argument` -- Invalid request body
- `401 unauthenticated` -- Invalid credentials

### Read Tasks by Organization

Fetch all tasks belonging to a specific organization.

**Endpoint**

    POST /v1/tasks

**Request Body**

```json
{
  "orgId": 1
}
```

**Authorization**

- User must be a **member** of the organization

**Response**

```json
{
  "data": [
    {
      "id": 1,
      "title": "Task title",
      "details": "Task details",
      "status": "todo",
      "priority": "high",
      "dueDate": "2026-01-20T00:00:00.000Z",
      "orgId": 1
    }
  ]
}
```

**Errors**

- `400 invalid_argument` -- Invalid organization id
- `403 permission_denied` -- User is not a member of the organization

---

### Read Single Task

Fetch a task by its ID.

**Endpoint**

    GET /v1/tasks/:id

**Path Parameters**

- `id`: task ID (positive integer)

**Authorization**

- User must be a **member** of the task's organization

**Response**

```json
{
  "data": {
    "id": 1,
    "title": "Task title",
    "details": "Task details",
    "status": "todo",
    "priority": "medium",
    "dueDate": "2026-01-20T00:00:00.000Z",
    "orgId": 1
  }
}
```

**Errors**

- `400 invalid_argument` -- Invalid task ID
- `404 not_found`-- Task not found
- `403 permission_denied` -- Not authorized to read
  the task

---

### Create Task

Create a new task within an organization.

**Endpoint**

    POST /v1/tasks/create

**Request Body**

```json
{
  "title": "New task",
  "details": "Optional details",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-01-20T00:00:00.000Z",
  "orgId": 1
}
```

**Authorization**

- User must be an **admin** of the organization

**Response**

```json
{
  "data": {
    "id": 1,
    "title": "New task",
    "details": "Optional details",
    "status": "todo",
    "priority": "high",
    "dueDate": "2026-01-20T00:00:00.000Z",
    "orgId": 1
  }
}
```

**Errors**

- `400 invalid_argument` -- Invalid request body
- `403 permission_denied` -- Not authorized to create the task

---

### Update Task

**Endpoint**

    PUT /v1/tasks/:id

**Path Parameters**

- `id`: task ID (positive integer)

**Request Body**

```json
{
  "title": "New title",
  "details": "New details",
  "status": "is done",
  "priority": "high",
  "dueDate": "2026-01-20T00:00:00.000Z"
}
```

_All fields are optional_

**Authorization**

- User must be an **admin** of the task's organization

**Response**

```json
{
  "data": {
    "id": 1,
    "title": "New task",
    "details": "New details",
    "status": "is done",
    "priority": "high",
    "dueDate": "2026-01-20T00:00:00.000Z",
    "orgId": 1
  }
}
```

**Errors**

- `400 invalid_argument` -- Invalid request body
- `404 not_found`-- Task not found
- `403 permission_denied` -- Not authorized to update the task

---

### Delete Task

**Endpoint**

    DELETE /v1/tasks/:id

**Path Parameters**

- `id`: task ID (positive integer)

**Authorization**

- User must be an **admin** of the task's organization

**Response**

```json
{
  "message": "Task deleted successfully"
}
```

**Errors**

- `400 invalid_argument` -- Invalid task id
- `404 not_found`-- Task not found
- `403 permission_denied` -- Not authorized to delete the task

---
