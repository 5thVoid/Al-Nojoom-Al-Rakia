import { BaseService } from "./base.service";
import { User } from "../types";

export interface SanitizedUser {
  id: number;
  email: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AdminUserService extends BaseService<User> {
  constructor() {
    super(User);
  }

  private sanitize(user: User | null): SanitizedUser | null {
    if (!user) return null;
    const plain = user.get({ plain: true }) as any;
    const { password, ...rest } = plain;
    return rest;
  }

  async getPaginatedUsers(page: number, limit: number) {
    const result = await super.getAll(page, limit, {
      attributes: { exclude: ["password"] },
      order: [["id", "DESC"]],
    });

    return {
      data: result.data
        .map((user: any) => this.sanitize(user))
        .filter(Boolean),
      meta: result.meta,
    };
  }

  async getUserById(id: number) {
    const user = await this.model.findByPk(id);
    return this.sanitize(user);
  }

  async createUser(data: Partial<User>) {
    const user = await this.model.create(data as any);
    return this.sanitize(user);
  }

  async updateUser(id: number, data: Partial<User>) {
    const user = await this.model.findByPk(id);
    if (!user) return null;
    const updated = await user.update(data as any);
    return this.sanitize(updated);
  }

  async deleteUser(id: number) {
    return this.delete(id);
  }
}

export const adminUserService = new AdminUserService();
