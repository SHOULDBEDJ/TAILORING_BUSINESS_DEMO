const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/analytics/expenses
router.get('/expenses', async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let query = 'SELECT * FROM expenses WHERE 1=1';
        let args = [];
        if (start_date) { query += ' AND date >= ?'; args.push(start_date); }
        if (end_date) { query += ' AND date <= ?'; args.push(end_date); }
        query += ' ORDER BY date DESC';

        const rs = await db.execute({ sql: query, args });
        res.json(rs.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/analytics/expenses
router.post('/expenses', async (req, res) => {
    try {
        const { date, category, amount, description } = req.body;
        if (!date || !category || amount === undefined) {
            return res.status(400).json({ error: 'date, category, amount required' });
        }
        await db.execute({
            sql: 'INSERT INTO expenses (date, category, amount, description) VALUES (?,?,?,?)',
            args: [date, category, parseFloat(amount), description || '']
        });
        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/analytics/expenses/:id
router.delete('/expenses/:id', async (req, res) => {
    try {
        await db.execute({ sql: 'DELETE FROM expenses WHERE id = ?', args: [req.params.id] });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/analytics/summary
// Returns basic overview of Income vs Expense
router.get('/summary', async (req, res) => {
    try {
        // Simple analytics: total advance_paid (which acts as actual income when collected)
        const incomeRs = await db.execute("SELECT sum(advance_paid) as total_income FROM orders");
        const expenseRs = await db.execute("SELECT sum(amount) as total_expense FROM expenses");

        const total_income = incomeRs.rows[0]?.total_income || 0;
        const total_expense = expenseRs.rows[0]?.total_expense || 0;
        const net_profit = total_income - total_expense;

        res.json({ total_income, total_expense, net_profit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
