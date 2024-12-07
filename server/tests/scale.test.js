import request from "supertest";

import {app} from '../index.js';

const scaleDao = require("../dao/scale-dao.js");
jest.mock("../dao/scale-dao.js");
require('dotenv').config();
describe('Scale API', () => {

    let agent;
    beforeAll(async () => {
        agent = request.agent(app);
        await agent
          .post("/api/sessions")
          .send({ username: "mario@test.it", password: process.env.TEST_USER_PASSWORD });
    });
    describe('GET /api/scales', () => {
        it('should return all scales', async () => {
            const mockScales = [{ id: 1, scale_text: 'Scale 1', scale_number: 10 }];
            scaleDao.getScales.mockResolvedValue(mockScales);

            const response = await request(app).get('/api/scales');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockScales);
        });

        it('should return 500 if there is an error', async () => {
            scaleDao.getScales.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/scales');

            expect(response.status).toBe(500);
        });
    });

    describe('GET /api/scales/:scaleid', () => {
        it('should return a scale by id', async () => {
            const scale = { id: 1, scale_text: 'Scale 1', scale_number: 10 };
            scaleDao.getScale.mockResolvedValue(scale);

            const response = await request(app).get('/api/scales/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(scale);
        });

        it('should return 404 if scale not found', async () => {
            scaleDao.getScale.mockResolvedValue(null);

            const response = await request(app).get('/api/scales/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Scale not found' });
        });

        it('should return 500 if there is an error', async () => {
            scaleDao.getScale.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/scales/1');

            expect(response.status).toBe(500);
        });
    });

    describe('POST /api/scales', () => {
        it('should create a new scale', async () => {
            const newScale = { scale_text: 'Scale 2', scale_number: 20 };
            scaleDao.addScale.mockResolvedValue(2);

            const response = await agent
                .post('/api/scales')
                .send(newScale);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ scaleId: 2, message: 'Scale added successfully.' });
        });

        it('should return 400 if scale_text or scale_number is missing', async () => {
            const response = await agent
                .post('/api/scales')
                .send({ scale_text: 'Scale 2' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'scale_text and scale_number are required.' });
        });

        it('should return 500 if there is an error', async () => {
            scaleDao.addScale.mockRejectedValue(new Error('Database error'));

            const response = await agent
                .post('/api/scales')
                .send({ scale_text: 'Scale 2', scale_number: 20 });

            expect(response.status).toBe(500);
        });
    });

    describe('PATCH /api/scales/:scaleId', () => {
        it('should update an existing scale', async () => {
            const updatedScale = { scale_number: 30 };
            scaleDao.getScale.mockResolvedValue({ id: 1, scale_text: 'Scale 1', scale_number: 10 });
            scaleDao.updateScale.mockResolvedValue(true);

            const response = await agent
                .patch('/api/scales/1')
                .send(updatedScale);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Scale updated successfully.' });
        });

        it('should return 400 if scale_number is missing', async () => {
            const response = await agent
                .patch('/api/scales/1')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'scale_text and scale_number are required.' });
        });

        it('should return 404 if scale not found', async () => {
            scaleDao.getScale.mockResolvedValue(null);

            const response = await agent
                .patch('/api/scales/999')
                .send({ scale_number: 30 });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Scale not found.' });
        });

        it('should return 500 if there is an error', async () => {
            scaleDao.getScale.mockRejectedValue(new Error('Database error'));

            const response = await agent
                .patch('/api/scales/1')
                .send({ scale_number: 30 });

            expect(response.status).toBe(500);
        });
    });
});