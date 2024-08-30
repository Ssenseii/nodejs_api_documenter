const express = require("express");
const bodyParser = require("body-parser");
const serveStatic = require("serve-static");
const fs = require("fs");
const marked = require("marked");
const path = require("path");
const { log } = require("console");

const app = express();

app.use(bodyParser.json());
app.use(serveStatic("app"));

let todos = [{ id: 1, title: "Test todo", completed: false }];

app.get("/todos", (req, res) => {
	res.json(todos);
});

app.post("/todos", (req, res) => {
	const todo = {
		id: todos.length + 1,
		title: req.body.title,
		completed: req.body.completed || false,
	};
	todos.push(todo);
	res.status(201).json(todo);
});

app.put("/todos/:id", (req, res) => {
	const id = parseInt(req.params.id);
	console.log("id = ", id);
	const index = todos.findIndex((t) => {
		console.log(todos);
		return t.id === id;
	});
	if (index === -1) {
		return res.status(404).json({ error: "todo not found" });
	}
	todos.splice(index, 1);
	res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

//// ROUTE INTROSPECTION

function getRoutes(app) {
	const routes = [];

	app._router.stack.forEach((middleware) => {
		if (middleware.route) {
			const methods = Object.keys(middleware.route.methods).join(", ");
			const path = middleware.route.path;
			routes.push({ methods, path });
		}
	});

	return routes;
}

app.get("/routes", (res, req) => {
	req.status(500).send(getRoutes(app));
});

//// Documentation Generation

function generateDocumentation(routes = getRoutes(app)) {
	let markdown = "# API Documentation\n\n";

	const routesWithDetails = routes.map((route) => {
		markdown += `## ${route.methods} ${route.path}\n\n`;
		markdown += `**Description:** This route handles ${route.methods} requests to ${route.path}.\n\n`;
		const params = route.path.match(/:\w+/g);
		if (params) {
			markdown += `**Parameters:** ${params.join(", ")}\n\n`;
		}
		markdown += "**Response:** 200 OK, 404 Not Found\n\n";
	});

	fs.writeFileSync("API_Documentation.md", markdown);
	console.log("Markdown API Documentation generated successfully!");
}

// Serving documnetation

app.get("/docs", (req, res) => {
	fs.readFile(
		path.join(__dirname, "API_Documentation.md"),
		"utf-8",
		(err, data) => {
			if (err) {
				res.status(400).send("Error reading Markdown File");
				return;
			}
			const html = marked.parse(data);
			res.send(html);
		}
	);
});

app.get("/docs/download", (req, res) => {
	res.download(__dirname + "/API_Documentation.md");
});

generateDocumentation(getRoutes(app));

module.exports = app;
