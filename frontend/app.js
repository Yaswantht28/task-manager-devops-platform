
const API_URL = "/api/tasks";

const form = document.getElementById("task-form");
const input = document.getElementById("task-title");
const taskList = document.getElementById("task-list");
const message = document.getElementById("message");
const emptyState = document.getElementById("empty-state");

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "API request failed");
    }

    return data;
}

// GET: Retrieve all tasks
async function loadTasks() {
    try {
        emptyState.hidden = false;
        emptyState.textContent = "Loading tasks...";

        const tasks = await apiRequest(API_URL);

        renderTasks(tasks);

    } catch (error) {
        taskList.replaceChildren();
        emptyState.hidden = false;
        emptyState.textContent = "Unable to load tasks. Check backend.";
        message.textContent = error.message;
    }
}

// Display tasks
function renderTasks(tasks) {
    taskList.replaceChildren();

    document.getElementById("total-count").textContent =
        tasks.length;

    document.getElementById("completed-count").textContent =
        tasks.filter(task => task.completed).length;

    document.getElementById("pending-count").textContent =
        tasks.filter(task => !task.completed).length;

    emptyState.hidden = tasks.length > 0;

    if (tasks.length === 0) {
        emptyState.textContent = "No tasks available.";
    }

    tasks.forEach(task => {
        const li = document.createElement("li");

        const title = document.createElement("span");
        title.textContent = task.title;
        title.className = task.completed
            ? "task-title done"
            : "task-title";

        // PATCH: Update task status
        const completeButton = document.createElement("button");
        completeButton.textContent =
            task.completed ? "Undo" : "Complete";
        completeButton.className = "complete";

        completeButton.addEventListener("click", async () => {
            try {
                await apiRequest(`${API_URL}/${task._id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        completed: !task.completed
                    })
                });

                await loadTasks();
                message.textContent = "Task updated successfully.";
            } catch (error) {
                message.textContent = error.message;
            }
        });

        // DELETE: Remove task
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";

        deleteButton.addEventListener("click", async () => {
            try {
                await apiRequest(`${API_URL}/${task._id}`, {
                    method: "DELETE"
                });

                await loadTasks();
                message.textContent = "Task deleted successfully.";
            } catch (error) {
                message.textContent = error.message;
            }
        });

        li.append(title, completeButton, deleteButton);
        taskList.appendChild(li);
    });
}

// POST: Create a new task
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = input.value.trim();

    if (!title) {
        message.textContent = "Please enter a task.";
        return;
    }

    try {
        await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify({ title })
        });

        input.value = "";

        await loadTasks();

        message.textContent = "Task created successfully.";

    } catch (error) {
        message.textContent = error.message;
    }
});

// Load tasks when the page opens
loadTasks();
