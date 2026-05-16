import request from 'supertest';
import app from '../app.ts';

describe('Express API Tests', () => {
  // Root endpoint
  it('GET / should return hello message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Hello from TypeScript Express!' });
  });

  // Login endpoint
  it('POST /login should authenticate valid user', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('role', 'ADMIN');
  });

  it('POST /login should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid credentials' });
  });

  // Tasks endpoint
  it('GET /tasks should return tasks list', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Create task
  it('POST /createtask should create a new task', async () => {
    const newTask = {
      id: 99999,
      title: 'Test Task',
      description: 'Testing task creation',
      priority: 'High',
      taskStatus: 'Todo',
    };

    const res = await request(app).post('/createtask').send(newTask);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newTask);
  });

  it('POST /createtask should reject duplicate task id', async () => {
    const duplicateTask = {
      id: 99999,
      title: 'Duplicate Task',
      priority: 'Low',
      taskStatus: 'Todo',
    };

    const res = await request(app).post('/createtask').send(duplicateTask);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'Task with taskid already existed. Try with unique task id',
    });
  });

  // Update task
  it('POST /updatetask should update existing task', async () => {
    const updatedTask = {
      id: 99999,
      title: 'Updated Task',
      description: 'Updated description',
      priority: 'Medium',
      taskStatus: 'In Progress',
    };

    const res = await request(app).post('/updatetask').send(updatedTask);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(updatedTask);
  });

  // Delete task (requires admin token)
  it('DELETE /task/delete/:id should delete task with admin role', async () => {
    // First login as admin
    const loginRes = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'admin123' });

    const token = loginRes.body.token;

    const res = await request(app)
      .delete('/task/delete/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.text).toBe('Success');
  });
});