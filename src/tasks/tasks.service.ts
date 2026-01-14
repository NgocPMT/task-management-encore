import { APIError } from "encore.dev/api";
import MembershipRepository from "../memberships/memberships.repository";
import TaskRepository from "./tasks.repository";
import { CreateTaskDTO, UpdateTaskDTO } from "./tasks.schema";
import log from "encore.dev/log";

const TaskService = {
  readByOrg: async (orgId: number, userId: string) => {
    log.trace("Validating membership");
    const membership = await MembershipRepository.isMember(userId, orgId);
    log.trace(`Membership: ${membership}`);

    if (!membership) {
      throw APIError.permissionDenied(
        "User is not a member of this organization"
      );
    }

    const tasks = await TaskRepository.findAllByOrg(orgId);
    return tasks;
  },

  readOne: async (id: number, userId: string) => {
    const task = await TaskRepository.findOne(id);

    if (!task) {
      throw APIError.notFound("Task not found");
    }

    const membership = await MembershipRepository.isMember(userId, task.orgId);

    if (!membership) {
      throw APIError.permissionDenied(
        "User is not a member of this organization to read"
      );
    }

    return task;
  },

  create: async (data: CreateTaskDTO, userId: string) => {
    const adminPermission = await MembershipRepository.isAdmin(
      userId,
      data.orgId
    );

    if (!adminPermission) {
      throw APIError.permissionDenied("Forbidden");
    }

    const createdTask = await TaskRepository.create(data);

    if (!createdTask) {
      throw APIError.internal("Failed to create task");
    }

    return createdTask;
  },

  update: async (id: number, data: UpdateTaskDTO, userId: string) => {
    const task = await TaskRepository.findOne(id);

    if (!task) {
      throw APIError.notFound("Task not found");
    }

    const adminPermission = await MembershipRepository.isAdmin(
      userId,
      task.orgId
    );

    if (!adminPermission) {
      throw APIError.permissionDenied("Forbidden");
    }

    const updatedTask = await TaskRepository.update(id, data);

    if (!updatedTask) {
      throw APIError.internal("Failed to update task");
    }

    return updatedTask;
  },

  delete: async (id: number, userId: string) => {
    const task = await TaskRepository.findOne(id);

    if (!task) {
      throw APIError.notFound("Task not found");
    }

    const adminPermission = await MembershipRepository.isAdmin(
      userId,
      task.orgId
    );

    if (!adminPermission) {
      throw APIError.permissionDenied("Forbidden");
    }

    const success = await TaskRepository.delete(id);

    if (!success) {
      throw APIError.internal("Failed to delete task");
    }

    return { message: "Task deleted successfully" };
  },
};

export default TaskService;
