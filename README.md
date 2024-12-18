# KIRUNA_EXPLORER_se2_2024_Team_17

## How to run the Web app

To run the web app refer to the following step:
(Note: VS Code is used as a reference IDE)

- Open two terminals (reffered to as 'terminal 1' and 'terminal 2')

- In terminal 1, type the following commands:
  - `cd server`
  - `npm i`
  - `nodemon index.mjs` (to start the server)
- In terminal 2, type the following commands:

  - `cd client`
  - `npm i`
  - `npm run dev` (to start the client)

- Open a browser window, in the URL field, type `http://localhost:5173/` and press Enter. The client is loaded. The user can interact with the server through the client.

## Docker

### Prerequisites

- Docker Desktop installed on your machine

### Building the Docker container

To start your application easily with Docker, you first need to open docker desktop on you machine
Then open a terminal or a shell in the root of the project and run the following command:

```sh
docker-compose up --build
```

### **Recommended method if Docker Compose runs without success**

If Docker Compose runs without success, you need to build each Docker images (client and server) individually.
To do so, you need to go inside both directory (client and server) and type the following commands:
(Open two terminals from the root: one for the client and one for the server to start each one the application)

for the client:

```
cd client
docker build .
```

and for the server:

```
cd server
docker build .
```

then return back in the root directory and type

```sh
docker-compose up --build
```

You will see the kiruna explore at address: http://localhost:5173/

## How to test the backend API's app

- Open a terminal

- In the terminal, type the following commands:

  - `cd server`
  - Decide what you want to test between users,documents then run the appropriate command (for example, to test users):
  - `npm test users`
  - You will see the total time taken to execute these tests and the different API calls.

## How to test the fronted app

- Open two terminals (reffered to as 'terminal 1' and 'terminal 2')

- In terminal 1, type the following commands:
  - `cd server`
  - `npm i`
  - `nodemon index.mjs` (to start the server)
- In terminal 2, type the following commands:

  - `cd client`
  - `npm i`
  - `npm run dev` (to start the client)

- Then open another one and type the following commands:

  - `cd client`
  - `npm run cypress:run`
  - You will see the total time taken to execute these tests and the components/view tested.
    Important: You can also run this command
  - `npm run cypress:open`
    In the e2e testing you can see the different test files with the possibility to execute each one.

  ## React Client Application Routes

- Route `/`: Welcome page of the kiruna explorer
- Route `/login`: Login page to access as urban planner
- Route `/documents`: Route for showing the documents.
- Route `/documents/modify-document/:documentId`: Route for modifying the document given the id.
- Route `/documents/create-document`: Route for create a document with all fields.

## API Server

### USER API

- POST `/api/sessions`

  - Description: Unauthenticated, creates a new session.
  - Request: The body contains an object with authentication credentials (Content-Type: `application/json`).

  ```json
  {
    "username": "mario@test.it",
    "password": "pwd"
  }
  ```

  - Response: returns `200 OK` (success), `401 Unauthorized` (wrong credentials) or `500 Internal Server Error` (generic error). In case of success, the body contains an object with the authenticated user's information (Content-Type: `application/json`).

- DELETE `/api/sessions/current`

  - Description: Authenticated, deletes the current session.
  - Request: No body.
  - Response: returns `200 OK` (success), `401 Unauthorized` (unauthenticated user) or `500 Internal Server Error` (generic error). No body.

- GET `/api/sessions/current`

  - Description: Authenticated, verifies that the current session is still valid and returns the authenticated user's information.
  - Request: No body.
  - Response: returns `200 OK` (success) or `401 Unauthorized` (unauthenticated user).
  - Response body: In case of success, the body contains an object with the information of the user associated with the current session (Content-Type: `application/json`).

  ```json
  {
    "id": 2,
    "email": "mario@test.it",
    "name": "Mario",
    "surname": "Test",
    "role": "Urban Planner"
  }
  ```

## DOCUMENT API

