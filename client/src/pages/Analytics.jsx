import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CATEGORIES = ['Fabric/Material', 'Thread/Accessories', 'Electricity', 'Rent', 'Maintenance', 'Other'];

export default function Analytics({ onMenuClick }) {
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_profit: 0 });
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Fabric/Material',
        amount: '',
        description: ''
    });

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get('/analytics/summary'),
            api.get('/analytics/expenses')
        ]).then(([sumRes, expRes]) => {
            setSummary(sumRes.data);
            setExpenses(expRes.data);
        }).catch(err => {
            toast.error('Failed to load analytics');
            console.error(err);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await api.post('/analytics/expenses', form);
            toast.success('Expense added successfully');
            setForm({ ...form, amount: '', description: '' });
            fetchData();
        } catch (err) {
            toast.error('Failed to add expense');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;
        try {
            await api.delete(`/analytics/expenses/${id}`);
            toast.success('Expense deleted');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete expense');
        }
    };

    function StatCard({ label, value, colorClass, icon: Icon }) {
        return (
            <div className={`card ${colorClass}`} style={{ flex: 1, minWidth: 200 }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ padding: 12, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500 }}>{label}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>₹{value.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="topbar flex-between">
                <div className="flex">
                    <button className="mobile-menu-btn" onClick={onMenuClick}>
                        <Menu size={22} />
                    </button>
                    <div>
                        <div className="topbar-title">Analytics</div>
                        <div className="topbar-subtitle">Income & Expense Tracking</div>
                    </div>
                </div>
            </div>

            <div className="page-container">
                {/* Summary Cards */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                    <StatCard label="Total Income (Advance/Cleared)" value={summary.total_income} colorClass="bg-maroon" icon={TrendingUp} />
                    <StatCard label="Total Expenses" value={summary.total_expense} colorClass="bg-red" icon={TrendingDown} />
                    <StatCard label="Net Profit" value={summary.net_profit} colorClass="bg-green" icon={DollarSign} />
                </div>

                <div className="grid-2">
                    {/* Add Expense Form */}
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">Add Expense</h3></div>
                        <div className="card-body">
                            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label className="form-label">Date</label>
                                    <input type="date" className="form-input" required
                                        value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Category</label>
                                    <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Amount (₹)</label>
                                    <input type="number" step="0.01" className="form-input" required placeholder="0.00"
                                        value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Description (Optional)</label>
                                    <input type="text" className="form-input" placeholder="e.g., 5m red silk fabric"
                                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                                    <Plus size={16} /> Record Expense
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Expense History List */}
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">Recent Expenses</h3></div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {loading ? <div className="spinner" style={{ margin: 20 }} /> : (
                                <div className="table-container" style={{ border: 'none', maxHeight: 400, overflowY: 'auto' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Category</th>
                                                <th>Amount</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.length === 0 ? (
                                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20 }}>No expenses recorded</td></tr>
                                            ) : expenses.map(e => (
                                                <tr key={e.id}>
                                                    <td style={{ fontSize: 13 }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>{e.category}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--gray)' }}>{e.description}</div>
                                                    </td>
                                                    <td style={{ color: '#d32f2f', fontWeight: 600 }}>₹{parseFloat(e.amount).toLocaleString('en-IN')}</td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button type="button" className="btn btn-ghost" style={{ color: 'var(--gray)' }}
                                                            onClick={() => handleDelete(e.id)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .bg-maroon { background: var(--maroon); border: none; }
                .bg-red { background: #d32f2f; border: none; }
                .bg-green { background: #2e7d32; border: none; }
            `}</style>
        </div>
    );
}
