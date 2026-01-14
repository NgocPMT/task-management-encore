import { api, APIError } from "encore.dev/api";
import {
  CreateTaskSchema,
  ReadTasksByOrgSchema,
  TaskIdParamSchema,
  UpdateTaskSchema,
} from "./tasks.schema";
import { getAuthData } from "~encore/auth";
import TaskService from "./tasks.service";
import { AuthData } from "../auth/auth.interface";
import { CreateTaskDTO, UpdateTaskDTO } from "./tasks.interface";

export const readByOrg = api(
  { expose: true, auth: true, method: "POST", path: "/v1/tasks" },
  async (req: { orgId: number }) => {
    const result = ReadTasksByOrgSchema.safeParse(req);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw APIError.invalidArgument(`Invalid organization id: ${message}`);
    }

    const { orgId } = result.data;
    const authData = getAuthData() as AuthData;

    const tasks = await TaskService.readByOrg(orgId, authData.userID);

    return {
      data: tasks,
    };
  }
);

export const readOne = api(
  { expose: true, auth: true, method: "GET", path: "/v1/tasks/:id" },
  async (req: { id: string }) => {
    const result = TaskIdParamSchema.safeParse(req.id);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw APIError.invalidArgument(`Invalid task id: ${message}`);
    }

    const id = result.data;
    const authData = getAuthData() as AuthData;

    const task = await TaskService.readOne(id, authData.userID);

    return {
      data: task,
    };
  }
);

export const create = api(
  { expose: true, auth: true, method: "POST", path: "/v1/tasks/create" },
  async (req: CreateTaskDTO) => {
    const result = CreateTaskSchema.safeParse(req);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw APIError.invalidArgument(`Invalid create body: ${message}`);
    }

    const authData = getAuthData() as AuthData;

    const createdTask = await TaskService.create(result.data, authData.userID);

    return {
      data: createdTask,
    };
  }
);

export const update = api(
  { expose: true, auth: true, method: "PUT", path: "/v1/tasks/:id" },
  async (req: { id: string; body: UpdateTaskDTO }) => {
    const paramResult = TaskIdParamSchema.safeParse(req.id);
    const bodyResult = UpdateTaskSchema.safeParse(req.body);

    if (!paramResult.success) {
      const message = paramResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw APIError.invalidArgument(`Invalid task id: ${message}`);
    }

    if (!bodyResult.success) {
      const message = bodyResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw APIError.invalidArgument(`Invalid update body: ${message}`);
    }

    const authData = getAuthData() as AuthData;

    const updatedTask = await TaskService.update(
      paramResult.data,
      bodyResult.data,
      authData.userID
    );

    return {
      data: updatedTask,
    };
  }
);

export const destroy = api(
  { expose: true, auth: true, method: "DELETE", path: "/v1/tasks/:id" },
  async (req: { id: string }) => {
    const result = TaskIdParamSchema.safeParse(req.id);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      throw APIError.invalidArgument(`Invalid task id: ${message}`);
    }

    const id = result.data;
    const authData = getAuthData() as AuthData;

    const deleteResult = await TaskService.delete(id, authData.userID);

    return {
      message: deleteResult.message,
    };
  }
);