- POST `/api/documents`

  - Description: Allows the authenticated user to upload a new document to the system. This endpoint validates the user’s authorization level to ensure they have permission to add documents.
  - Request: The request body should contain a JSON object with the document's metadata.

    ```json
    {
      "title": "Sample Title",
      "idStakeholder": 1,
      "scale": "National",
      "issuance_Date": "04/2019",
      "language": "English",
      "pages": 50,
      "description": "A description for the document",
      "idType": 2,
      "locationType": "Point",
      "latitude": 19,
      "longitude": 23,
      "area_coordinates": ""
    }
    ```

  - Response: returns `201 Created OK` (created) or `400 Bad Request` (invalid data ) or `401 Unauthorized` (If the user is unauthenticated or lacks sufficient permissions) or `500 Internal Server Error `If an unexpected error occurs.
  - Response Body: On success (`201 Created`), the body contains an object with the details of the created document.
    ```json
    {
      "documentId": 123,
      "title": "Sample Title",
      "idStakeholder": 1,
      "scale": "National",
      "issuance_Date": "04/2019",
      "language": "English",
      "pages": 50,
      "description": "A description for the document",
      "idType": 2,
      "idLocation": 1
    }
    ```

- GET `/api/documents`
  - Description: Allows all user to get all documents of the system.
  - Request: No request.
  - Response: returns `200 OK` (created) or `400 Bad Request` (invalid data ) or `500 Internal Server Error `If an unexpected error occurs.
  - Response Body: On success (`200 OK`), the body contains an array of objects with the details of the documents.
    ```json
    [
      {
        "documentId": 123,
        "title": "Sample Title",
        "idStakeholder": 1,
        "scale": "National",
        "issuance_Date": "04/2019",
        "language": "English",
        "pages": 50,
        "description": "A description for the document",
        "idType": 2,
        "idLocation": 2
      },
      {
        "documentId": 124,
        "title": "Sample Title v2",
        "idStakeholder": 1,
        "scale": "National",
        "issuance_Date": "04/2019",
        "language": "English",
        "pages": 44,
        "description": "A description for the document v2",
        "idType": 2,
        "idLocation": 1
      }
    ]
    ```
- GET `/api/documents/:documentId`

  - Description: Allows all user to get the document of the system by giving id.
  - Request: No request.
  - Response: returns `200 OK` (created) or `400 Bad Request` (invalid data ) or `500 Internal Server Error `If an unexpected error occurs or `404 Not Found`.
  - Response Body: On success (`200 OK`), the body contains the object with the details of the documents.
    ```json
    {
      "documentId": 123,
      "title": "Sample Title",
      "idStakeholder": 1,
      "scale": "National",
      "issuance_Date": "04/2019",
      "language": "English",
      "pages": 50,
      "description": "A description for the document",
      "idType": 2,
      "idLocation": 1
    }
    ```

- GET `/api/documents/title/:title`

  - Description: Allows all user to get the document of the system by giving title.
  - Request: No request.
  - Response: returns `200 OK` (created) or `400 Bad Request` (invalid data
    ) or `500 Internal Server Error `If an unexpected error occurs or `404 Not Found`.
  - Response Body: On success (`200 OK`), the body contains the object with the details of
    the documents.

    ```json
    {
      "documentId": 123,
      "title": "Sample Title",
      "idStakeholder": 1,
      "scale": "National",
      "issuance_Date": "04/2019",
      "language": "English",
      "pages": 50,
      "description": "A description for the document",
      "idType": 2,
      "idLocation": 1
    }
    ```

- PATCH `/api/documents/:documentid`

  - Description: Allows an authenticated urban planner to update a specific document by its ID. This endpoint updates the document's details and reassigns its stakeholders.

  - Request Parameters: documentid (Integer, required): The unique ID of the document to be updated.

  - Request Body: A JSON object containing the updated document details. The idStakeholder field (array) is optional but will overwrite existing stakeholders if provided.

    ```json
    {
      "title": "Updated Document Title",
      "IdScale": 1,
      "issuance_Date": "2024-06-17",
      "language": "English",
      "pages": 100,
      "description": "Updated description of the document",
      "idtype": 2,
      "idLocation": 3,
      "idStakeholder": [1, 2, 3]
    }
    ```

  - Response: returns `200 OK` (created) or `400 Bad Request` (invalid data) or `500 Internal Server Error `If an unexpected error occurs or `404 Not Found`. `400 Bad Request` if Missing required fields.
  - Response Body: On success (`200 OK`), the body contains the object with the details of
    the documents.

    ```json
    {
      "idDocument": 1,
      "title": "Updated Document Title",
      "IdScale": 1,
      "issuance_Date": "2024-06-17",
      "language": "English",
      "pages": 100,
      "description": "Updated description of the document",
      "idtype": 2,
      "idLocation": 3
    }
    ```

