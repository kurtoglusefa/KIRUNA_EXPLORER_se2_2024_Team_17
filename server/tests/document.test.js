import request from "supertest";
const { app, server } = require("../index.mjs");
const locationDao = require("../dao/location-dao.js");
const fs = require('fs');
const path = require('path');

let documentId;
describe("Document API with Session Authentication", () => {
  let agent;
  

  beforeAll(async () => {
    agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/sessions")
      .send({ username: "mario@test.it", password: "pwd" });
    expect(loginResponse.status).toBe(200);
  });

  it("should retrieve all documents", async () => {
    const response = await agent.get("/api/documents");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should create a new document with valid data", async () => {
    const documentData = {
      title: "Sample Title",
      idStakeholder: 1,
      scale: "National",
      issuance_Date: "04/2019",
      language: "English",
      pages: 50,
      description: "A description for the document",
      idtype: 2,
      locationType: "Point",
      latitude: 19,
      longitude: 23,
      area_coordinates: "",
    };

    const response = await agent.post("/api/documents").send(documentData);
    expect(response.status).toBe(201);

    documentId = response.body.IdDocument || response.body.idDocument;
    expect(documentId).toBeDefined();
  });

  it("should return 400 for a document with invalid data", async () => {
    const invalidDocumentData = {
      title: "Sample Title",
      idStakeholder: 1,
      scale: "National",
      issuance_Date: "04/2019",
    };
    const response = await agent.post("/api/documents").send(invalidDocumentData);
    expect(response.status).toBe(400);
  });

  it("should return 500 if error to insert location", async () => {
    const invalidDocumentData = {
      title: "Sample Title",
      idStakeholder: 1,
      scale: "National",
      issuance_Date: "04/2019",
      language: "English",
      pages: 50,
      description: "A description for the document",
      idtype: 2,
    };

    // Mocking locationDao to simulate failure in location insertion
    locationDao.addLocation = jest.fn().mockResolvedValue(null);

    const response = await agent.post("/api/documents").send(invalidDocumentData);
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Failed to add location.");
  });

  it("should update an existing document", async () => {
    const updatedDocumentData = {
      title: "Updated Sample Title",
      idStakeholder: 2,
      scale: "Regional",
      issuance_Date: "05/2020",
      language: "Spanish",
      pages: 100,
      description: "Updated description for the document",
      idtype: 3
    };

    const updateResponse = await agent
      .patch(`/api/documents/${documentId}`)
      .send(updatedDocumentData);
    expect(updateResponse.status).toBe(200);

    const retrieveResponse = await agent.get(`/api/documents/${documentId}`);
    expect(retrieveResponse.status).toBe(200);
    expect(retrieveResponse.body).toMatchObject({
      IdDocument: documentId,
      Title: "Updated Sample Title",
      IdStakeholder: 2,
      Scale: "Regional",
      Issuance_Date: "05/2020",
      Language: "Spanish",
      Pages: 100,
      Description: "Updated description for the document",
      IdType: 3
    });
  });

  it("should return 404 for a non-existent document ID", async () => {
    const nonExistentDocumentId = 9999;
    const response = await agent.get(`/api/documents/${nonExistentDocumentId}`);
    expect(response.status).toBe(404);
  });

  

  it("should retrieve a document by ID", async () => {
    const response = await agent.get(`/api/documents/${documentId}`);
    if (response.status === 200) {
      expect(response.body).toHaveProperty("IdDocument", documentId);
      expect(response.body).toHaveProperty("Title");
    } else {
      expect(response.status).toBe(404);
    }
  });

  it("should return 400 for not insert all data", async () => {
    const updatedDocumentData = {
      scale: "Regional",
      issuance_Date: "05/2020",
      language: "Spanish",
      pages: 100,
      description: "Updated description for the document",
      idtype: 3
    };
    const updateResponse = await agent
      .patch(`/api/documents/${documentId}`)
      .send(updatedDocumentData);
    expect(updateResponse.status).toBe(400);
  });
});

