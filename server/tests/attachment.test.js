import request from "supertest";
import { app } from "../index.js";
import fs from "fs";
import documentDao from "../dao/document-dao.js";

jest.mock("fs");
jest.mock("../dao/document-dao.js");
require("dotenv").config();

describe("Attachment API", () => {
  let agent;

  beforeAll(async () => {
    agent = request.agent(app);
    await agent
      .post("/api/sessions")
      .send({ username: "mario@test.it", password: process.env.TEST_USER_PASSWORD });
  });

  describe("POST /api/documents/:documentId/attachments", () => {
    it("should return 400 for invalid document ID", async () => {
      const response = await agent.post("/api/documents/invalid/attachments");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Invalid document ID" });
    });

    it("should return 404 if the document does not exist", async () => {
      documentDao.getDocumentById.mockResolvedValue(null);
      const response = await agent.post("/api/documents/123/attachments");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Document not found" });
    });

    it("should return 200 for successful upload", async () => {
      documentDao.getDocumentById.mockResolvedValue({ id: 123 });
      const response = await agent
        .post("/api/documents/123/attachments")
        .attach("files", Buffer.from("file content"), "testfile.txt");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Attachments uploaded successfully!",
        documentId: 123,
        files: expect.arrayContaining([
          expect.objectContaining({
            filename: "testfile.txt",
          }),
        ]),
      });
    });

    it("should return 400 if no files are uploaded", async () => {
      documentDao.getDocumentById.mockResolvedValue({ id: 123 });
      const response = await agent.post("/api/documents/123/attachments");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "No files uploaded or upload failed." });
    });
  });

  describe("DELETE /api/documents/:documentId/attachments/:filename", () => {
    it("should return 404 if the file does not exist", async () => {
      fs.existsSync.mockReturnValue(false);
      const response = await agent.delete("/api/documents/123/attachments/testfile.txt");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Attachment not found." });
    });

    it("should return 500 if file deletion fails", async () => {
      fs.existsSync.mockReturnValue(true);
      fs.unlink.mockImplementation((path, callback) => callback(new Error("Deletion error")));
      const response = await agent.delete("/api/documents/123/attachments/testfile.txt");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Failed to delete the attachment." });
    });

    it("should return 200 for successful file deletion", async () => {
      fs.existsSync.mockReturnValue(true);
      fs.unlink.mockImplementation((path, callback) => callback(null));
      const response = await agent.delete("/api/documents/123/attachments/testfile.txt");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Attachment deleted successfully." });
    });
  });

  describe("GET /api/documents/:documentId/attachments", () => {
    it("should return 404 if no attachments are found", async () => {
      fs.existsSync.mockReturnValue(false);
      const response = await agent.get("/api/documents/123/attachments");
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "No attachments found for this document" });
    });

    it("should return 500 if reading directory fails", async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockImplementation(() => {
        throw new Error("Read error");
      });

      const response = await agent.get("/api/documents/123/attachments");
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message: "Server error", error: expect.any(Object) });
    });

    it("should return 200 with a list of attachments", async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(["file1.txt", "file2.txt"]);
      const response = await agent.get("/api/documents/123/attachments");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            filename: "file1.txt",
            url: "/attachments/123/file1.txt",
          }),
          expect.objectContaining({
            filename: "file2.txt",
            url: "/attachments/123/file2.txt",
          }),
        ])
      );
    });
  });
});
