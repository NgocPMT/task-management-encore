import { relations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

export const organizations = p.pgTable("organizations", {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: p.varchar({ length: 255 }),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  tasks: many(tasks),
  usersToOrganizations: many(usersToOrganizations),
}));

export const users = p.pgTable("user", {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  name: p.varchar({ length: 255 }),
  email: p.varchar({ length: 255 }).unique(),
  password: p.text(),
});

export const usersRelations = relations(users, ({ many }) => ({
  usersToOrganizations: many(usersToOrganizations),
}));

export const usersRoleEnum = p.pgEnum("user_role", ["admin", "member"]);

export const usersToOrganizations = p.pgTable(
  "users_to_organizations",
  {
    userId: p
      .integer("user_id")
      .notNull()
      .references(() => users.id),
    orgId: p
      .integer("org_id")
      .notNull()
      .references(() => organizations.id),
    role: usersRoleEnum().default("member"),
  },
  (table) => [p.primaryKey({ columns: [table.userId, table.orgId] })]
);

export const usersToOrganizationsRelations = relations(
  usersToOrganizations,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToOrganizations.userId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [usersToOrganizations.orgId],
      references: [organizations.id],
    }),
  })
);

export const taskStatusEnum = p.pgEnum("task_status", [
  "todo",
  "in-progress",
  "is done",
]);

export const taskPriorityEnum = p.pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const tasks = p.pgTable(
  "tasks",
  {
    id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
    title: p.varchar({ length: 255 }).notNull(),
    details: p.varchar({ length: 1000 }),
    status: taskStatusEnum().default("todo").notNull(),
    priority: taskPriorityEnum().notNull(),
    dueDate: p.timestamp("due_date", { withTimezone: true }).notNull(),
    createdAt: p
      .timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    orgId: p
      .integer("org_id")
      .notNull()
      .references(() => organizations.id),
  },
  (table) => [
    p.index("tasks_org_id_index").on(table.orgId),
    p
      .index("tasks_org_id_status_due_date_index")
      .on(table.orgId, table.status, table.dueDate),
  ]
);

export const tasksRelations = relations(tasks, ({ one }) => ({
  organization: one(organizations, {
    fields: [tasks.orgId],
    references: [organizations.id],
  }),
}));
