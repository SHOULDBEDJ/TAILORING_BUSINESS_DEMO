import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Menu, ChevronDown, ChevronRight, Download, Star, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CATEGORIES = ['Fabric/Material', 'Thread/Accessories', 'Electricity', 'Rent', 'Maintenance', 'Other'];

export default function Analytics({ onMenuClick }) {
    const [summary, setSummary] = useState({
        today_income: 0, today_expense: 0, today_profit: 0,
        monthly_income: 0, monthly_expense: 0, monthly_profit: 0,
        yearly_income: 0, yearly_expense: 0, yearly_profit: 0,
        total_income: 0, total_expense: 0, net_profit: 0
    });
    const [expenses, setExpenses] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expandedSections, setExpandedSections] = useState({
        today: true, month: true, year: true, allTime: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        category: 'Fabric/Material', amount: '', description: ''
    });

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get('/analytics/summary'),
            api.get('/analytics/expenses'),
            api.get('/analytics/top-services'),
            api.get('/analytics/top-customers')
        ]).then(([sumRes, expRes, tsRes, tcRes]) => {
            setSummary(sumRes.data);
            setExpenses(expRes.data);
            setTopServices(tsRes.data);
            setTopCustomers(tcRes.data);
        }).catch(err => {
            toast.error('Failed to load analytics');
            console.error(err);
        }).finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

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

    const handleExport = () => {
        const header = "Date,Category,Amount,Description\n";
        const csv = expenses.map(e => `${new Date(e.date).toLocaleDateString('en-IN')},"${e.category}",${e.amount},"${e.description || ''}"`).join('\n');
        const blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Export successful");
    };

    function StatCard({ label, value, colorClass, icon: Icon }) {
        return (
            <div className={`card ${colorClass} analytics-stat`} style={{ flex: 1, minWidth: 160 }}>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
                    <div style={{ padding: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#fff', flexShrink: 0 }}>
                        <Icon size={22} />
                    </div>
                    <div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500 }}>{label}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>₹{value.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>
        );
    }

    const sectionConfig = [
        { key: 'today', title: 'Today Overview', income: 'today_income', expense: 'today_expense', profit: 'today_profit' },
        { key: 'month', title: 'This Month', income: 'monthly_income', expense: 'monthly_expense', profit: 'monthly_profit' },
        { key: 'year', title: 'This Year', income: 'yearly_income', expense: 'yearly_expense', profit: 'yearly_profit' },
        { key: 'allTime', title: 'All Time', income: 'total_income', expense: 'total_expense', profit: 'net_profit', incomeLabel: 'Total Income', expenseLabel: 'Total Expenses', profitLabel: 'Net Profit' },
    ];

    return (
        <div>
            <div className="topbar flex-between">
                <div className="flex">
                    <button className="mobile-menu-btn" onClick={onMenuClick}>
                        <Menu size={22} />
                    </button>
                    <div>
                        <div className="topbar-title">Analytics</div>
                        <div className="topbar-subtitle">Income &amp; Expense Tracking</div>
                    </div>
                </div>
                <button className="btn btn-outline" onClick={handleExport}>
                    <Download size={16} /> <span className="hide-mobile">Export CSV</span>
                </button>
            </div>

            <div className="page-container">
                {/* Summary Sections */}
                <div style={{ marginBottom: 24 }}>
                    {sectionConfig.map(({ key, title, income, expense, profit, incomeLabel, expenseLabel, profitLabel }) => (
                        <div key={key} style={{ marginBottom: 16 }}>
                            <div
                                className="flex-between"
                                style={{ cursor: 'pointer', padding: '12px 16px', background: 'var(--ivory)', borderRadius: 8, border: '1px solid var(--gray-light)' }}
                                onClick={() => toggleSection(key)}
                            >
                                <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
                                {expandedSections[key] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            {expandedSections[key] && (
                                <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                                    <StatCard label={incomeLabel || 'Income'} value={summary[income] || 0} colorClass="bg-maroon" icon={TrendingUp} />
                                    <StatCard label={expenseLabel || 'Expenses'} value={summary[expense] || 0} colorClass="bg-red" icon={TrendingDown} />
                                    <StatCard label={profitLabel || 'Profit'} value={summary[profit] || 0} colorClass="bg-green" icon={DollarSign} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Top Services & Top Customers — grid-2 collapses on mobile */}
                <div className="grid-2 mb-24">
                    <div className="card">
                        <div className="card-header"><h3 className="card-title flex gap-8"><Star size={18} color="var(--gold)" /> Top Services</h3></div>
                        {topServices.length === 0 ? (
                            <div className="empty-state" style={{ padding: '20px 24px' }}>No data yet</div>
                        ) : (
                            <div>
                                {topServices.map((t, i) => (
                                    <div key={i} style={{ padding: '10px 16px', borderBottom: i < topServices.length - 1 ? '1px solid var(--gray-light)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{t.service_type}</div>
                                            <div style={{ fontSize: 11, color: 'var(--gray)' }}>{t.count} orders</div>
                                        </div>
                                        <strong style={{ color: '#2E7D32' }}>₹{parseFloat(t.revenue).toLocaleString('en-IN')}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div className="card-header"><h3 className="card-title flex gap-8"><Award size={18} color="var(--gold)" /> Top Customers</h3></div>
                        {topCustomers.length === 0 ? (
                            <div className="empty-state" style={{ padding: '20px 24px' }}>No data yet</div>
                        ) : (
                            <div>
                                {topCustomers.map(c => (
                                    <div key={c.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--gray)' }}>{c.phone_number} · {c.order_count} orders</div>
                                        </div>
                                        <strong style={{ color: '#2E7D32' }}>₹{parseFloat(c.total_spent).toLocaleString('en-IN')}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Expense + Expense History — grid-2 collapses on mobile */}
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

                    {/* Expense History */}
                    <div className="card">
                        <div className="card-header"><h3 className="card-title">Recent Expenses</h3></div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {loading ? <div className="spinner" style={{ margin: 20 }} /> : (
                                expenses.length === 0 ? (
                                    <div className="empty-state">No expenses recorded</div>
                                ) : (
                                    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                        {expenses.map(e => (
                                            <div key={e.type === 'stitching' ? `s_${e.id}` : `e_${e.id}`}
                                                style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {e.category || 'Expense'}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--gray)' }}>
                                                        {new Date(e.date).toLocaleDateString('en-IN')}
                                                        {e.description && ` · ${e.description}`}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                    <strong style={{ color: '#d32f2f' }}>₹{parseFloat(e.amount).toLocaleString('en-IN')}</strong>
                                                    {e.type !== 'stitching' && (
                                                        <button type="button" className="btn btn-ghost" style={{ color: 'var(--gray)', padding: 4 }}
                                                            onClick={() => handleDelete(e.id)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
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
