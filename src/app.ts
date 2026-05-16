import express, { type Request, type Response, type NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const port = 8080;
app.use(cors());
app.use(express.json());

const JWT_SECRET = '928d6562f06ee08a2cccb3ca9af179c705ce6e9e60cad49919d87a2583744251'; //Replace with your secrete key

interface Task {
    id: number;
    title: string;
    priority: string;
    taskStatus: string;
    description?: string; // Add the '?' here
}

// In-memory "Database"
const users = [
    { id: 1, username: 'admin', passwordHash: bcrypt.hashSync('admin123', 8), role: 'ADMIN' },
    { id: 2, username: 'user', passwordHash: bcrypt.hashSync('user123', 8), role: 'USER' }
];

let tasksList: Array<Task> = [
    {
        id: 78941,
        title: 'UI Scaffolding: Create UI Login modal',
        description: 'Create UI Interface for logging mechanism. Implement the validation for login form',
        priority: 'Medium',
        taskStatus: 'Todo'
    },
    {
        id: 78942,
        title: 'UI Scaffolding: Create UI Signup modal',
        description: 'Create UI Interface for Signup mechanism. Implement the validation for login form',
        priority: 'Medium',
        taskStatus: 'Todo'
    },
    {
        id: 78943,
        title: 'API: Create login API',
        description: 'Create restful API for logging mechanism.',
        priority: 'Medium',
        taskStatus: 'Todo'
    },
    {
        id: 78944,
        title: 'API: Create signup API',
        description: 'Create restful API for signup mechanism.',
        priority: 'Medium',
        taskStatus: 'Todo'
    },
    {
        id: 78945,
        title: 'API: Authentication and Authorization',
        description: 'Create restful API for authentication and authorization mechanism.',
        priority: 'Medium',
        taskStatus: 'Todo'
    }
];

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Hello from TypeScript Express!' });
});

app.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role, username: user.username });
});

// Middleware for Authorization
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        (req as any).user = user;
        next();
    });
};

const authorizeRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = (req as any).user?.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

app.get('/tasks', (req: Request, res: Response) => {
    res.send(tasksList);
});

app.post('/createtask', (req: Request, res: Response) => {
    const { id, title, description, priority, taskStatus } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const isTaskPresent = tasksList.some((task) => task.id === id)

    if(isTaskPresent) {
        return res.status(400).json({ error: 'Task with taskid already existed. Try with unique task id' });
    }

    const newTask = { id, title, description, priority, taskStatus };
    tasksList.push(newTask);

    res.status(201).json(newTask);
});

app.post('/updatetask', (req: Request, res: Response) => {
    const { id, title, description, priority, taskStatus } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    const newTask = { id, title, description, priority, taskStatus };

    const index = tasksList.findIndex(task => task.id === newTask.id);
    if (index !== -1) {
        tasksList[index] = newTask;
    }

    res.status(201).json(newTask);
});

//Only user with admin role can be able to delete
app.delete('/task/delete/:id', authenticateToken, authorizeRole(['ADMIN']), (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLength = tasksList.length;

    // Filter out the user with the matching ID
    const tasks = tasksList.filter(task => task.id !== parseInt(id as string));

    if (tasks.length === initialLength) {
        return res.status(404).send('User not found');
    }

    tasksList = tasksList.filter(task => task.id !== parseInt(id as string));

    return res.status(200).send('Success');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default app;