import * as z from "zod";
import { taskPriorityEnum, taskStatusEnum } from "../schema";

export const ReadTasksByOrgSchema = z.object({
  orgId: z.int().positive(),
});

export const TaskIdParamSchema = z.coerce.number().int().positive();

export const CreateTaskSchema = z.object({
  title: z.string(),
  details: z.string().max(1000).optional(),
  status: z.enum(taskStatusEnum.enumValues).optional(),
  priority: z.enum(taskPriorityEnum.enumValues),
  dueDate: z.coerce.date(),
  orgId: z.int().positive(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().optional(),
  details: z.string().max(1000).optional(),
  status: z.enum(taskStatusEnum.enumValues).optional(),
  priority: z.enum(taskPriorityEnum.enumValues).optional(),
  dueDate: z.coerce.date().optional(),
});

export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;
