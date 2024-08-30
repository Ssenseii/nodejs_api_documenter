const API_URL = "http://localhost:3000/todos";

const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");

todoForm.addEventListener("submit", async (e) => {
	e.preventDefault();
	const title = todoInput.value.trim();
	if (title) {
		const todo = { title };
		await createTodo(todo);
		todoInput.value = "";
		loadTodos();
	}
});

async function loadTodos() {
	const todos = await fetchTodos();
	renderTodos(todos);
}

async function fetchTodos() {
	const response = await fetch(API_URL);
	const todos = await response.json();
	return todos;
}

function renderTodos(todos) {
	todoList.innerHTML = "";
	todos.forEach((todo) => {
		const todoElement = createTodoElement(todo);
		todoList.appendChild(todoElement);
	});
}

function createTodoElement(todo) {
	const div = document.createElement("div");
	div.classList.add("todo");
	div.innerHTML = `
                <span class="${todo.completed ? "completed" : ""}">${
		todo.title
	}</span>
                <div>
                    <button onclick="toggleCompleted(${todo.id})">${
		todo.completed ? "Uncomplete" : "Complete"
	}</button>
                    <button onclick="deleteTodo(${todo.id})">Delete</button>
                </div>
            `;
	return div;
}

async function createTodo(todo) {
	await fetch(API_URL, {
		method: "POST",
		body: JSON.stringify(todo),
		headers: { "Content-Type": "application/json" },
	});
}

async function toggleCompleted(id) {
	const todo = await getTodo(id);
	const updatedTodo = { ...todo, completed: !todo.completed };
	await updateTodo(updatedTodo);
	loadTodos();
}

async function deleteTodo(id) {
	await fetch(`${API_URL}/${id}`, { method: "DELETE" });
	loadTodos();
}

async function getTodo(id) {
	const response = await fetch(`${API_URL}/${id}`);
	const todo = await response.json();
	return todo;
}

async function updateTodo(todo) {
	await fetch(`${API_URL}/${todo.id}`, {
		method: "PUT",
		body: JSON.stringify(todo),
		headers: { "Content-Type": "application/json" },
	});
}

loadTodos;
