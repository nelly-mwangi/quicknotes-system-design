# QuickNotes API Design

## 1. Overview

QuickNotes is a REST API for managing users' notes and tags. The API uses JSON for request and response bodies and standard HTTP methods to create, read, update, and delete resources.

The endpoints below describe the proposed production API. The current browser client uses JSONPlaceholder as a demonstration API.

### Base URL

`https://api.quicknotes.example.com/api/v1`

### Authentication

Protected endpoints require a valid access token sent in the request header:

`Authorization: Bearer <access_token>`

Users can only access or modify notes they are authorized to manage.

## 2. REST Endpoints

| Method | Endpoint               | Description                               | Success Status |
| ------ | ---------------------- | ----------------------------------------- | -------------- |
| GET    | `/notes`               | List the authenticated user's notes       | 200 OK         |
| POST   | `/notes`               | Create a note                             | 201 Created    |
| GET    | `/notes/{noteId}`      | Retrieve one note                         | 200 OK         |
| PATCH  | `/notes/{noteId}`      | Update a note's title or body             | 200 OK         |
| DELETE | `/notes/{noteId}`      | Delete a note                             | 204 No Content |
| GET    | `/tags`                | List available tags                       | 200 OK         |
| POST   | `/notes/{noteId}/tags` | Attach a tag to a note                    | 201 Created    |
| GET    | `/users/me`            | Retrieve the authenticated user's profile | 200 OK         |

## 3. Example: List Notes

### Request

`GET /api/v1/notes?limit=10&offset=0`

Headers:

`Authorization: Bearer <access_token>`

### Successful response — 200 OK

```json
{
  "data": [
    {
      "id": 101,
      "userId": 7,
      "title": "Study REST APIs",
      "body": "Review HTTP methods and status codes.",
      "createdAt": "2026-10-24T09:00:00Z",
      "updatedAt": "2026-10-24T09:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

The API returns a list of notes and pagination information. Pagination prevents large collections from being returned in a single response.

## 4. Example: Create a Note

### Request

`POST /api/v1/notes`

Headers:

`Content-Type: application/json`

`Authorization: Bearer <access_token>`

Request body:

```json
{
  "title": "Learn SQL",
  "body": "Practise joins and indexes."
}
```

### Successful response — 201 Created

```json
{
  "data": {
    "id": 102,
    "userId": 7,
    "title": "Learn SQL",
    "body": "Practise joins and indexes.",
    "createdAt": "2026-10-24T10:00:00Z",
    "updatedAt": "2026-10-24T10:00:00Z"
  }
}
```

The server validates the input, associates the note with the authenticated user, saves it to the database, and returns the created resource.

## 5. Error Handling

Errors use a consistent JSON structure so clients can display useful messages.

### Example error response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title is required.",
    "details": [
      {
        "field": "title",
        "message": "Title must contain between 1 and 100 characters."
      }
    ]
  }
}
```

### HTTP error status codes

| Status                    | Meaning                                                    | Example                                                |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| 400 Bad Request           | Invalid request data                                       | A title is missing or too long                         |
| 401 Unauthorized          | Authentication is missing or invalid                       | An access token is absent or expired                   |
| 403 Forbidden             | The user is not allowed to perform the action              | A user attempts an operation restricted by permissions |
| 404 Not Found             | The requested resource does not exist or is not accessible | A note ID cannot be found                              |
| 500 Internal Server Error | An unexpected server error occurred                        | An unhandled database or application failure           |

The server should validate input, avoid exposing internal error details, and log technical information securely for troubleshooting.

## 6. Design Decisions

- **Resource-based URLs:** Notes, users, and tags have clear resource paths.
- **Appropriate HTTP methods:** GET reads, POST creates, PATCH updates, and DELETE removes resources.
- **Pagination:** The notes endpoint supports `limit` and `offset` to manage large result sets.
- **Authentication and authorization:** Protected operations identify the user and check permissions.
- **Consistent errors:** Error responses use the same structure across endpoints.
- **Input validation:** Titles are required and limited to 100 characters; the server validates all incoming data.
