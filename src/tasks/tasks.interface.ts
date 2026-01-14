export interface CreateTaskDTO {
  title: string;
  details?: string;
  status: "todo" | "in-progress" | "is done";
  priority: "low" | "medium" | "high";
  dueDate: Date;
  orgId: number;
}

export interface UpdateTaskDTO {
  title?: string;
  details?: string;
  status?: "todo" | "in-progress" | "is done";
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
}
