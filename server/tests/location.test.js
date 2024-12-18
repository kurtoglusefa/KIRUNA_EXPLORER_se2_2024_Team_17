import request from "supertest";
import { app } from "../index.js";

const locationDao = require("../dao/location-dao.js");
const Location = require("../models/location");
jest.mock("../dao/location-dao.js");
require("dotenv").config();

describe("Location API", () => {
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

  describe("Location Class", () => {
    it("should create a Location object with the correct properties", () => {
      const idLocation = 1;
      const location_type = "Point";
      const latitude = 12.34;
      const longitude = 56.78;
      const area_coordinates = "[[12.34, 56.78]]";

      const location = new Location(
        idLocation,
        location_type,
        latitude,
        longitude,
        area_coordinates
      );

      expect(location).toBeInstanceOf(Location);
      expect(location.idLocation).toBe(idLocation);
      expect(location.location_type).toBe(location_type);
      expect(location.latitude).toBe(latitude);
      expect(location.longitude).toBe(longitude);
      expect(location.area_coordinates).toBe(area_coordinates);
    });
  });

  describe("GET /api/locations", () => {
    it("should retrieve all point locations", async () => {
      const mockLocations = [
        {
          IdLocation: 1,
          Location_Type: "Point",
          Latitude: 12.34,
          Longitude: 56.78,
          AreaCoordinates: null,
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
        AreaCoordinates: null,
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

  describe("POST /api/locations", () => {
    it("should create a new location with valid data", async () => {
      const newLocation = {
        location_type: "Point",
        center_lat: 67.85,
        center_lng: 20.22,
        area_coordinates: "",
        areaName: "",
      };

      locationDao.addLocation.mockResolvedValue(1);

      const response = await agent.post("/api/locations").send(newLocation);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: "Location added successfully.",
        locationId: 1,
      });
    });

    it("should return 400 when required fields are missing", async () => {
      const incompleteLocation = {
        center_lat: 20.22,
        center_lng: 20.22,
      };

      const response = await agent
        .post("/api/locations")
        .send(incompleteLocation);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "locationType is required.",
      });
    });

    it("should return 500 when there is a server/database error", async () => {
      const newLocation = {
        location_type: "Point",
        center_lat: 67.85,
        center_lng: 20.22,
        area_coordinates: "",
        areaName: "",
      };

      locationDao.addLocation.mockRejectedValue(new Error("Database error"));

      const response = await agent.post("/api/locations").send(newLocation);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Database error",
      });
    });
  });

  describe("PATCH /api/locations/:locationId", () => {
    it("should update the location successfully", async () => {
      const updatedLocation = {
        location_type: "Point",
        latitude: 12.34,
        longitude: 56.78,
      };

      locationDao.getLocationById.mockResolvedValue({ IdLocation: 1 });
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

      locationDao.getLocationById.mockResolvedValue(null);

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
