const request = require("supertest");

const app = require("../app");

describe("TODO API", () => {
	it("should retrieve items", async () => {
		const response = await request(app).get("/todos");
		expect(response.status).toBe(200);
		expect(response.body).toEqual(expect.any(Array));
	});

	it("should create a new item", async () => {
		const newTodo = { title: "New Todo", completed: true };
		const response = await request(app).post("/todos").send(newTodo);
		expect(response.status).toBe(201);
		expect(response.body).toMatchObject(newTodo);
		expect(response.body.id).toBeGreaterThan(0);
	});

	it("should update an existing item", async () => {
		const updatedTodo = { title: "Updated Todo", completed: true };
		await request(app).post("/todos").send({ title: "Todo to update" });
		const response = await request(app).put("/todos/1").send(updatedTodo);
		expect(response.status).toBe(204);

		const todosResponse = await request(app).get("/todos");
		expect(todosResponse.body.length).toBeGreaterThan(0);
	});

	it("should return 404 for updating a non-existent item", async () => {
		const response = await request(app)
			.put("/todos/999")
			.send({ title: "Non-existent" });
		expect(response.status).toBe(404);
		expect(response.body).toEqual({ error: "todo not found" });
	});
});
