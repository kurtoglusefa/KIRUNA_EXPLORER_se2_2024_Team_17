// db.test.js
const sqlite3 = require('sqlite3');

// Use jest.mock to mock the sqlite3 module before requiring your db.js
jest.mock('sqlite3', () => {
  return {
    Database: jest.fn((dbPath, callback) => {
      // Simulate an error when trying to open the database
      callback(new Error('Failed to open database'));
    })
  };
});

describe('Database connection failure', () => {
  it('should throw an error when opening the database fails', () => {
    // Use a try-catch block to catch the thrown error
    expect(() => {
      require('../db/db');  // This requires the db.js file and should trigger the error
    }).toThrowError('Failed to open database');
  });
});
