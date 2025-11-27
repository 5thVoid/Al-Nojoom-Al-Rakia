import { CategoryService } from "../../services/category.service";
import { Category } from "../../types";

describe("CategoryService", () => {
  let service: CategoryService;

  beforeEach(() => {
    service = new CategoryService();
    jest.clearAllMocks();
  });

  describe("getTree", () => {
    it("should fetch categories with correct nested includes", async () => {
      const mockTree = [{ id: 1, name: "Hardware", subcategories: [] }];
      const findAllSpy = jest
        .spyOn(Category, "findAll")
        .mockResolvedValue(mockTree as any);

      const result = await service.getTree();

      expect(result).toEqual(mockTree);

      // Verify strict recursive query structure
      expect(findAllSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null },
          include: expect.arrayContaining([
            expect.objectContaining({
              model: Category,
              as: "subcategories",
              include: expect.anything(), // Checking deeper level exists
            }),
          ]),
        })
      );
    });
  });
});
