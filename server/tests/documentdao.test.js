const db = require("../db/db");
const documentDao = require("../dao/document-dao");
const Document = require("../models/document");

jest.mock("../db/db");

describe("documentDao", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("getDocuments", () => {
    it("should return an array of documents", async () => {
      const mockDocuments = [
        { id: 1, title: "Document 1" },
        { id: 2, title: "Document 2" },
      ];

      db.all.mockImplementation((sql, callback) => {
        callback(null, mockDocuments);
      });

      const documents = await documentDao.getDocuments();
      expect(documents).toEqual(mockDocuments);
    });
    it("should return an error when retrieving documents fails", async () => {
      db.all.mockImplementation((sql, callback) => {
        callback(new Error("Failed to retrieve documents"));
      });

      await expect(documentDao.getDocuments()).rejects.toThrow(
        "Failed to retrieve documents"
      );
    });
  });

  describe("getDocumentById", () => {
    it("should return a document by ID", async () => {
      const mockDocument = {
        id: 1,
        title: "Sample Document",
        idStakeholder: 1,
        scale: "National",
        issuance_Date: "01/01/2023",
        language: "English",
        pages: 10,
        description: "Sample description",
        idtype: 2,
        idlocation: 1,
      };

      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockDocument);
      });

      const document = await documentDao.getDocumentById(1);
      expect(document).toEqual(mockDocument);
    });
    it("should return an error when retrieving a document by ID fails", async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error("Failed to retrieve document"));
      });

      await expect(documentDao.getDocumentById(1)).rejects.toThrow(
        "Failed to retrieve document"
      );
    });
  });

  describe("updateDocument", () => {
    it("should update the document and return true", async () => {
      const mockDocumentId = 1;
      const mockTitle = "Updated Title";
      const mockIdStakeholder = 1;
      const mockScale = "Regional";
      const mockIssuanceDate = "02/02/2023";
      const mockLanguage = "Spanish";
      const mockPages = 15;
      const mockDescription = "Updated description";
      const mockIdType = 3;

      db.run.mockImplementation((sql, params, callback) => {
        callback(null); // No error
      });

      const result = await documentDao.updateDocument(
        mockDocumentId,
        mockTitle,
        mockIdStakeholder,
        mockScale,
        mockIssuanceDate,
        mockLanguage,
        mockPages,
        mockDescription,
        mockIdType
      );

      expect(result).toBe(true);
    });

    it("should return an error when update fails", async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error("Failed to update document"));
      });

      await expect(
        documentDao.updateDocument(
          1,
          "Title",
          1,
          "Scale",
          "Date",
          "Language",
          10,
          "Description",
          2
        )
      ).rejects.toThrow("Failed to update document.");
    });
  });
  describe("addDocument", () => {
    it("should return an error when adding a document fails", async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error("Failed to add document"));
      });

      await expect(documentDao.addDocument(new Document())).rejects.toThrow(
        "Failed to add document"
      );
    });
  });
  describe("getDocumentByTitle", () => {
    it("should return error if problem in db", async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error("Failed to retrieve document"));
      });

      await expect(documentDao.getDocumentByTitle("Title")).rejects.toThrow(
        "Failed to retrieve document"
      );
    });
  });
  describe("deleteDocument", () => {
    it("should return an error when deleting a document fails", async () => {
      db.run.mockImplementation((sql, callback) => {
        callback(new Error("Failed to reset documents."));
      });
  
      await expect(documentDao.resetDocument()).rejects.toThrow(
        "Failed to reset documents."
      );
    });
  
    it("should return true when deleting a document is successful", async () => {
      db.run.mockImplementation((sql, callback) => {
        callback(null);
      });
  
      const result = await documentDao.resetDocument();
      expect(result).toBe(true);
    });
  });
  
});
