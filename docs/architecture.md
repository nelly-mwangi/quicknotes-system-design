# QuickNotes System Architecture

## 1. Overview

QuickNotes is a web application that allows users to create, view, update, and delete notes. The architecture is designed to support growth while keeping the application reliable, secure, and maintainable.

## 2. Requirements

### Functional Requirements

1. Users can register and authenticate.
2. Users can create notes with a required title and optional body.
3. Users can list, view, update, and delete their notes.
4. Users can assign tags to notes.
5. Users can only access notes they are authorized to manage.
6. The API returns clear success and error responses.

### Non-Functional Requirements

1. **Scalability:** The system should support increasing numbers of users and requests.
2. **Availability:** Redundant application servers should reduce downtime.
3. **Performance:** Frequently accessed data should be returned quickly.
4. **Security:** Use HTTPS, authentication, authorization, input validation, and secure secrets management.
5. **Reliability:** Backups, monitoring, and recovery procedures should protect the service and its data.
6. **Maintainability:** Separate application logic, database access, and background processing.

## 3. High-Level Architecture Diagram

```text
                    Users / Browsers
                           |
                         DNS
                           |
                          CDN
                           |
                    Load Balancer
                      /         \
                     v           v
              Application 1  Application 2
                      \         /
                       \       /
                        v     v
                     Cache (Redis)
                           |
                     Primary Database
                           |
                       Read Replica

              Application Servers
                      |
                    Queue
                      |
                Background Worker
```

### Component Responsibilities

- **Users / Browsers:** Display the interface and send API requests.
- **DNS:** Resolves the application domain name to the appropriate network destination.
- **CDN:** Delivers static assets, such as CSS and JavaScript, from locations closer to users.
- **Load Balancer:** Distributes incoming API traffic across healthy application servers.
- **Application Servers:** Validate requests, enforce permissions, and execute application logic. Running at least two instances improves resilience.
- **Cache (Redis):** Stores suitable frequently accessed data temporarily to reduce database load.
- **Primary Database:** Stores the authoritative users, notes, tags, and relationships. Writes go to the primary database.
- **Read Replica:** Serves eligible read queries to reduce load on the primary database. Replication may introduce a short delay.
- **Queue:** Holds asynchronous tasks, such as sending notifications or processing exports.
- **Background Worker:** Processes queued tasks independently of the user's immediate API request.

## 4. Request Flow: GET /notes

1. The browser sends a GET request to the QuickNotes API over HTTPS.
2. DNS resolves the application's domain name.
3. The CDN may serve cached static frontend files; authenticated notes data should not be publicly cached.
4. The load balancer forwards the API request to a healthy application server.
5. The application server authenticates the user and checks authorization.
6. The server checks the cache for suitable data. If there is a cache miss, it queries the database.
7. The database returns notes belonging to the authenticated user. A read replica may serve eligible queries when its consistency characteristics are acceptable.
8. The application server returns a JSON response with an HTTP 200 status.
9. The browser displays the notes.

## 5. Request Flow: POST /notes

1. The browser sends a POST request containing a title and optional body over HTTPS.
2. The load balancer routes the request to a healthy application server.
3. The server validates the access token, request body, and user's permissions.
4. The server checks that the title is present and no longer than 100 characters.
5. The application writes the new note to the primary database.
6. After a successful write, the server invalidates or updates any relevant cached data.
7. The server returns HTTP 201 Created with the new note's details.
8. If an asynchronous task is needed, such as sending a notification, the application can publish a message to the queue for a worker to process.

## 6. Capacity Estimate for 1 Million Users

The following figures are planning assumptions, not measured traffic. Actual capacity should be validated through monitoring and load testing.

### Assumptions

- 1,000,000 registered users.
- 10% of users active on a typical day: 100,000 daily active users.
- Each daily active user makes 50 API reads and 5 writes per day.
- Average stored note data, including basic metadata, is approximately 2 KB.
- Each daily active user creates 2 notes per day.
- The system operates continuously over 365 days.

### Estimated Request Rates

Daily reads:

100,000 users × 50 reads = 5,000,000 reads/day

Average reads per second:

5,000,000 ÷ 86,400 ≈ 58 reads/second

Daily writes:

100,000 users × 5 writes = 500,000 writes/day

Average writes per second:

500,000 ÷ 86,400 ≈ 5.8 writes/second

| Metric                    | Estimated value |
| ------------------------- | --------------: |
| Registered users          |       1,000,000 |
| Daily active users        |         100,000 |
| Average reads per second  |              58 |
| Average writes per second |             5.8 |
| New notes per day         |         200,000 |
| New notes per year        |      73,000,000 |
| New note data per year    |    About 146 GB |

The storage estimate assumes 2 KB per new note and excludes indexes, backups, replicas, logs, attachments, and other metadata. Peak traffic may be several times higher than the daily average, so capacity planning must account for bursts.

## 7. Trade-Offs

### Trade-Off 1: Cache vs Data Freshness

**Benefit:** Caching frequently accessed data reduces database load and can improve response times.

**Cost:** Cached information can become stale, especially when a note is updated or deleted.

**Decision:** Cache only appropriate data, use short expiration periods where suitable, and invalidate affected cache entries after changes. Do not share private notes through a public cache.

### Trade-Off 2: Read Replica vs Strong Consistency

**Benefit:** A read replica distributes read traffic and helps the primary database focus on writes.

**Cost:** Replication can lag behind the primary database, so a recent write may not appear immediately on the replica.

**Decision:** Send writes to the primary database. Route reads that require the latest data to the primary; use replicas for reads that can tolerate brief delays.

### Trade-Off 3: More Application Servers vs Cost

**Benefit:** Multiple application servers improve capacity and allow the service to continue if one instance fails.

**Cost:** Additional instances increase infrastructure and monitoring costs.

**Decision:** Start with at least two application instances and scale based on measured demand.

## 8. Avoiding Single Points of Failure

A single point of failure is a component whose failure can make the entire service unavailable.

- Run multiple application server instances across separate failure domains where practical.
- Use a highly available load balancer and DNS service.
- Deploy the cache with appropriate redundancy if the application depends on it for availability.
- Configure database backups, recovery testing, and a suitable failover strategy for the primary and replica.
- Use durable queues and retry failed background jobs safely.
- Monitor errors, latency, server health, database performance, and queue depth.
- Document incident response and disaster recovery procedures.

High availability requires more than adding replicas: failover must be configured and tested, and backups must be restorable.
