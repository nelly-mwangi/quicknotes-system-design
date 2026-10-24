# QuickNotes System Design

QuickNotes is a simple notes application that demonstrates REST API operations, relational database design, and scalable system architecture. The browser client uses JavaScript to load, create, and delete notes through HTTP requests.

## Features

- Load notes from an API using GET.
- Create notes using POST.
- Delete notes using DELETE.
- Validate note titles and display loading, success, and error messages.
- Document REST endpoints, database relationships, and system architecture.

## Technologies

- HTML5
- CSS3
- JavaScript (Fetch API and async/await)
- JSONPlaceholder API
- PostgreSQL (proposed database design)

## How to Run the API Client

1. Clone the repository:

   ```bash
   git clone https://github.com/nelly-mwangi/quicknotes-system-design.git
   ```

2. Open the project folder:

   ```bash
   cd quicknotes-system-design
   ```

3. Open `index.html` in a browser. Alternatively, use the Live Server extension in Visual Studio Code.

4. Click **Load notes** to fetch notes from JSONPlaceholder.

5. Enter a title and optional body, then click **Create note**. Use the **Delete** button to remove a note from the current client view.

**Note:** JSONPlaceholder is a testing API. It simulates creating and deleting posts but does not permanently save those changes. Newly created notes are retained only in the current page's local state.

No backend installation or database setup is required to run the browser client.

## Project Documentation

- [API Design](docs/api-design.md) — REST endpoints, request/response examples, and error handling.
- [Data Model](docs/data-model.md) — database entities, relationships, SQL queries, indexing, and database choice.
- [Architecture](docs/architecture.md) — requirements, architecture diagram, request flows, capacity estimates, and trade-offs.

## What I Learned

- How to use the Fetch API with async/await and handle unsuccessful HTTP responses.
- Why request validation and clear loading, success, and error states improve the user experience.
- How REST methods and HTTP status codes represent different API operations.
- How primary keys, foreign keys, junction tables, and indexes support relational database design.
- How caching, load balancing, read replicas, queues, and multiple application servers can support scalability and resilience.
- Why architecture decisions involve trade-offs between performance, consistency, availability, and cost.

## Future Improvements

- Connect the client to a persistent backend and PostgreSQL database.
- Add authentication and authorization.
- Implement editing, search, and tag management.
- Add automated tests and deploy the application.
