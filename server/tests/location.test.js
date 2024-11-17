import request from "supertest";

const { app, server } = require("../index.mjs");

const locationDao = require("../dao/location-dao.js");
jest.mock("../dao/location-dao.js");

describe("Location API", () => {
  let agent;

  beforeAll(async () => {
    agent = request.agent(app);

    await agent
      .post("/api/sessions")
      .send({ username: "mario@test.it", password: "pwd" });
  });

  describe("GET /api/locations", () => {
    it("should retrieve all point locations", async () => {
      const mockLocations = [
        {
          IdLocation: 1,
          Location_Type: "Point",
          Latitude: 12.34,
          Longitude: 56.78,
        },
      ];

      locationDao.getLocationsPoint.mockResolvedValue(mockLocations);

      const response = await request(app).get("/api/locations");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLocations);
    });

    it("should return 500 for database errors", async () => {
      locationDao.getLocationsPoint.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/locations");

      expect(response.status).toBe(500);
    });
  });

  describe("GET /api/locations/:locationId", () => {
    it("should retrieve a location by ID", async () => {
      const mockLocation = {
        IdLocation: 1,
        Location_Type: "Point",
        Latitude: 12.34,
        Longitude: 56.78,
      };

      locationDao.getLocationById.mockResolvedValue(mockLocation);

      const response = await request(app).get("/api/locations/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLocation);
    });

    it("should return 404 if the location is not found", async () => {
      locationDao.getLocationById.mockResolvedValue(null);

      const response = await request(app).get("/api/locations/999");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Location not found" });
    });

    it("should return 500 for database errors", async () => {
      locationDao.getLocationById.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/locations/1");

      expect(response.status).toBe(500);
    });
  });

  //   describe("POST /api/locations", () => {
  //     it("should create a new location with valid data", async () => {
  //       const newLocation = {
  //         locationType: "Point",
  //         latitude: 67.85,
  //         longitude: 20.22,
  //         areaCoordinates: "", // assuming this is optional for Point
  //         areaName: "", // optional field
  //       };

  //       locationDao.addLocation.mockResolvedValue(1); // simulate database response with a new location ID

  //       const response = await request(app)
  //         .post("/api/locations")
  //         .send(newLocation);

  //       expect(response.status).toBe(201);
  //       expect(response.body).toEqual({
  //         message: "Location added successfully.",
  //         locationId: 1,
  //       });
  //     });

  //     it("should return 400 when required fields are missing", async () => {
  //       const incompleteLocation = {
  //         locationType: "Point",
  //         longitude: 20.22,
  //       }; // missing latitude and areaCoordinates

  //       const response = await request(app)
  //         .post("/api/locations")
  //         .send(incompleteLocation);

  //       expect(response.status).toBe(400);
  //       expect(response.body).toEqual({
  //         error: "Missing required fields: locationType, latitude, longitude",
  //       });
  //     });

  //     it("should return 500 when there is a server/database error", async () => {
  //       const newLocation = {
  //         locationType: "Point",
  //         latitude: 67.85,
  //         longitude: 20.22,
  //         areaCoordinates: "",
  //       };

  //       locationDao.addLocation.mockRejectedValue(new Error("Database error"));

  //       const response = await request(app)
  //         .post("/api/locations")
  //         .send(newLocation);

  //       expect(response.status).toBe(500);
  //       expect(response.body).toEqual({
  //         error: "Internal server error",
  //       });
  //     });
  //   });

  describe("PATCH /api/locations/:locationId", () => {
    it("should update the location successfully", async () => {
      const updatedLocation = {
        location_type: "Point",
        latitude: 12.34,
        longitude: 56.78,
      };

      locationDao.getLocationById.mockResolvedValue({ IdLocation: 1 }); // checking if location exists
      locationDao.updateLocation.mockResolvedValue(true);

      const response = await agent
        .patch("/api/locations/1")
        .send(updatedLocation);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Location updated successfully.",
      });
    });

    it("should return 404 if the location does not exist", async () => {
      const updatedLocation = {
        location_type: "Point",
        latitude: 12.34,
        longitude: 56.78,
      };

      locationDao.getLocationById.mockResolvedValue(null); // location does not exist

      const response = await agent
        .patch("/api/locations/1")
        .send(updatedLocation);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Location not found." });
    });

    it("should return 500 for database errors", async () => {
      const updatedLocation = {
        location_type: "Point",
        latitude: 12.34,
        longitude: 56.78,
      };

      locationDao.getLocationById.mockResolvedValue({ IdLocation: 1 });
      locationDao.updateLocation.mockRejectedValue(new Error("Database error"));

      const response = await agent
        .patch("/api/locations/1")
        .send(updatedLocation);

      expect(response.status).toBe(500);
    });
  });
});
