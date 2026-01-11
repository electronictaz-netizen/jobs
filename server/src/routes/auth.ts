import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, run } from '../database-factory';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await query('SELECT * FROM drivers WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    
    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint (for creating new drivers/managers)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await run(
      'INSERT INTO drivers (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null]
    );

    const token = jwt.sign(
      { id: result.lastID, email, name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.lastID,
        name,
        email,
        phone
      }
    });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;