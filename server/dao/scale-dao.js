'use strict';

/* Data Access Object (DAO) module for accessing the types */

const db = require("../db/db");
const scale = require('../models/scale'); // Import the typeDocument class

/**
 * Retrieves all scales .
 * @returns {Promise<array<Object>} A promise that resolves all scales.
 */
exports.getScales = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Scale';
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const scales = rows.map(row => new scale(row.IdScale, row.scale_text, row.scale_number));
            resolve(scales);
        });
    });
};
/**
 * Retrieves the select scale .
 * @param {Integer} IdScale- the id of the scale.
 * @returns {Promise<Object>} A promise that resolves with the scale object.
 */
exports.getScale = (IdScale)=>{
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM Scale WHERE IdScale = ?';
        db.get(sql, [IdScale], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve({ error: 'Scale not found.' });
            } else {
                const scal = new scale(row.IdScale, row.scale_text, row.scale_number);
                resolve(scal);
            }
        });
    });
}

exports.addScale = (scale_text, scale_number) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO Scale (scale_text, scale_number) VALUES (?, ?)';
        db.run(sql, [scale_text, scale_number], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

exports.updateScale = (scaleId,scale_number) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE Scale SET scale_number = ? WHERE IdScale = ?';
        db.run(sql, [scale_number, scaleId], function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};