- PATCH `/api/documents/:documentId/connection`

  - Description: Allows an authenticated urban planner to Updates the connection details between two documents. This allows modifying the relationship or connection type between a document and another specified document.

  - Request Parameters: documentId (Integer, required): The unique ID of the document to be connected to.

  - Request Body: A JSON object containing the new connection details. The idStakeholder field

    ```json
    {
      "IdDocument2": 2,
      "IdConnection": 1
    }
    ```

  - Response: `200 OK` Connection updated successfully.
    `400 Bad Request` Missing required fields (IdDocument2 or IdConnection).
    `404 Not Found` if the Document not found.
    `500 Internal Server Error` If an unexpected error occurs.

# RESOURCES API

- **POST** `/api/documents/:documentId/resources`

  - **Description**: Allows users to upload a file for a specific document, given its `documentId`.
  - **Request**:
    - **URL Parameter**: `documentId` (integer) - the unique ID of the document to which the resource will be associated.
    - **Body**: `multipart/form-data` (file upload). The file will be uploaded using the field name `file`.
      - Example Body:
        ```bash
        Content-Type: multipart/form-data
        {
            file: <file_to_upload>
        }
        ```
  - **Response**: returns `200 OK`: File uploaded successfully or `400 Bad Request`: If no file is uploaded or required parameters are missing or `404 Not Found`: If the document with the given `documentId` does not exist. or `500 Internal Server Error`: If an unexpected error occurs.
  - **Response Body**: On success (`200 OK`), the body contains a message with the details of the uploaded file.
    ```json
    {
      "message": "File uploaded successfully!",
      "documentId": 1,
      "filename": "file1234_20241110_145302.pdf"
    }
    ```

- DELETE `/api/documents/:documentId/resources/:filename`

  - Description: Deletes a specific resource (file) associated with a document.
  - Request Parameters: `documentId` (Integer, required) The unique ID of the document. and `filename` (String, required) The name of the file to be deleted.
  - Response: `200 OK` File deleted successfully. `404 Not Found` The specified file does not exist. `500 Internal Server Error` If an unexpected error occurs during file deletion.
  - Response Body on success:

  ```json
  {
    "message": "File deleted successfully."
  }
  ```

- GET `/api/documents/:documentId/resources`

  - **Description**: Allows user to get the resources of the document of the system by giving id
  - **Request**: No request.
  - **Response**: returns `200 OK` (created) or `400 Bad Request` (invalid
    data ) or `500 Internal Server Error `If an unexpected error occurs or `404 Not Found` If the document with the given `documentId` does not exist.
  - **Response Body**: On success (`200 OK`), the body contains the object with the details of the resources of the document.

    ```json
    [
      {
        "documentId": 18,
        "filename": "18_20241110_201804.pdf",
        "url": "/uploads/18/18_20241110_201804.pdf"
      }
    ]
    ```

# ATTACHMENTS API

- POST `/api/documents/:documentId/attachments`

  - Description: Uploads one or more attachment files to a specific document.

  - Request Parameters: `documentId` (Integer, required): The unique ID of the document to which the attachments will be added.

    - Body: `multipart/form-data` (file upload). The file will be uploaded using the field name `file`.
      - Example Body:
        ```bash
        Content-Type: multipart/form-data
        {
            files: [file1, file2, ...]
        }
        ```

  - Response Body in case of success:

    ```json
    {
      "message": "Attachments uploaded successfully!",
      "documentId": 1,
      "files": [
        {
          "filename": "example1.pdf",
          "path": "attachments/1/example1.pdf"
        },
        {
          "filename": "example2.docx",
          "path": "attachments/1/example2.docx"
        }
      ]
    }
    ```

- DELETE `/api/documents/:documentId/attachments/:filename`

  - Description: Deletes a specific attachment file associated with a document.

  - Request Parameters: `documentId` (String, required): The unique ID of the document.
    `filename` (String, required): The name of the attachment file to delete.
  - Response: Returns `200 OK` Attachment successfully deleted.
    `404 Not Found` The specified attachment does not exist.
    `500 Internal Server Error` If an unexpected error occurs during the deletion.
  - Response Body in case of success:

  ```json
  {
    "message": "Attachment deleted successfully."
  }
  ```

