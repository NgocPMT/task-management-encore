import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  tasks: many(tasks),
  usersToOrganizations: many(usersToOrganizations),
}));

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  usersToOrganizations: many(usersToOrganizations),
}));

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const usersRoleEnum = pgEnum("user_role", ["admin", "member"]);

export const usersToOrganizations = pgTable(
  "users_to_organizations",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    orgId: integer("org_id")
      .notNull()
      .references(() => organizations.id),
    role: usersRoleEnum().default("member"),
  },
  (table) => [primaryKey({ columns: [table.userId, table.orgId] })]
);

export const usersToOrganizationsRelations = relations(
  usersToOrganizations,
  ({ one }) => ({
    user: one(user, {
      fields: [usersToOrganizations.userId],
      references: [user.id],
    }),
    organization: one(organizations, {
      fields: [usersToOrganizations.orgId],
      references: [organizations.id],
    }),
  })
);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in-progress",
  "is done",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const tasks = pgTable(
  "tasks",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    details: varchar({ length: 1000 }),
    status: taskStatusEnum().default("todo").notNull(),
    priority: taskPriorityEnum().notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    orgId: integer("org_id")
      .notNull()
      .references(() => organizations.id),
  },
  (table) => [
    index("tasks_org_id_index").on(table.orgId),
    index("tasks_org_id_status_due_date_index").on(
      table.orgId,
      table.status,
      table.dueDate
    ),
  ]
);

export const tasksRelations = relations(tasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [tasks.orgId],
    references: [organizations.id],
  }),
}));
