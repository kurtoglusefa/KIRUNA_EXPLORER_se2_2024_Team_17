import request from "supertest";
import { app, server } from "../index.js";
require("dotenv").config();

const DocumentStakeholderDao = require("../dao/document-stakeholder-dao.js");
jest.mock("../dao/document-stakeholder-dao.js");

describe("Document Stakeholders API", () => {
  let agent;

  beforeAll(async () => {
    agent = request.agent(app);

    await agent
      .post("/api/sessions")
      .send({ username: "mario@test.it", password: process.env.TEST_USER_PASSWORD, });
  });

  describe("POST /api/documents/:documentId/stakeholders/:stakeholderId", () => {
    it("should add a stakeholder to a document successfully", async () => {
      DocumentStakeholderDao.addStakeholderToDocument.mockResolvedValue(true);

      const response = await agent.post("/api/documents/1/stakeholders/2");

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Stakeholder added successfully.",
      });
    });

    it("should return 400 if adding the stakeholder fails", async () => {
      DocumentStakeholderDao.addStakeholderToDocument.mockResolvedValue(false);

      const response = await agent.post("/api/documents/1/stakeholders/2");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Failed to add stakeholder." });
    });

    it("should return 500 for database errors", async () => {
      DocumentStakeholderDao.addStakeholderToDocument.mockRejectedValue(
        new Error("Database error")
      );

      const response = await agent.post("/api/documents/1/stakeholders/2");

      expect(response.status).toBe(500);
    });
  });

  describe("GET /api/documents/:documentId/stakeholders", () => {
    it("should retrieve all stakeholders for a document", async () => {
      const mockStakeholders = [
        { IdStakeholder: 1, Name: "Test", Color: "0x00000" },
        { IdStakeholder: 2, Name: "Debug", Color: "0x12300" },
      ];
      DocumentStakeholderDao.getStakeholdersByDocument.mockResolvedValue(
        mockStakeholders
      );

      const response = await agent.get("/api/documents/1/stakeholders");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStakeholders);
    });

    it("should return 500 for database errors", async () => {
      DocumentStakeholderDao.getStakeholdersByDocument.mockRejectedValue(
        new Error("Database error")
      );

      const response = await agent.get("/api/documents/1/stakeholders");

      expect(response.status).toBe(500);
    });
  });

  describe("GET /api/stakeholders/:stakeholderId/documents", () => {
    it("should retrieve all documents for a stakeholder", async () => {
      const mockDocuments = [
        {
          IdDocument: 1,
          Title: "Document 1",
          Description: "Desc 1",
          Issuance_Date: "2023-01-01",
          Language: "English",
        },
        {
          IdDocument: 2,
          Title: "Document 2",
          Description: "Desc 2",
          Issuance_Date: "2023-02-01",
          Language: "English",
        },
      ];
      DocumentStakeholderDao.getDocumentsByStakeholder.mockResolvedValue(
        mockDocuments
      );

      const response = await agent.get("/api/stakeholders/1/documents");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocuments);
    });

    it("should return 500 for database errors", async () => {
      DocumentStakeholderDao.getDocumentsByStakeholder.mockRejectedValue(
        new Error("Database error")
      );

      const response = await agent.get("/api/stakeholders/1/documents");

      expect(response.status).toBe(500);
    });
  });

  describe("DELETE /api/documents/:documentId/stakeholders", () => {
    it("should clear stakeholders from a document successfully", async () => {
      DocumentStakeholderDao.clearStakeholdersFromDocument.mockResolvedValue(
        true
      );

      const response = await agent.delete("/api/documents/1/stakeholders");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Stakeholders removed successfully.",
      });
    });

    it("should return 404 if no stakeholders were removed", async () => {
      DocumentStakeholderDao.clearStakeholdersFromDocument.mockResolvedValue(
        false
      );

      const response = await agent.delete("/api/documents/1/stakeholders");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "No stakeholders found to remove.",
      });
    });

    it("should return 500 for database errors", async () => {
      DocumentStakeholderDao.clearStakeholdersFromDocument.mockRejectedValue(
        new Error("Database error")
      );

      const response = await agent.delete("/api/documents/1/stakeholders");

      expect(response.status).toBe(500);
    });
  });
});
