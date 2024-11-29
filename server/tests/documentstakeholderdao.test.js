"use strict";

const documentStakeholderDao = require("../dao/document-stakeholder-dao");
const db = require("../db/db");
jest.mock("../db/db"); // Mock the db module

describe("documentStakeholderDao", () => {
  describe("addStakeholderToDocument", () => {
    const documentId = 1;
    const stakeholderId = 2;

    it("should add a stakeholder to the document successfully", async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null); // Simulate success
      });

      const result = await documentStakeholderDao.addStakeholderToDocument(
        documentId,
        stakeholderId
      );
      expect(result).toBe(true);
    });

    it("should reject if there is a database error", async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error("DB error"));
      });

      await expect(
        documentStakeholderDao.addStakeholderToDocument(
          documentId,
          stakeholderId
        )
      ).rejects.toThrow("DB error");
    });
  });

  describe("getStakeholdersByDocument", () => {
    const documentId = 1;
    const mockRows = [
      { IdStakeholder: 1, Name: "Test", Color: "0x0000" },
      { IdStakeholder: 2, Name: "Debug", Color: "0x1230" },
    ];

    it("should return all stakeholders for a document", async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockRows);
      });

      const stakeholders =
        await documentStakeholderDao.getStakeholdersByDocument(documentId);
      expect(stakeholders).toEqual(mockRows);
    });

    it("should reject if there is a database error", async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error("DB error"));
      });

      await expect(
        documentStakeholderDao.getStakeholdersByDocument(documentId)
      ).rejects.toThrow("DB error");
    });
  });

  describe("getDocumentsByStakeholder", () => {
    const stakeholderId = 2;
    const mockRows = [
      { IdDocument: 1, Title: "Document 1" },
      { IdDocument: 2, Title: "Document 2" },
    ];

    it("should return all documents for a stakeholder", async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(null, mockRows);
      });

      const documents = await documentStakeholderDao.getDocumentsByStakeholder(
        stakeholderId
      );
      expect(documents).toEqual(mockRows);
    });

    it("should reject if there is a database error", async () => {
      db.all.mockImplementation((sql, params, callback) => {
        callback(new Error("DB error"));
      });

      await expect(
        documentStakeholderDao.getDocumentsByStakeholder(stakeholderId)
      ).rejects.toThrow("DB error");
    });
  });
});
