const db = require('../db/db');
const scaleDAO = require('../dao/scale-dao');

const Scale = require('../models/scale');


jest.mock('../db/db');

describe('Scale DAO', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getScales should retrieve all scales', async () => {
        const mockScales = [
            { IdScale: 1, scale_text: 'Scale 1', scale_number: 10 },
            { IdScale: 2, scale_text: 'Scale 2', scale_number: 20 }
        ];
        db.all.mockImplementation((sql, params, callback) => {
            callback(null, mockScales);
        });

        const scales = await scaleDAO.getScales();
        expect(scales).toEqual(mockScales.map(row => new Scale(row.IdScale, row.scale_text, row.scale_number)));
    });
    test('getScales should return an error if database error', async () => {
        db.all.mockImplementation((sql, params, callback) => {
            callback(new Error("Failed to retrieve scales"));
        });
    
        await expect(scaleDAO.getScales()).rejects.toThrow(
            "Failed to retrieve scales"
        );

    });

    test('getScale should retrieve a specific scale by Id', async () => {
        const mockScale = { IdScale: 1, scale_text: 'Scale 1', scale_number: 10 };
        db.get.mockImplementation((sql, params, callback) => {
            callback(null, mockScale);
        });

        const scale = await scaleDAO.getScale(1);
        expect(scale).toEqual(new Scale(mockScale.IdScale, mockScale.scale_text, mockScale.scale_number));
    });

    test('getScale should return error if scale not found', async () => {
        db.get.mockImplementation((sql, params, callback) => {
            callback(null, undefined);
        });

        const scale = await scaleDAO.getScale(1);
        expect(scale).toEqual({ error: 'Scale not found.' });
    });

    test('getScale should return an error if database error', async () => {
        db.get.mockImplementation((sql, params, callback) => {
            callback(new Error("Failed to retrieve scale"));
        });

        await expect(scaleDAO.getScale(1)).rejects.toThrow(
            "Failed to retrieve scale"
        );
    });

    test('addScale should add a new scale and return its ID', async () => {
        db.run.mockImplementation((sql, params, callback) => {
            callback.call({ lastID: 1 }, null);
        });

        const lastID = await scaleDAO.addScale('New Scale', 30);
        expect(lastID).toBe(1);
    });
    test('addScale should return an error if database error', async () => {
        db.run.mockImplementation((sql, params, callback) => {
            callback(new Error("Failed to add scale"));
        });

        await expect(scaleDAO.addScale('New Scale', 30)).rejects.toThrow(
            "Failed to add scale"
        );
    });

    test('updateScale should update the scale number and return the number of changes', async () => {
        db.run.mockImplementation((sql, params, callback) => {
            callback.call({ changes: 1 }, null);
        });

        const changes = await scaleDAO.updateScale(1, 40);
        expect(changes).toBe(1);
    });
    test('updateScale should return an error if database error', async () => {
        db.run.mockImplementation((sql, params, callback) => {
            callback(new Error("Failed to update scale"));
        });

        await expect(scaleDAO.updateScale(1, 40)).rejects.toThrow(
            "Failed to update scale"
        );
    });
});