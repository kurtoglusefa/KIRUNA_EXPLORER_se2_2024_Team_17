"use strict";

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const userDao = require("./dao/user-dao.js");
const documentDao = require("./dao/document-dao.js");
const stakeholderDao = require("./dao/stakeholder-dao.js");
const typeDocumentDao = require("./dao/typeDocument-dao.js");
const DocumentConnectionDao = require("./dao/document-connection-dao.js");
const DocumentStakeholderDao = require("./dao/document-stakeholder-dao.js");
const locationDao = require("./dao/location-dao.js");
const scaleDao = require("./dao/scale-dao.js");
const { fileURLToPath } = require("url");
const net = require("net"); // Import the 'net' module
const { dirname } = require("path"); // Import the 'path' module

/*** Set up Passport ***/
// set up the "username and password" login strategy
passport.use(
  new LocalStrategy(function (username, password, done) {
    userDao
      .getUser(username, password)
      .then((user) => {
        if (!user)
          return done(null, false, {
            message: "Wrong username and/or password.",
          });

        return done(null, user);
      })
      .catch((err) => done(err));
  })
);

// serialize and de-serialize the user (user object <-> session)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userDao
    .getUserById(id)
    .then((user) => {
      done(null, user); // this will be available in req.user
    })
    .catch((err) => {
      done(err, null);
    });
});

// middleware to check if the document provided in the request exists
const checkDocumentExists = async (req, res, next) => {
  const documentId = parseInt(req.params.documentId);
  if (isNaN(documentId)) {
    return res.status(400).json({ message: "Invalid document ID" });
  }

  try {
    const document = await documentDao.getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    next(); // Continue to the next middleware if the document exists
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const documentId = req.params.documentId;
    if (!documentId) {
      return cb(new Error("Document ID is missing"));
    }

    // Define the directory path based on the document ID
    const dirPath = path.join(__dirname, "uploads", documentId);

    try {
      // Check if the directory exists, if not, create it
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      // Use the newly created directory as the destination
      cb(null, dirPath);
    } catch (err) {
      console.error("Error creating directory:", err);
      cb(new Error("Failed to create upload directory"));
    }
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const newFilename = `${file.originalname}`;
    cb(null, newFilename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit to 10MB
  },
});

// init express
const app = new express();
const port = 3001;

// set-up middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS configuration
const corsOptions = {
  origin: "http://localhost:5173", // Replace with your client's origin
  credentials: true,
};
app.use(cors(corsOptions));

// set up the session
app.use(
  session({
    secret: "wge8d239bwd93rkskb",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // set to true if using HTTPS
      httpOnly: true, // prevents client-side scripts from accessing the cookie
      sameSite: "lax", // set the sameSite attribute correctly
    },
  })
);

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

// custom middleware: check if a given request is coming from an authenticated user to check when a function can be done or not
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.status(401).json({ error: "Not authenticated" });
};

const isUrbanPlanner = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role == "Urban Planner") return next();
  else if (req.isAuthenticated() && req.user.role != "Urban Planner") {
    return res.status(403).json({
      error:
        "(Forbidden), user is authenticated but does not have the necessary privileges to access a resource.",
    });
  }
  return res.status(401).json({ error: "Not authenticated" });
};
/*** User APIs ***/

// POST /api/sessions
// do the login
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(info);
    }
    // successo del login
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user);
    });
  })(req, res, next);
});

// DELETE /api/sessions/current
// logout
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// GET /api/sessions/current
// check whether the user is authenticated or not
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ error: "Unauthenticated user!" });
});

///////// API DOCUMENTS  ////////