- GET `/api/documents/:documentId/attachments`
  - Description: Retrieves a list of attachments associated with a document.
  - Request Parameters: `documentId` (Integer, required): The unique ID of the document.
  - Response: Returns `200 OK` A list of attachments associated with the document.
    `404 Not Found` The specified document does not exist.
    `500 Internal Server Error` If an unexpected error occurs during the retrieval.
  - Response Body in case of success:
  ```json
  [
    {
      "documentId": 1,
      "filename": "attachment1.pdf",
      "url": "/attachments/1/attachment1.pdf"
    },
    {
      "documentId": 1,
      "filename": "attachment2.docx",
      "url": "/attachments/1/attachment2.docx"
    }
  ]
  ```

# DOCUMENT CONNECTION API

- GET `/api/document-connections`

  - Description: lists all document connection entries in the table.

  - Request: No Body.
  - Response: returns `200 OK` (success) or `500 Internal Server Error` If an unexpected error occurs.
  - Response body in case of success :

  ```json
  [
    {
      "IdConnectionDocuments": 1,
      "IdDocument1": 1,
      "IdDocument2": 2,
      "IdConnection": 1
    }
  ]
  ```

  - Response: `200 OK` Attachments successfully uploaded. `400 Bad Request` Invalid or missing documentId, or no files uploaded.
    `404 Not Found` Document with the given documentId does not exist.
    `500 Internal Server Error` If an unexpected error occurs during the upload process.

- GET `/api/document-connections/:idDocument`

  - Description: return all the connections for specific document.

  - Request: No Body.
  - Response: returns `200 OK` (success) or `500 Internal Server Error` If an unexpected error occurs.
  - Response body in case of success :

  ```json
  [
    {
      "IdConnectionDocuments": 1,
      "IdDocument1": 1,
      "IdDocument2": 2,
      "IdConnection": 1
    }
  ]
  ```

- POST `/api/document-connections`

  - Description: Creates a connection between two documents in the system. This endpoint validates that the user has urban planner permissions and ensures documents can be properly linked.
  - Request: The request body should contain a JSON object with the connection details.

    ```json
    {
      "IdDocument1": 1,
      "IdDocument2": 2,
      "IdConnection": 1
    }
    ```

  - Response: returns `201 Created OK` (created) or `400 Bad Request` (invalid data ) or `401 Unauthorized` (If the user is unauthenticated or lacks sufficient permissions) or `500 Internal Server Error `If an unexpected error occurs.

  - Response Body: On success (`201 Created`), returns the created connection

    ```json
    {
      "id": 1,
      "IdDocument1": 1,
      "IdDocument2": 2,
      "IdConnection": 1
    }
    ```

# LOCATION API

- GET `/api/locations`

  - **Description**: Retrieves a list of all locations.
  - **Request**: No request body required.
  - **Response**: Returns `200 OK` with a JSON array of locations if successful, or `500 Internal Server Error` if an unexpected error occurs.
  - **Response Body on Success**:
    ```json
    [
      {
        "IdLocation": 1,
        "LocationType": "Point",
        "Latitude": 45.0,
        "Longitude": 9.0,
        "AreaCoordinates": null
      }
    ]
    ```

- GET `/api/locations/:locationId`

  - **Description**: Retrieves a specific location by its ID.
  - **Request Parameters**:
    - `locationId` (Number, required): The ID of the location to retrieve.
  - **Response**: Returns `200 OK` with the location data if found, `404 Not Found` if the location does not exist, or `500 Internal Server Error` if an unexpected error occurs.
  - **Response Body on Success**:
    ```json
    {
      "IdLocation": 1,
      "LocationType": "Point",
      "Latitude": 45.0,
      "Longitude": 9.0,
      "AreaCoordinates": null
    }
    ```

