import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "../database";
import { tasks } from "../schema";

type Task = InferSelectModel<typeof tasks>;
type NewTask = InferInsertModel<typeof tasks>;
type UpdateTask = Partial<Omit<NewTask, "orgId" | "createdAt">>;

const TaskRepository = {
  findAllByOrg: async (orgId: number): Promise<Task[]> => {
    const rows = await db.select().from(tasks).where(eq(tasks.orgId, orgId));
    return rows;
  },

  findOne: async (id: number): Promise<Task | null> => {
    const [task] = await db
      .selectDistinct()
      .from(tasks)
      .where(eq(tasks.id, id));
    return task ?? null;
  },

  create: async (data: NewTask): Promise<Task | null> => {
    const [task] = await db.insert(tasks).values(data).returning();
    return task ?? null;
  },

  update: async (id: number, data: UpdateTask): Promise<Task | null> => {
    const [task] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return task ?? null;
  },

  delete: async (id: number): Promise<boolean> => {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount === 1;
  },
};

export default TaskRepository;
