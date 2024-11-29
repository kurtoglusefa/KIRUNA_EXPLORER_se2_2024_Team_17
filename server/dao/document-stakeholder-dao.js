"use strict";

/* Data Access Object (DAO) module for accessing document-stakeholder relationships */

const db = require("../db/db");

/**
 * Adds a stakeholder to a document.
 * @param {Number} documentId - ID of the document
 * @param {Number} stakeholderId - ID of the stakeholder
 * @returns {Promise<Boolean>} Resolves to true if the stakeholder was added successfully, false otherwise
 */
exports.addStakeholderToDocument = (documentId, stakeholderId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO DocumentStakeholder (IdDocument, IdStakeholder) VALUES (?, ?)";
    db.run(sql, [documentId, stakeholderId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });
};

/**
 * Retrieves all stakeholders for a specific document.
 * @param {Number} documentId - ID of the document
 * @returns {Promise<Array>} Resolves to an array of stakeholder objects
 */
exports.getStakeholdersByDocument = (documentId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT s.IdStakeholder, s.Name, s.Color FROM Stakeholder s INNER JOIN DocumentStakeholder ds ON s.IdStakeholder = ds.IdStakeholder WHERE ds.IdDocument = ?";
    db.all(sql, [documentId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows); // Returns array of stakeholders for the document
    });
  });
};

/**
 * Retrieves all documents for a specific stakeholder.
 * @param {Number} stakeholderId - ID of the stakeholder
 * @returns {Promise<Array>} Resolves to an array of document objects
 */
exports.getDocumentsByStakeholder = (stakeholderId) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT d.IdDocument, d.Title, d.Description, d.Issuance_Date, d.Language FROM Document d INNER JOIN DocumentStakeholder ds ON d.IdDocument = ds.IdDocument WHERE ds.IdStakeholder = ?";
    db.all(sql, [stakeholderId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows); // Returns array of documents associated with the stakeholder
    });
  });
};

/**
 * Removes all stakeholders from a document.
 * @param {Number} documentId - ID of the document
 * @returns {Promise<Boolean>} Resolves to true if stakeholders were removed successfully, false otherwise
 */
exports.clearStakeholdersFromDocument = (documentId) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM DocumentStakeholder WHERE IdDocument = ?";
    db.run(sql, [documentId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes > 0); // Returns true if any rows were deleted
    });
  });
};