- POST `/api/locations`

  - **Description**: Creates a new location entry.
  - **Authorization**: Requires `isUrbanPlanner` authorization.
  - **Request Body**:
    - `locationType` (String, required): The type of location (`"Point"` or `"Area"`).
    - `latitude` (Number, required if `locationType` is `"Point"`): The latitude of the location.
    - `longitude` (Number, required if `locationType` is `"Point"`): The longitude of the location.
    - `areaCoordinates` (String, required if `locationType` is `"Area"`): The area coordinates in string format.
  - **Response**: Returns `201 Created` with a success message if the location is created, or `400 Bad Request` if validation fails, or `500 Internal Server Error` if an error occurs.
  - **Response Body on Success**:
    ```json
    {
      "message": "Location added successfully."
    }
    ```

- PATCH `/api/locations/:locationId`

  - **Description**: Updates an existing location by its ID.
  - **Authorization**: Requires `isUrbanPlanner` authorization.
  - **Request Parameters**:
    - `locationId` (Number, required): The ID of the location to update.
  - **Request Body**:
    - `locationType` (String, required): The type of location (`"Point"` or `"Area"`).
    - `latitude` (Number, required if `locationType` is `"Point"`): The latitude of the location.
    - `longitude` (Number, required if `locationType` is `"Point"`): The longitude of the location.
    - `areaCoordinates` (String, required if `locationType` is `"Area"`): The area coordinates in string format.
  - **Response**: Returns `200 OK` with a success message if the location is updated, `404 Not Found` if the location does not exist, `400 Bad Request` if validation fails, or `500 Internal Server Error` if an error occurs.
  - **Response Body on Success**:
    ```json
    {
      "message": "Location updated successfully."
    }
    ```

# Stakeholder API

- GET`/api/stakeholders`

  - **Description**: Retrieves a list of all stakeholders.
  - **Request**: No request body required.
  - **Response**: Returns `200 OK` with a JSON array of stakeholders if successful, or `500 Internal Server Error` if an unexpected error occurs.
  - **Response Body on Success**:
    ```json
    [
      {
        "IdStakeholder": 1,
        "Name": "Municipality",
        "Color": "#8C6760"
      }
    ]
    ```

- GET `/api/stakeholders/:stakeholderid`

  - **Description**: Retrieves a specific stakeholder by their ID.
  - **Request Parameters**:
    - `stakeholderid` (Number, required): The ID of the stakeholder to retrieve.
  - **Response**: Returns `200 OK` with the stakeholder data if found, `404 Not Found` if the stakeholder does not exist, or `500 Internal Server Error` if an unexpected error occurs.
  - **Response Body on Success**:
    ```json
    {
      "IdStakeholder": 1,
      "Name": "Municipality",
      "Color": "#8C6760"
    }
    ```

- POST `/api/stakeholders`
  - **Description**: Add a stakeholder.
    - **Request Body**:
      ```json
      {
        "Name": " new Municipality",
        "Color": "#8C6760"
      }
      ```
    - **Response**: Returns `20q Created` with the stakeholder data if added, `400 Bad request` if the parameters are not present, or `500 Internal Server Error` if an unexpected error occurs.
    - **Response Body on Success**:
      ```json
      {
        "IdStakeholder": 4,
        "Name": " new Municipality",
        "Color": "#8C6760"
      }
      ```
- GET `/api/documents/:documentId/stakeholders`
  - **Description**: Retrieves all stakeholders associated with a specific document.
    - **Request Parameters**:
      - `documentId` (String, required): The unique ID of the document.
    - **Response**: Returns `200 OK` with a JSON array of stakeholders if successful, or `500 Internal Server Error` if an unexpected error occurs.
      - **Response Body on Success**:
        ```json
        [
          {
            "IdStakeholder": 1,
            "Name": "Municipality",
            "Color": "#8C6760"
          }
        ]
        ```
- GET `/api/stakeholders/:stakeholderId/documents`

  - **Description**: Retrieves all documents associated with a specific stakeholder.
    - **Request Parameters**:
      - `stakeholderId` (String, required): The unique ID of the stakeholder.
    - **Response**: Returns `200 OK` with a JSON array of documents if successful, or `500 Internal Server Error` if an unexpected error occurs.
      - **Response Body on Success**:
      ```json
      [
        {
          "documentId": 123,
          "title": "Sample Title",
          "idStakeholder": 1,
          "scale": "National",
          "issuance_Date": "04/2019",
          "language": "English",
          "pages": 50,
          "description": "A description for the document",
          "idType": 2,
          "idLocation": 1
        }
      ]
      ```

