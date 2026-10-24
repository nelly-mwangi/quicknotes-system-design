# QuickNotes Data Model

## 1. Overview

QuickNotes uses a relational database such as PostgreSQL. The database stores users, their notes, tags, and the relationships between notes and tags.

## 2. Entities and Columns

### Users

| Column     | Type         | Constraints      |
| ---------- | ------------ | ---------------- |
| id         | BIGINT       | Primary key      |
| name       | VARCHAR(100) | NOT NULL         |
| email      | VARCHAR(255) | UNIQUE, NOT NULL |
| created_at | TIMESTAMP    | NOT NULL         |

### Notes

| Column     | Type         | Constraints                                 |
| ---------- | ------------ | ------------------------------------------- |
| id         | BIGINT       | Primary key                                 |
| user_id    | BIGINT       | Foreign key referencing users(id), NOT NULL |
| title      | VARCHAR(100) | NOT NULL                                    |
| body       | TEXT         | Nullable                                    |
| created_at | TIMESTAMP    | NOT NULL                                    |
| updated_at | TIMESTAMP    | NOT NULL                                    |

### Tags

| Column | Type        | Constraints      |
| ------ | ----------- | ---------------- |
| id     | BIGINT      | Primary key      |
| name   | VARCHAR(50) | UNIQUE, NOT NULL |

### Note_Tags

| Column  | Type   | Constraints                                 |
| ------- | ------ | ------------------------------------------- |
| note_id | BIGINT | Foreign key referencing notes(id), NOT NULL |
| tag_id  | BIGINT | Foreign key referencing tags(id), NOT NULL  |

The combination of `note_id` and `tag_id` forms the composite primary key.

## 3. Relationships

- **Users to Notes — one-to-many:** One user can create many notes, but each note belongs to one user.
- **Notes to Tags — many-to-many:** A note can have multiple tags, and each tag can be attached to multiple notes.
- **Note_Tags — junction table:** This table connects notes and tags and implements the many-to-many relationship.

## 4. SQL Table Definitions

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE note_tags (
    note_id BIGINT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

## 5. Example SQL Queries

### Query 1: Get all notes belonging to a user

```sql
SELECT id, title, body, created_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC;
```

This retrieves the user's notes, newest first.

### Query 2: Join notes with their owners

```sql
SELECT notes.id, notes.title, users.name AS owner
FROM notes
JOIN users ON notes.user_id = users.id
WHERE users.id = 1;
```

This JOIN combines notes with user information using the foreign key.

### Query 3: Find all tags attached to a note

```sql
SELECT tags.name
FROM tags
JOIN note_tags ON tags.id = note_tags.tag_id
WHERE note_tags.note_id = 101;
```

This query uses the junction table to retrieve a note's tags.

### Query 4: Count notes per user

```sql
SELECT users.id, users.name, COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id, users.name;
```

The LEFT JOIN includes users who have not created any notes.

## 6. Indexing Strategy

Create an index on `notes.user_id`:

```sql
CREATE INDEX idx_notes_user_id ON notes(user_id);
```

**Why?** The application frequently retrieves notes belonging to a particular user. This index helps the database find matching notes without scanning the entire notes table.

The primary keys and unique constraints also create indexes in PostgreSQL.

## 7. SQL vs NoSQL Decision

**Decision: Use PostgreSQL (SQL).**

Reasons:

- **Relationships:** Users, notes, and tags have clear relationships that foreign keys can enforce.
- **Data integrity:** Primary keys, foreign keys, and constraints prevent invalid relationships and duplicate emails or tag names.
- **JOIN queries:** The application needs to retrieve notes with their owners and tags.
- **Transactions:** Related database changes can be grouped into transactions to maintain consistency.

A NoSQL database could be useful if the application later needed highly flexible document structures or a different scaling strategy. However, PostgreSQL is a good starting point because QuickNotes has structured data and clear relationships.
