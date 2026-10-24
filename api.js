const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.querySelector("#load-btn");
const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");

let notes = [];

// Show status messages and assign a style for success or error.
function showStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

// Reusable request function for GET, POST, and DELETE.
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  // DELETE responses may have no body.
  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const data = await response.json();

  return { data, status: response.status };
}

// Create note elements safely using textContent.
function renderNotes() {
  notesList.replaceChildren();

  if (notes.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No notes found. Create your first note!";
    emptyItem.className = "empty-state";
    notesList.appendChild(emptyItem);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note-item";

    const heading = document.createElement("h3");
    heading.textContent = note.title || "(Untitled note)";

    const body = document.createElement("p");
    body.textContent = note.body || "No body provided.";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () =>
      deleteNote(note.id, deleteButton),
    );

    item.append(heading, body, deleteButton);
    notesList.appendChild(item);
  });
}

// GET: Load 10 notes from the API.
async function loadNotes() {
  loadButton.disabled = true;
  showStatus("Loading notes...");

  try {
    const result = await request(`${API_URL}?_limit=10`);
    notes = result.data;

    renderNotes();

    if (notes.length === 0) {
      showStatus("No notes were returned by the server.");
    } else {
      showStatus(`Loaded ${notes.length} notes from the server.`, "success");
    }
  } catch (error) {
    showStatus("Unable to load notes. Please try again.", "error");
    console.error("GET notes error:", error);
  } finally {
    loadButton.disabled = false;
  }
}

// POST: Create a note.
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    showStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    showStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  showStatus("Creating note...");

  try {
    const result = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1,
      }),
    });

    // JSONPlaceholder simulates creation; it does not persist new posts.
    // Keep the returned note in this page's local state for the current session.
    notes.unshift(result.data);
    renderNotes();

    noteForm.reset();

    showStatus(
      `Note created (status ${result.status}, id ${result.data.id}).`,
      "success",
    );
  } catch (error) {
    showStatus("Unable to create the note. Please try again.", "error");
    console.error("POST note error:", error);
  } finally {
    submitButton.disabled = false;
  }
}

// DELETE: Remove a note from the API and the visible list.
async function deleteNote(id, button) {
  button.disabled = true;
  showStatus("Deleting note...");

  try {
    const result = await request(`${API_URL}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    notes = notes.filter((note) => note.id !== id);
    renderNotes();

    showStatus(`Note deleted (status ${result.status}).`, "success");
  } catch (error) {
    showStatus("Unable to delete the note. Please try again.", "error");
    console.error("DELETE note error:", error);
  } finally {
    // renderNotes() rebuilds the list, so a deleted button may no longer exist.
    // If the request failed, restore the button's enabled state.
    if (button.isConnected) {
      button.disabled = false;
    }
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

// Display the initial empty state.
renderNotes();