- DELETE `/api/documents/:documentId/stakeholders`
  - **Description**: Clears all stakeholders from a specific document.
    - **Request Parameters**:
      - `documentId` (String, required): The unique ID of the document.
    - **Response**: Returns `200 OK` with a success message if stakeholders are removed, `404 Not Found` if no stakeholders are found to remove, or `500 Internal Server Error` if an unexpected error occurs.
      - **Response Body on Success**:
        ```json
        {
          "message": "Stakeholders removed successfully."
        }
        ```

# Type API

- GET `/api/types`

  - **Description**: Retrieves a list of all document types.
  - **Request**: No request body required.
  - **Response**: Returns `200 OK` with a JSON array of document types if successful, or `500 Internal Server Error` if an unexpected error occurs.
  - **Response Body on Success**:
    ```json
    [
      {
        "IdType": 1,
        "Name": "Report",
        "Description": "A detailed report document type."
      }
    ]
    ```

- GET `/api/types/:typeid`

  - **Description**: Retrieves a specific document type by its ID.
  - **Request Parameters**:
    - `typeid` (Number, required): The ID of the document type to retrieve.
  - **Response**: Returns `200 OK` with the document type data if found, `404 Not Found` if the type does not exist, or `500 Internal Server Error` if an unexpected error occurs.
  - **Response Body on Success**:
    ```json
    {
      "IdType": 1,
      "Name": "Report",
      "Description": "A detailed report document type."
    }
    ```

- POST `/api/types`
  - **Description**: Allows an urban planner to add a new type with an associated icon.
  - **Request Body**:
  ```json
  {
    "type": "New type",
    "iconSrc": "abc.jpg"
  }
  ```
  - **Responses**:
    - `201 Created`: If the type is successfully added. The response contains the `typeId` of the newly added type and a success message or `400 Bad Request`: If either `type` or `iconSrc` is missing from the request body. The response contains an error message or `500 Internal Server Error`: If there is an error while adding the type. The response contains an error message.
      ```json
      {
        "typeId": "12345",
        "message": "Type added successfully."
      }
      ```

# Scale API

- GET `/api/scales`
- **Description**: Retrieves a list of all available scales.
- **Response**: Returns `200 OK` with a JSON array of scales if successful, or
  `500 Internal Server Error` if an unexpected error occurs.
- **Response Body on Success**:

  ```json
  [
    {
      "IdScale": 1,
      "scale_text": "1:100",
      "scale_number": 100
    },
    {
      "IdScale": 2,
      "scale_text": "1:200",
      "scale_number": 200
    }
  ]
  ```

- GET `/api/scales/:scaleid`

  - **Description**: Retrieves a specific scale by its ID.
  - **Response**: Returns `200 OK` with the scale data if successful, or `404 Not Found` if the scale does not exist, or `500 Internal Server Error` if an unexpected error occurs.
  - **Response Body on Success**:
    ```json
    {
      "IdScale": 1,
      "scale_text": "1:100",
      "scale_number": 100
    }
    ```

- POST `/api/scales`

  - **Description**: Allows an urban planner to add a new scale.
  - **Request Body**:
    ```json
    {
      "scale_text": "1:100",
      "scale_number": 100
    }
    ```
  - **Responses**:

    - `201 Created`: If the scale is successfully added. The response contains the `scaleId` of the newly added scale and a success message.
    - `400 Bad Request`: If either `scale_text` or `scale_number` is missing from the request body. The response contains an error message.
    - `500 Internal Server Error`: If there is an error while adding the scale. The response contains an error message.

      ```json
      {
        "scaleId": "12345",
        "message": "Scale added successfully."
      }
      ```

- PATCH `/api/scales/:scaleid`

  - **Description**: Allows an urban planner to update an existing scale by its ID.
  - **Request Parameters**:
    - `scaleid` (Number, required): The ID of the scale to update.
  - **Request Body**: A JSON object containing the updated numeric value for the scale.
    ```json
    {
      "scale_number": 200
    }
    ```
  - **Response**:

    - `200 OK`: If the scale is successfully updated. The response contains a success message.
    - `404 Not Found`: If the scale does not exist. The response contains an error message.
    - `400 Bad Request`: If either `scale_text` or `scale_number` is missing from the request body. The response contains an error message.
    - `500 Internal Server Error`: If there is an error while updating the scale. The response contains an error message.

      ```json
      {
        "message": "Scale updated successfully."
      }
      ```

