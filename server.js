require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost/acme_hr_directory'
});

app.use(cors());
app.use(express.json());

app.get('/api/employees', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM employees');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

app.get('/api/departments', async (req, res, next) => {
    try {
       const result = await pool.query('SELECT * FROM departments');
       res.json(result.rows);
    } catch (err) {
        next(err)
        }
    });

app.post('/api/employees', async (req, res, next) => {
    try {
        const { name, department_id } = req.body;
        const result = await pool.query
        ('INSERT INTO employees (name, department_id) VALUES ($1, $2) RETURNING *',
        [name, department_id]
    );
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

app.delete('/api/employees/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM employees WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});

app.put('/api/employees/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, department_id } = req.body;
        const result = await pool.query(
            'UPDATE employees SET name = $1, department_id = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
           [name, department_id, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        next(err)
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});