describe('Document Search API', () => {
  it('should retrieve all documents', async () => {
    const response = await request(app).get('/api/documents');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should retrieve a document by title', async () => {
    const title = "Updated Sample Title"; // replace with an existing title in the database
    const response = await request(app).get(`/api/documents/title/${title}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("Title", title);
  });

  it('should return 404 if document title not found', async () => {
    const response = await request(app).get('/api/documents/title/NonExistentTitle');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Document not found');
  });
});
describe("Define Geolocated Area API", () => {
  let authenticatedAgent;

  beforeAll(async () => {
    authenticatedAgent = request.agent(app);

    const loginResponse = await authenticatedAgent
      .post("/api/sessions")
      .send({ username: "mario@test.it", password: "pwd" });

    expect(loginResponse.status).toBe(200); // Ensure login is successful
  });

  it("should create a new geolocated area", async () => {
    const newArea = {
      location_type: "Area",
      center_lat : 40.7128,
      center_lng : 74.006,
      area_coordinates: JSON.stringify([
        { lat: 40.7128, lng: 74.006 },
        { lat: 40.7127, lng: 74.0059 },
      ]),
      areaName: "Test Area", // Ensure correct naming
    };
    locationDao.addLocation = jest.fn().mockResolvedValue(1); 

    const response = await authenticatedAgent.post("/api/locations").send(newArea);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "Location added successfully.");
  });
  

  it("should return 400 if area coordinates are missing", async () => {
    const incompleteArea = { location_type: "Area", areaName: "Test Area" };

    const response = await authenticatedAgent.post("/api/locations").send(incompleteArea);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "For 'Area' locationType, areaCoordinates are required."
    );
  });
});

describe('Get All Document Areas API', () => {

  let agent;

  beforeAll(async () => {
    agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/sessions")
      .send({ username: "mario@test.it", password: "pwd" });
    expect(loginResponse.status).toBe(200);
  });

  it('should retrieve all geolocated areas', async () => {
    const response = await request(app).get('/api/locations/area');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should handle errors if location retrieval fails', async () => {
    // Simulate failure (e.g., mock a database failure)
    locationDao.getLocationsArea = jest.fn().mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/locations/area');
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal server error');
  });
});
describe('File Upload API', () => {

  let agent;
  beforeAll(async () => {
    agent = request.agent(app);

    const loginResponse = await agent
      .post("/api/sessions")
      .send({ username: "mario@test.it", password: "pwd" });
    expect(loginResponse.status).toBe(200);
  });
  it('should upload a file successfully', async () => {
    // Mock the file upload process
    const mockFile = { filename: 'testfile.txt' };

    // Mock the req.file object to simulate a successful file upload
    const mockRequest = {
      file: mockFile,
      params: { documentId: documentId }
    };
    const mockMiddleware = (req, res, next) => next();  

    const mockUpload = {
      single: jest.fn().mockImplementation(() => (req, res, next) => next()) // Simulate file upload middleware
    };

    console.log(path.resolve(__dirname, 'mock_file/testfile.txt')); // Add this for debugging

    const response = await agent
      .post('/api/documents/'+documentId+'/resources')
      .attach('file', path.resolve(__dirname, 'mock_file/testfile.txt'))  // Attach a mock file
      .set('Content-Type', 'multipart/form-data');
    console.log(response.body); // Add this for debugging
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('File uploaded successfully!');
    expect(response.body.documentId).toBe(documentId);
    expect(response.body.filename).toBe(mockFile.filename);
  });
  it('should return a list of resources for a document', async () => {
    const mockFiles = ['testfile.txt'];

    // Mock the file system behavior to simulate existing files

    const response = await agent
      .get('/api/documents/'+documentId+'/resources');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(mockFiles.length);
    expect(response.body[0].filename).toBe(mockFiles[0]);
  });
  it('should return 404 if no resources are found for the document', async () => {
    const documentIdmock = '99999999';

    // Simulate no files for the document

    const response = await agent
      .get(`/api/documents/${documentIdmock}/resources`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Document not found');
  });  
});