## Database Tables

**User**

- **IdUser**: Unique identifier for the user
- **Email**: Unique email address of the user
- **PasswordHash**: Hashed password of the user
- **Salt**: Unique salt for password hashing
- **Role**: Role of the user (e.g., Admin, Editor)
- **Name**: First name of the user
- **Surname**: Last name of the user

**Stakeholder**

- **IdStakeholder**: Unique identifier for each stakeholder
- **Name**: Name of the stakeholder
- **Color**: Hex color code representing the stakeholder (e.g., `#FFFFFF`)

**Location**

- **IdLocation**: Unique identifier for each location
- **Location_Type**: Type of location (e.g., `point` or `area`)
- **Latitude**: Latitude coordinate (for point locations)
- **Longitude**: Longitude coordinate (for point locations)
- **Area_Coordinates**: Array of coordinate pairs forming an area (used if location is an area)

**TypeDocument**

- **IdType**: Unique identifier for each document type
- **IconSrc**: Path or URL to the icon representing this type
- **Type**: Name of the document type (e.g., Report, Policy)

**Document**

- **IdDocument**: Unique identifier for each document
- **Title**: Title of the document
- **IdStakeholder**: Reference to the array of id stakeholders responsible for this document
- **Scale**: Scope or scale of the document (e.g., National, Regional)
- **Issuance_Date**: Date when the document was issued
- **Language**: Language of the document
- **Pages**: Number of pages in the document
- **Description**: Brief description of the document
- **IdType**: Reference to the type of the document
- **IdLocation**: Reference to the location associated with this document
- **IdScale**: Reference to the Scale associated with this document

**Location**

- **IdLocation**: Unique identifier for each location
- **Location_Type**: Type of Location(e.g., Point, Area)
- **Latitude**: Latitude of the document, if location_type is an area it is the center of it
- **Longitude**: Longitude of the document, if location_type is an area it is the center of it
- **Area_Coordinates**: Area coordinates
- **Area_Name**: Area name

**Connection**

- **IdConnection**: Unique identifier for each connection type
- **Type**: Type of connection between documents (e.g., Collateral, Direct Consequence)
- **Description**: Description of the connection type

**DocumentConnection**

- **IdConnectionDocuments**: Unique identifier for each document connection
- **IdDocument1**: Reference to the first document in the connection
- **IdDocument2**: Reference to the second document in the connection
- **IdConnection**: Reference to the type of connection between the documents

**Scale**

- **IdScale**: Unique identifier for each connection scale
- **scale_text**: Name of scale (e.g., architecture plan new,..)
- **scale_number**: scale numbers es 1:100

## Main React Components

- **Login.jsx**: Handles the user authentication process, including login and session management.
- **Default.jsx**: Fallback component for routes that do not exist, ensuring users are redirected to a 404 page.
- **Home.jsx**: The homepage of the application, providing an introduction to the platform and navigation to other parts of the app.
- **Map.jsx**: Displays an interactive map to visualize geographic data related to documents and locations in the system.
- **ModifyDocument.jsx**: Allows users to modify an existing document’s metadata, providing an editable form for updates as well as creating a new document.
- **MyNavBar.jsx**: The navigation bar component that provides links to the homepage, documents, map, and other sections of the app.
- **API.jsx**: Manages API calls to the backend, centralizing data fetching and providing reusable hooks for components.
- **App.jsx**: The root component that renders the entire application, integrating routing and layout to ensure smooth app functionality.
- **WelcomePage.jsx**: The main UI component where the users can start using the application and navigate related pages.
- **Diagram.jsx** : this Page show the diagram where the users can see the different connections and relationship among documents.
-

## Screenshots

![Screenshot](/images/welcomepage.png)
![Screenshot](/images/login.png)
![Screenshot](/images/map.png)
![Screenshot](/images/addDocument.png)
![Screenshot](/images/listDocument.png)
![Screenshot](/images/visualizeDocument.png)
![Screenshot](/images/visualizeDocumentMap.png)
![Screenshot](/images/updateDocument.png)
![Screenshot](/images/createDocument.png)

## License

This project is licensed under the CC BY-NC-SA 4.0 License.
