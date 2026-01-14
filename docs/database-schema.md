# Database Schema Documentation

This schema implements a **multi-tenant task management system** with users, organizations, role-based membership, authentication artifacts, and organization-scoped tasks.

---

## Entity Overview

- **User**: Authenticated account holder
- **Organization**: Tenant boundary for data isolation
- **Users ↔ Organizations**: Many-to-many membership with roles
- **Task**: Work items scoped to an organization
- **Auth Tables**: Session, Account, Verification

---

## Tables

### `organizations`

Represents a tenant/workspace.

| Column | Type         | Constraints  | Description       |
| ------ | ------------ | ------------ | ----------------- |
| `id`   | integer      | PK, identity | Organization ID   |
| `name` | varchar(255) | nullable     | Organization name |

**Relations**

- `organizations → tasks` (one-to-many)
- `organizations → users_to_organizations` (one-to-many)

---

### `user`

Represents an authenticated user.

| Column          | Type      | Constraints               | Description               |
| --------------- | --------- | ------------------------- | ------------------------- |
| `id`            | text      | PK                        | User ID                   |
| `name`          | text      | NOT NULL                  | Display name              |
| `email`         | text      | NOT NULL, UNIQUE          | Email address             |
| `emailVerified` | boolean   | NOT NULL, default `false` | Email verification status |
| `image`         | text      | nullable                  | Avatar URL                |
| `createdAt`     | timestamp | NOT NULL, default now     | Creation timestamp        |
| `updatedAt`     | timestamp | NOT NULL, default now     | Last update timestamp     |

**Relations**

- `user → users_to_organizations` (one-to-many)

---

### `users_to_organizations`

Join table representing user membership in organizations with roles.

| Column    | Type            | Constraints               | Description              |
| --------- | --------------- | ------------------------- | ------------------------ |
| `user_id` | text            | PK, FK → user.id          | User ID                  |
| `org_id`  | integer         | PK, FK → organizations.id | Organization ID          |
| `role`    | enum(user_role) | default `member`          | Role within organization |

**Primary Key**

- Composite: (`user_id`, `org_id`)

**Relations**

- `users_to_organizations → user` (many-to-one)
- `users_to_organizations → organization` (many-to-one)

---

### `tasks`

Represents a task belonging to an organization.

| Column       | Type                | Constraints                     | Description         |
| ------------ | ------------------- | ------------------------------- | ------------------- |
| `id`         | integer             | PK, identity                    | Task ID             |
| `title`      | varchar(255)        | NOT NULL                        | Task title          |
| `details`    | varchar(1000)       | nullable                        | Task description    |
| `status`     | enum(task_status)   | NOT NULL, default `todo`        | Task status         |
| `priority`   | enum(task_priority) | NOT NULL                        | Task priority       |
| `due_date`   | timestamp (tz)      | NOT NULL                        | Due date            |
| `created_at` | timestamp (tz)      | NOT NULL, default now           | Creation timestamp  |
| `org_id`     | integer             | NOT NULL, FK → organizations.id | Owning organization |

**Indexes**

- `tasks_org_id_index` on (`org_id`)
- `tasks_org_id_status_due_date_index` on (`org_id`, `status`, `due_date`)

**Relations**

- `tasks → organization` (many-to-one)

---

## Authentication Tables

### `session`

Stores active login sessions.

| Column      | Type      | Constraints                      | Description        |
| ----------- | --------- | -------------------------------- | ------------------ |
| `id`        | text      | PK                               | Session ID         |
| `expiresAt` | timestamp | NOT NULL                         | Expiration time    |
| `token`     | text      | NOT NULL, UNIQUE                 | Session token      |
| `createdAt` | timestamp | NOT NULL, default now            | Creation timestamp |
| `updatedAt` | timestamp | NOT NULL, default now            | Update timestamp   |
| `ipAddress` | text      | nullable                         | Client IP          |
| `userAgent` | text      | nullable                         | Client user agent  |
| `userId`    | text      | NOT NULL, FK → user.id (CASCADE) | Owning user        |

---

### `account`

Stores external or credential-based login accounts.

| Column                  | Type      | Constraints                      | Description                   |
| ----------------------- | --------- | -------------------------------- | ----------------------------- |
| `id`                    | text      | PK                               | Account ID                    |
| `accountId`             | text      | NOT NULL                         | Provider account identifier   |
| `providerId`            | text      | NOT NULL                         | Auth provider                 |
| `userId`                | text      | NOT NULL, FK → user.id (CASCADE) | Linked user                   |
| `accessToken`           | text      | nullable                         | OAuth access token            |
| `refreshToken`          | text      | nullable                         | OAuth refresh token           |
| `idToken`               | text      | nullable                         | ID token                      |
| `accessTokenExpiresAt`  | timestamp | nullable                         | Access token expiry           |
| `refreshTokenExpiresAt` | timestamp | nullable                         | Refresh token expiry          |
| `scope`                 | text      | nullable                         | OAuth scope                   |
| `password`              | text      | nullable                         | Password hash (if applicable) |
| `createdAt`             | timestamp | NOT NULL, default now            | Creation timestamp            |
| `updatedAt`             | timestamp | NOT NULL, default now            | Update timestamp              |

---

### `verification`

Stores verification tokens (e.g., email verification, password reset).

| Column       | Type      | Constraints | Description                     |
| ------------ | --------- | ----------- | ------------------------------- |
| `id`         | text      | PK          | Verification ID                 |
| `identifier` | text      | NOT NULL    | Target identifier (email, etc.) |
| `value`      | text      | NOT NULL    | Verification value/token        |
| `expiresAt`  | timestamp | NOT NULL    | Expiration time                 |
| `createdAt`  | timestamp | nullable    | Creation timestamp              |
| `updatedAt`  | timestamp | nullable    | Update timestamp                |

---

## Enums

### `user_role`

- `admin`
- `member`

### `task_status`

- `todo`
- `in-progress`
- `is done`

### `task_priority`

- `low`
- `medium`
- `high`

---

## Design Notes

- **Multi-tenancy**: All tasks are scoped to an organization via `org_id`.
- **Role-based access**: User permissions are derived from `users_to_organizations.role`.
- **Data isolation**: Cross-organization access must join through membership.
- **Indexing strategy**: Optimized for organization-scoped task queries with status and due date filters.
- **Auth compatibility**: Schema aligns with common auth systems (e.g., OAuth + credentials).

---

## Possible Extensions

- Example queries
- ER diagram
- Access control rules per role
- API-level constraints and invariants
