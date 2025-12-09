import { AdminUserService } from "../../services/adminUser.service";
import { User } from "../../types";
import { BaseService } from "../../services/base.service";

describe("AdminUserService", () => {
  let service: AdminUserService;

  beforeEach(() => {
    service = new AdminUserService();
    jest.clearAllMocks();
  });

  describe("getPaginatedUsers", () => {
    it("should strip password field", async () => {
      jest.spyOn(BaseService.prototype, "getAll").mockResolvedValue({
        data: [
          {
            get: jest.fn().mockReturnValue({
              id: 1,
              email: "admin@example.com",
              password: "secret",
              role: "admin",
            }),
          } as any,
        ],
        meta: { totalItems: 1, totalPages: 1, currentPage: 1, itemsPerPage: 10 },
      });

      const result = await service.getPaginatedUsers(1, 10);

      expect(result.data[0]).toEqual({
        id: 1,
        email: "admin@example.com",
        role: "admin",
      });
    });
  });

  describe("getUserById", () => {
    it("should return sanitized user", async () => {
      jest.spyOn(User, "findByPk").mockResolvedValue({
        get: jest.fn().mockReturnValue({
          id: 2,
          email: "user@example.com",
          role: "customer",
          password: "hash",
        }),
      } as any);

      const result = await service.getUserById(2);
      expect(result).toEqual({
        id: 2,
        email: "user@example.com",
        role: "customer",
      });
    });
  });

  describe("updateUser", () => {
    it("should return null when user does not exist", async () => {
      jest.spyOn(User, "findByPk").mockResolvedValue(null);
      const result = await service.updateUser(999, { role: "admin" } as any);
      expect(result).toBeNull();
    });

    it("should update and sanitize user", async () => {
      const mockUpdate = jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue({ id: 3, email: "test", role: "admin" }),
      });
      jest.spyOn(User, "findByPk").mockResolvedValue({ update: mockUpdate } as any);

      const result = await service.updateUser(3, { role: "admin" } as any);
      expect(result).toEqual({ id: 3, email: "test", role: "admin" });
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
