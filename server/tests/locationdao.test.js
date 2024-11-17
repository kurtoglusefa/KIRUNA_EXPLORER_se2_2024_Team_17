"use strict";

const locationDao = require("../dao/location-dao");
const db = require("../db/db");
jest.mock("../db/db");

describe("locationDao", () => {
  describe("addLocation", () => {
    const newLocation = {
      location_type: "Point",
      latitude: 67.85,
      longitude: 20.22,
      area_coordinates: "",
      area_name: "",
    };
    const newLocationId = 1;

    it("should add a new location and return its ID", async () => {
      db.run.mockImplementation(function (sql, params, callback) {
        callback.call({ lastID: newLocationId }, null); // simulating the last inserted ID
      });

      const locationId = await locationDao.addLocation(
        newLocation.location_type,
        newLocation.latitude,
        newLocation.longitude,
        newLocation.area_coordinates,
        newLocation.area_name
      );

      expect(locationId).toBe(newLocationId);
    });

    it("should reject if there is a database error", async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error("DB error"));
      });

      await expect(
        locationDao.addLocation(
          newLocation.location_type,
          newLocation.latitude,
          newLocation.longitude,
          newLocation.area_coordinates,
          newLocation.area_name
        )
      ).rejects.toThrow("DB error");
    });
  });

  describe("getLocationsPoint", () => {
    const mockRows = [
      {
        IdLocation: 1,
        Location_type: "Point",
        Latitude: 67.85,
        Longitude: 20.22,
        Area_coordinates: "",
        Area_Name: "",
      },
      {
        IdLocation: 2,
        Location_type: "Point",
        Latitude: 55.85,
        Longitude: 12.34,
        Area_coordinates: "",
        Area_Name: "",
      },
    ];

    it("should return all point locations", async () => {
      db.all.mockImplementation((sql, callback) => {
        callback(null, mockRows);
      });

      const locations = await locationDao.getLocationsPoint();
      expect(locations).toEqual(mockRows);
    });

    it("should reject if there is a database error", async () => {
      db.all.mockImplementation((sql, callback) => {
        callback(new Error("DB error"));
      });

      await expect(locationDao.getLocationsPoint()).rejects.toThrow("DB error");
    });
  });

  describe("getLocationById", () => {
    const locationId = 1;
    const mockRow = {
      IdLocation: locationId,
      Location_type: "Point",
      Latitude: 67.85,
      Longitude: 20.22,
      Area_coordinates: "",
      Area_Name: "",
    };

    it("should return the location with the specified ID", async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(null, mockRow);
      });

      const location = await locationDao.getLocationById(locationId);
      expect(location).toEqual(mockRow);
    });

    it("should reject if there is a database error", async () => {
      db.get.mockImplementation((sql, params, callback) => {
        callback(new Error("DB error"));
      });

      await expect(locationDao.getLocationById(locationId)).rejects.toThrow(
        "DB error"
      );
    });
  });

  describe("updateLocation", () => {
    const locationId = 1;
    const updatedLocation = {
      location_type: "Point",
      latitude: 68.0,
      longitude: 22.0,
      area_coordinates: "",
      area_name: "",
    };

    it("should update the location with the specified ID", async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(null);
      });

      const result = await locationDao.updateLocation(
        locationId,
        updatedLocation.location_type,
        updatedLocation.latitude,
        updatedLocation.longitude,
        updatedLocation.area_coordinates
      );

      expect(result).toBe(true);
    });

    it("should reject if there is a database error", async () => {
      db.run.mockImplementation((sql, params, callback) => {
        callback(new Error("DB error"));
      });

      await expect(
        locationDao.updateLocation(
          locationId,
          updatedLocation.location_type,
          updatedLocation.latitude,
          updatedLocation.longitude,
          updatedLocation.area_coordinates
        )
      ).rejects.toThrow("DB error");
    });
  });

  describe("getLocationsArea", () => {
    const mockRows = [
      {
        IdLocation: 3,
        Location_type: "Area",
        Latitude: 40.85,
        Longitude: 50.22,
        Area_coordinates: "[[10,10],[20,20]]",
        Area_Name: "Area 1",
      },
      {
        IdLocation: 4,
        Location_type: "Area",
        Latitude: 45.85,
        Longitude: 55.22,
        Area_coordinates: "[[30,30],[40,40]]",
        Area_Name: "Area 2",
      },
    ];

    it("should return all area locations", async () => {
      db.all.mockImplementation((sql, callback) => {
        callback(null, mockRows);
      });

      const areas = await locationDao.getLocationsArea();
      expect(areas).toEqual(mockRows);
    });

    it("should reject if there is a database error", async () => {
      db.all.mockImplementation((sql, callback) => {
        callback(new Error("DB error"));
      });

      await expect(locationDao.getLocationsArea()).rejects.toThrow("DB error");
    });
  });
});
