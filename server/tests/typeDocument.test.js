import request from "supertest";
import { app, server } from "../index.js";
require('dotenv').config();
describe("Document Type API", () => {
  let agent;
  beforeAll(async () => {
    agent = request.agent(app);
    await agent
      .post("/api/sessions")
      .send({
        username: "mario@test.it",
        password: process.env.TEST_USER_PASSWORD,
      });
  });

  describe("GET /api/types", () => {
    it("should retrieve all document types", async () => {
      const response = await agent.get("/api/types");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty("id");
        expect(response.body[0]).toHaveProperty("iconsrc");
        expect(response.body[0]).toHaveProperty("type");
      }
    });
  });

  describe("GET /api/types/:typeId", () => {
    it("should retrieve a specific document type by ID", async () => {
      const typeId = 1;

      const response = await agent.get(`/api/types/${typeId}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty("id", typeId);
        expect(response.body).toHaveProperty("iconsrc");
        expect(response.body).toHaveProperty("type");
      } else {
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("error", "Type not found");
      }
    });

    it("should return 404 for a non-existent document type ID", async () => {
      const nonExistentTypeId = 1000;

      const response = await agent.get(`/api/types/${nonExistentTypeId}`);

      expect(response.body).toHaveProperty("error", "Type not found.");
    });
  });
  it("should add a new document type when authenticated", async () => {
    const newType = {
      type: "Report",
      iconSrc: "report-icon.png",
    };

    const mockResult = 1; // Mock the result of the addType function
    //typeDocumentDao.addType.mockResolvedValue(mockResult);

    const response = await agent.post("/api/types").send(newType);

    expect(response.status).toBe(201);
    expect(response.body.typeId).toHaveProperty('Type', 'Report');
    expect(response.body.typeId).toHaveProperty('IconSrc', 'report-icon.png');
    expect(response.body).toHaveProperty("message", "Type added successfully.");
  });

  it("should return 500 if required fields are missing", async () => {
    const invalidType = {
      iconSrc: "invalid-icon.png", // Missing 'type'
    };

    const response = await agent.post("/api/types").send(invalidType);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "type and iconSrc are required.");
  });
});