// POST /api/documents, only possible for authenticated users and if he/she is a urban planner
app.post("/api/documents", isUrbanPlanner, async (req, res) => {
  const document = req.body;
  console.log(req.body);
  console.log("PAPAPAPA");
  if (!document.title || !document.idtype) {
    res
      .status(400)
      .json({ error: "The request body must contain all the fields" });
    return;
  }
  const idLocation = document.idLocation
    ? document.idLocation
    : await locationDao.addLocation(
        document.locationType,
        document.latitude,
        document.longitude,
        document.area_coordinates,
        ""
      );
  if (!idLocation) {
    res.status(500).json({ error: "Failed to add location." });
    return;
  }
  documentDao
    .addDocument(
      document.title,
      document.scale,
      document.issuance_Date,
      document.language,
      parseInt(document.pages),
      document.description,
      parseInt(document.idtype),
      idLocation
    )
    .then(async (document_new) => {
      //here add the stakeholde to document after insert it
      console.log(document_new);
      if (document_new) {
        for (let i = 0; i < document.idStakeholder.length; i++) {
          console.log("prova");
          await DocumentStakeholderDao.addStakeholderToDocument(
            document_new.idDocument,
            document.idStakeholder[i]
          );
        }
        res.status(201).json(document_new);
      } else {
        res.status(500).json({ error: "Failed to add document." });
      }
    })
    .catch(() => res.status(500).end());
});

// GET /api/documents
app.get("/api/documents", (req, res) => {
  documentDao
    .getDocuments()
    .then((documents) => res.json(documents))
    .catch(() => res.status(500).end());
});

// GET /api/documents/:documentid
app.get("/api/documents/:documentid", (req, res) => {
  documentDao
    .getDocumentById(req.params.documentid)
    .then((document) => {
      if (document) res.json(document);
      else res.status(404).json({ error: "Document not found" });
    })
    .catch(() => res.status(500).end());
});

// GET /api/documents/title/:title
app.get("/api/documents/title/:title", (req, res) => {
  documentDao
    .getDocumentByTitle(req.params.title)
    .then((document) => {
      if (document) res.json(document);
      else res.status(404).json({ error: "Document not found" });
    })
    .catch(() => res.status(500).end());
});

