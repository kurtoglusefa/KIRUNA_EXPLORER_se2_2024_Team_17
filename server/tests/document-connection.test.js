import request from "supertest";

import { app } from "../index.js";

const DocumentConnectionDao = require("../dao/document-connection-dao.js");
const UserDao = require("../dao/user-dao.js");
jest.mock("../dao/document-connection-dao.js");
require("dotenv").config();

describe("Document Connections API", () => {
  let agent;

  beforeAll(async () => {
    agent = request.agent(app);

    // Simulate login to maintain session state for future requests
    await agent.post("/api/sessions").send({
      username: "mario@test.it",
      password: process.env.TEST_USER_PASSWORD,
    });
  });

  const mockConnections = [
    { IdDocument1: 1, IdDocument2: 2, IdConnection: 1 },
    { IdDocument1: 3, IdDocument2: 4, IdConnection: 2 },
  ];

  describe("GET /api/document-connections", () => {
    it("should retrieve all document connections", async () => {
      
      DocumentConnectionDao.getAllConnections.mockResolvedValue(mockConnections);
      const response = await request(app).get("/api/document-connections");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockConnections);
    });

    it("should handle errors", async () => {
      DocumentConnectionDao.getAllConnections.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/document-connections");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("GET /api/document-connections/:documentId", () => {
    it("should retrieve all connections for a specific document", async () => {
      const documentId = 1;
      DocumentConnectionDao.getConnections.mockResolvedValue({...mockConnections[0],IdConnectionDocuments:1});

      const response = await request(app).get(
        `/api/document-connections/${documentId}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({...mockConnections[0],IdConnectionDocuments:1});
    });

    it("should return 500 for database errors", async () => {
      DocumentConnectionDao.getConnections.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/document-connections/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
    });
  });

  describe("POST /api/document-connections", () => {
    it("should create a new document connection when authenticated", async () => {
      

      DocumentConnectionDao.createConnection.mockResolvedValue(mockConnections[0]);

      const response = await agent
        .post("/api/document-connections")
        .send(mockConnections[0]);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockConnections[0]);
    });

    it("should return 400 if required fields are missing", async () => {


      const response = await agent
        .post("/api/document-connections")
        .send({...mockConnections[0],IdConnection:''});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "The request body must contain all the required fields",
      });
    });

    it("should return 400 if a document tries to connect to itself", async () => {


      const response = await agent
        .post("/api/document-connections")
        .send({...mockConnections[0],IdDocument2:1,IdDocument1:1});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "A document cannot be connected to itself",
      });
    });

    it("should return 500 for database errors", async () => {
      
      DocumentConnectionDao.createConnection.mockRejectedValue(
        new Error("Database error")
      );

      const response = await agent
        .post("/api/document-connections")
        .send(mockConnections[0]);

      expect(response.status).toBe(500);
    });
  });

  describe("PATCH /api/documents/:documentId/connection", () => {
    it("should update the document connection successfully", async () => {
      const documentId = 1;
      const requestBody = {
        IdDocument2: 2,
        IdConnection: 3,
      };
      DocumentConnectionDao.updateConnection.mockResolvedValue(true);

      const response = await agent
        .patch(`/api/documents/${documentId}/connection`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Connection updated successfully.",
      });
    });

    it("should return 400 if newDocumentId2 or newConnectionId is missing", async () => {
      const documentId = 1;
      const incompleteRequestBody = {
        IdDocument2: 2,
        // Missing IdConnection
      };

      const response = await agent
        .patch(`/api/documents/${documentId}/connection`)
        .send(incompleteRequestBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "newDocumentId2 and newConnectionId are required.",
      });
    });

    it("should return 500 if updating the document connection fails", async () => {
      const documentId = 1;
      const requestBody = {
        IdDocument2: 2,
        IdConnection: 3,
      };

      DocumentConnectionDao.updateConnection.mockResolvedValue(false);

      const response = await agent
        .patch(`/api/documents/${documentId}/connection`)
        .send(requestBody);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Failed to update connection." });
    });

    it("should return 500 for database errors", async () => {
      const documentId = 1;
      const requestBody = {
        IdDocument2: 2,
        IdConnection: 3,
      };

      DocumentConnectionDao.updateConnection.mockRejectedValue(
        new Error("Database error")
      );

      const response = await agent
        .patch(`/api/documents/${documentId}/connection`)
        .send(requestBody);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });

  describe("GET /api/connections", () => {
    it("should retrieve all connection types for a document successfully", async () => {
      const mockConnections = [
        { IdConnection: 1, Type: "Projection" },
        { IdConnection: 2, Type: "Collateral Consequence" },
      ];

      DocumentConnectionDao.getAllConnectionsType.mockResolvedValue(
        mockConnections
      );

      const response = await request(app).get("/api/connections");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockConnections);
      expect(DocumentConnectionDao.getAllConnectionsType).toHaveBeenCalled();
    });

    it("should return 500 if the DAO method throws an error", async () => {
      DocumentConnectionDao.getAllConnectionsType.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/connections");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal server error" });
      expect(DocumentConnectionDao.getAllConnectionsType).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/document-connections/:connectionId", () => {
    it("should delete the document connection successfully", async () => {
      const connectionId = 1;

      DocumentConnectionDao.deleteConnection.mockResolvedValue(true);

      const response = await agent.delete(
        `/api/document-connections/${connectionId}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Connection deleted successfully.",
      });
    });

    it("should return 500 if the DAO fails to delete the connection", async () => {
      const connectionId = 1;

      DocumentConnectionDao.deleteConnection.mockResolvedValue(false);

      const response = await agent.delete(
        `/api/document-connections/${connectionId}`
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Failed to delete connection." });
    });

    it("should return 500 for database errors", async () => {
      const connectionId = 1;

      DocumentConnectionDao.deleteConnection.mockRejectedValue(
        new Error("Database error")
      );

      const response = await agent.delete(
        `/api/document-connections/${connectionId}`
      );

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });

  describe("PATCH /api/document-connections/:connectionId", () => {
    it("should update the document connection successfully", async () => {
      const connectionId = 1;

      DocumentConnectionDao.updateConnection.mockResolvedValue(true);

      const response = await agent
        .patch(`/api/document-connections/${connectionId}`)
        .send(mockConnections[0]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Connection updated successfully.",
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const connectionId = 1;
      const incompleteRequestBody = {
        IdDocument1: 1,
      }; // Missing IdDocument2 and IdConnection

      const response = await agent
        .patch(`/api/document-connections/${connectionId}`)
        .send(incompleteRequestBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Missing required fields",
      });
    });

    it("should return 400 if a document tries to connect to itself", async () => {
      const connectionId = 1;
      const invalidRequestBody = {
        IdDocument1: 1,
        IdDocument2: 1, // Same document
        IdConnection: 3,
      };

      const response = await agent
        .patch(`/api/document-connections/${connectionId}`)
        .send(invalidRequestBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "A document cannot be connected to itself",
      });
    });

    it("should return 404 if the connection is not found", async () => {
      const connectionId = 1;
      const validRequestBody = {
        IdDocument1: 1,
        IdDocument2: 2,
        IdConnection: 3,
      };

      DocumentConnectionDao.updateConnection.mockResolvedValue(false);

      const response = await agent
        .patch(`/api/document-connections/${connectionId}`)
        .send(validRequestBody);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Connection not found." });
    });

    it("should return 500 for database errors", async () => {
      const connectionId = 1;
      const validRequestBody = {
        IdDocument1: 1,
        IdDocument2: 2,
        IdConnection: 3,
      };

      DocumentConnectionDao.updateConnection.mockRejectedValue(
        new Error("Database error")
      );

      const response = await agent
        .patch(`/api/document-connections/${connectionId}`)
        .send(validRequestBody);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
    });
  });
});
