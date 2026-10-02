import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3001';

test.describe('Tasks API', () => {
  test('GET /tasks returns the list of seeded tasks', async ({ request }) => {
    const response = await request.get(`${API_URL}/tasks`);
    expect(response.status()).toBe(200);

    const tasks = await response.json();
    expect(Array.isArray(tasks)).toBeTruthy();
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]).toHaveProperty('title');
    expect(tasks[0]).toHaveProperty('status');
  });

  // TODO (Task C): Add a test here (or in a new file) that creates a task via
  // POST /tasks and validates:
  //   - the response status code
  //   - the shape/structure of the response payload
  //   - that key attributes (title, description, status) match what was submitted

  test('POST /tasks creates a new task and returns the created task', async ({ request }) => {
    const newTask = {
      title: `API test task ${Date.now()}`,
      description: 'This is a new task created via API',
      status: 'In Progress',
      createdAt: new Date().toISOString(),
    };

    const response = await request.post(`${API_URL}/tasks`, {
      data: newTask,
    });
    expect(response.status()).toBe(201);

    const createdTask = await response.json();
    expect(createdTask).toEqual({
      id: expect.any(String),
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      createdAt: newTask.createdAt,
    });

    const getResponse = await request.get(`${API_URL}/tasks/${createdTask.id}`);
    expect(getResponse.status()).toBe(200);
    expect(await getResponse.json()).toEqual(createdTask);
    await request.delete(`${API_URL}/tasks/${createdTask.id}`);
  });
});