// PATCH /api/documents/:documentid
app.patch("/api/documents/:documentid", isUrbanPlanner, async (req, res) => {
  const documentId = parseInt(req.params.documentid);
  const document = req.body;
  if (!document.title || !document.idStakeholder) {
    res
      .status(400)
      .json({ error: "The request body must contain all the fields" });
    return;
  }

  try {
    // Update the document using the DAO
    const updatedDocument = await documentDao.updateDocument(
      documentId,
      document.title,
      document.IdScale,
      document.issuance_Date,
      document.language,
      parseInt(document.pages),
      document.description,
      parseInt(document.idtype),
      parseInt(document.idLocation)
    );

    if (!updatedDocument) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Clear existing stakeholders for the document
    await DocumentStakeholderDao.clearStakeholdersFromDocument(documentId);

    // Ensure `idStakeholder` exists and is an array
    if (Array.isArray(document.idStakeholder)) {
      for (const stakeholderId of document.idStakeholder) {
        // Add each stakeholder to the document
        await DocumentStakeholderDao.addStakeholderToDocument(
          documentId,
          stakeholderId
        );
      }
    }

    // Send the updated document as a response
    return res.status(200).json(updatedDocument);
  } catch (error) {
    // Handle errors
    console.error("Error updating document:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/documents/:documentId/connection
app.patch("/api/documents/:documentId/connection", async (req, res) => {
  const documentId = parseInt(req.params.documentId);
  const newDocumentId2 = parseInt(req.body.IdDocument2);
  const newConnectionId = parseInt(req.body.IdConnection);

  if (!newDocumentId2 || !newConnectionId) {
    return res
      .status(400)
      .json({ error: "newDocumentId2 and newConnectionId are required." });
  }

  try {
    const result = await DocumentConnectionDao.updateConnection(
      documentId,
      newDocumentId2,
      newConnectionId
    );
    if (result) {
      res.status(200).json({ message: "Connection updated successfully." });
    } else {
      res.status(500).json({ error: "Failed to update connection." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API add file to document

// Endpoint to upload a file
app.post(
  "/api/documents/:documentId/resources",
  upload.array("files", 20), // Handle up to 10 files,
  async (req, res) => {
    console.log(req.body);
    const documentId = parseInt(req.params.documentId);

    // Check if files were uploaded
    if (req.files && req.files.length > 0) {
      res.json({
        message: "Files uploaded successfully!",
        documentId,
        files: req.files, // Contains metadata for uploaded files
      });
    } else {
      res.status(400).json({ message: "No files uploaded or upload failed." });
    }
  }
);

app.delete(
  "/api/documents/:documentId/resources/:filename",
  async (req, res) => {
    try {
      const documentId = String(req.params.documentId);
      const filename = req.params.filename;
      const filePath = path.join(__dirname, "uploads", documentId, filename);
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found." });
      }

      // Delete the file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return res
            .status(500)
            .json({ message: "Failed to delete the file." });
        }

        return res.status(200).json({ message: "File deleted successfully." });
      });
    } catch (error) {
      console.error("Error handling delete request:", error);
      return res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
);

// API get file from document
app.get(
  "/api/documents/:documentId/resources",
  checkDocumentExists,
  async (req, res) => {
    const documentId = String(req.params.documentId);
    const dirPath = path.join(__dirname, "uploads/", documentId);

    try {
      if (!fs.existsSync(dirPath)) {
        return res
          .status(404)
          .json({ message: "No resources found for this document" });
      }

      const files = fs.readdirSync(dirPath);
      const resources = files.map((file) => ({
        documentId: Number(documentId),
        filename: file,
        url: `/uploads/${documentId}/${file}`,
      }));

      res.status(200).json(resources);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// API TYPES
app.get("/api/types", (req, res) => {
  typeDocumentDao
    .getTypes()
    .then((types) => res.json(types))
    .catch(() => res.status(500).end());
});

app.get("/api/types/:typeid", (req, res) => {
  typeDocumentDao
    .getType(req.params.typeid)
    .then((type) => {
      if (type) res.json(type);
      else res.status(404).json({ error: "Type not found" });
    })
    .catch(() => res.status(500).end());
});
app.post("/api/types", isUrbanPlanner, async (req, res) => {
  console.log(req.body);
  const { type, iconSrc } = req.body;
  if (!type || !iconSrc) {
    return res.status(400).json({ error: "type and iconSrc are required." });
  }
  try {
    const result = await typeDocumentDao.addType(type, iconSrc);
    if (result) {
      res
        .status(201)
        .json({ typeId: result, message: "Type added successfully." });
    } else {
      res.status(500).json({ error: "Failed to add type." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// API STAKEHOLDERS

app.get("/api/stakeholders", (req, res) => {
  stakeholderDao
    .getStakeholders()
    .then((stakeholders) => res.json(stakeholders))
    .catch(() => res.status(500).end());
});

app.get("/api/stakeholders/:stakeholderid", (req, res) => {
  stakeholderDao
    .getStakeholderById(req.params.stakeholderid)
    .then((stakeholder) => {
      if (stakeholder) res.json(stakeholder);
      else res.status(404).json({ error: "Stakeholder not found" });
    })
    .catch(() => res.status(500).end());
});

//API SCALES
app.get("/api/scales", (req, res) => {
  scaleDao
    .getScales()
    .then((scales) => res.json(scales))
    .catch(() => res.status(500).end());
});

app.get("/api/scales/:scaleid", (req, res) => {
  scaleDao
    .getScale(req.params.scaleid)
    .then((scale) => {
      if (scale) res.json(scale);
      else res.status(404).json({ error: "Scale not found" });
    })
    .catch(() => res.status(500).end());
});
app.post("/api/scales", isUrbanPlanner, async (req, res) => {
  const { scale_text, scale_number } = req.body;
  if (!scale_text || !scale_number) {
    return res
      .status(400)
      .json({ error: "scale_text and scale_number are required." });
  }
  try {
    const result = await scaleDao.addScale(scale_text, scale_number);
    if (result) {
      res
        .status(201)
        .json({ scaleId: result, message: "Scale added successfully." });
    } else {
      res.status(500).json({ error: "Failed to add scale." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/scales/:scaleId", isUrbanPlanner, async (req, res) => {
  const scaleId = parseInt(req.params.scaleId);

  console.log(req.body);
  console.log(scaleId);
  const { scale_number } = req.body;
  if (!scale_number) {
    return res
      .status(400)
      .json({ error: "scale_text and scale_number are required." });
  }
  try {
    const scale = await scaleDao.getScale(scaleId);
    if (!scale) {
      return res.status(404).json({ error: "Scale not found." });
    }
    const result = await scaleDao.updateScale(scaleId, scale_number);
    if (result) {
      res.status(200).json({ message: "Scale updated successfully." });
    } else {
      res.status(500).json({ error: "Failed to update scale." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API CONNECTIONS

app.get("/api/connections", (req, res) => {
  DocumentConnectionDao.getAllConnectionsType()
    .then((connections) => res.status(200).json(connections))
    .catch((err) => res.status(500).json({ error: "Internal server error" }));
});

// API DOCUMENTCONNECTION

// GET /api/document-connections
// Retrievs all list of connection documents
app.get("/api/document-connections", (req, res) => {
  DocumentConnectionDao.getAllConnections()
    .then((connections) => res.status(200).json(connections))
    .catch((err) => res.status(500).json({ error: "Internal server error" }));
});

// GET /api/document-connections/:documentId
// Retrievs list of all connections for a specific document
app.get("/api/document-connections/:documentId", (req, res) => {
  DocumentConnectionDao.getConnections(req.params.documentId)
    .then((connections) => res.status(200).json(connections))
    .catch((err) => res.status(500).json({ error: "Internal server error" }));
});

// POST /api/document-connections;
//  Creates a new connection between two documents
app.post("/api/document-connections", isUrbanPlanner, (req, res) => {
  const connection = req.body;

  if (
    !connection.IdDocument1 ||
    !connection.IdDocument2 ||
    !connection.IdConnection
  ) {
    res
      .status(400)
      .json({ error: "The request body must contain all the required fields" });
    return;
  }

  // Check if documents are not the same
  if (connection.IdDocument1 === connection.IdDocument2) {
    res.status(400).json({ error: "A document cannot be connected to itself" });
    return;
  }
  DocumentConnectionDao.createConnection(
    connection.IdDocument1,
    connection.IdDocument2,
    connection.IdConnection
  )
    .then((newConnection) => res.status(201).json(newConnection))
    .catch(() => res.status(500).end());
});

////// API LOCATION  //////
app.get("/api/locations", (req, res) => {
  locationDao
    .getLocationsPoint()
    .then((locations) => res.json(locations))
    .catch(() => res.status(500).end());
});

app.get("/api/locations/area", (req, res) => {
  locationDao
    .getLocationsArea()
    .then((locations) => res.json(locations))
    .catch(() => res.status(500).json({ error: "Internal server error" }));
});

app.get("/api/locations/:locationId", (req, res) => {
  locationDao
    .getLocationById(req.params.locationId)
    .then((location) => {
      if (location) res.json(location);
      else res.status(404).json({ error: "Location not found" });
    })
    .catch(() => res.status(500).end());
});

app.post("/api/locations", isUrbanPlanner, async (req, res) => {
  console.log(req.body);
  const {
    location_type: locationType,
    center_lat: latitude,
    center_lng: longitude,
    area_coordinates: areaCoordinates,
    areaName: area_name,
  } = req.body;

  if (!locationType) {
    return res.status(400).json({ error: "locationType is required." });
  }
  if (locationType == "Point") {
    // Check if both latitude and longitude are provided
    if (latitude == null || longitude == null) {
      return res.status(400).json({
        error:
          "For 'Point' locationType, both latitude and longitude are required.",
      });
    }
  }

  if (locationType == "Area") {
    // Check if areaCoordinates is provided
    if (areaCoordinates == null) {
      return res.status(400).json({
        error: "For 'Area' locationType, areaCoordinates are required.",
      });
    }
  }
  try {
    let transformedCoordinates;
    if (locationType == "Area") {
      transformedCoordinates = JSON.parse(areaCoordinates).map((point) => [
        point.lat,
        point.lng,
      ]);
    }
    const result = await locationDao.addLocation(
      locationType,
      latitude,
      longitude,
      transformedCoordinates,
      area_name
    );
    if (result) {
      res
        .status(201)
        .json({ locationId: result, message: "Location added successfully." });
    } else {
      res.status(500).json({ error: "Failed to add location." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/locations/:locationId", isUrbanPlanner, async (req, res) => {
  const idLocation = parseInt(req.params.locationId);
  const {
    location_type: locationType,
    latitude,
    longitude,
    area_coordinates: areaCoordinates,
  } = req.body;
  if (!locationType) {
    return res.status(400).json({ error: "locationType is required." });
  }
  if (locationType == "Point") {
    // Check if both latitude and longitude are provided
    if (latitude == null || longitude == null) {
      return res.status(400).json({
        error:
          "For 'Point' locationType, both latitude and longitude are required.",
      });
    }
  }
  if (locationType == "Area") {
    // Check if areaCoordinates is provided
    if (!areaCoordinates) {
      return res.status(400).json({
        error: "For 'Area' locationType, areaCoordinates are required.",
      });
    }
  }
  try {
    const location = await locationDao.getLocationById(idLocation);
    if (!location) {
      return res.status(404).json({ error: "Location not found." });
    }
    const result = await locationDao.updateLocation(
      idLocation,
      locationType,
      latitude,
      longitude,
      areaCoordinates
    );
    if (result) {
      res.status(200).json({ message: "Location updated successfully." });
    } else {
      res.status(500).json({ error: "Failed to update location." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

///// Document Stakeholder APIS//////

// Add a stakeholder to a document
app.post(
  "/api/documents/:documentId/stakeholders/:stakeholderId",
  (req, res) => {
    DocumentStakeholderDao.addStakeholderToDocument(
      req.params.documentId,
      req.params.stakeholderId
    )
      .then((result) => {
        if (result)
          res.status(201).json({ message: "Stakeholder added successfully." });
        else res.status(400).json({ error: "Failed to add stakeholder." });
      })
      .catch(() => res.status(500).end());
  }
);

// Get all stakeholders for a document
app.get("/api/documents/:documentId/stakeholders", (req, res) => {
  DocumentStakeholderDao.getStakeholdersByDocument(req.params.documentId)
    .then((stakeholders) => res.json(stakeholders))
    .catch(() => res.status(500).end());
});

// Get all documents for a stakeholder
app.get("/api/stakeholders/:stakeholderId/documents", (req, res) => {
  DocumentStakeholderDao.getDocumentsByStakeholder(req.params.stakeholderId)
    .then((documents) => res.json(documents))
    .catch(() => res.status(500).end());
});

// Clear stakeholders from a document
app.delete("/api/documents/:documentId/stakeholders", (req, res) => {
  DocumentStakeholderDao.clearStakeholdersFromDocument(req.params.documentId)
    .then((result) => {
      if (result)
        res.status(200).json({ message: "Stakeholders removed successfully." });
      else res.status(404).json({ error: "No stakeholders found to remove." });
    })
    .catch(() => res.status(500).end());
});

app.post("/api/stakeholders", isUrbanPlanner, async (req, res) => {
  const { StakeholderName } = req.body;
  try {
    const result = await stakeholderDao.addStakeholder(StakeholderName);
    if (result) {
      res.status(201).json({
        stakeholderId: result,
        message: "Stakeholder added successfully.",
      });
    } else {
      res.status(500).json({ error: "Failed to add stakeholder." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//check server using a port
const isPortInUse = (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => resolve(true)); // Port is in use
    server.on("listening", () => {
      server.close();
      resolve(false); // Port is free
    });
    server.listen(port);
  });
};

const server = async () => {
  const isInUse = await isPortInUse(port);
  if (isInUse) {
    //console.log(`Port ${port} is already in use. Server not started.`);
  } else {
    const server = app.listen(port, () => {
      //console.log(`Server listening at http://localhost:${port}`);
    });
    return server;
  }
};
server().catch((err) => console.error(err));
// Export the app and server
module.exports = { app, server };
