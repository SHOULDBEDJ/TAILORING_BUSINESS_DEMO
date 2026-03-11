import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, Filter, RefreshCw, Menu, LayoutList, LayoutGrid } from 'lucide-react';
import api from '../api/axios';

function StatusBadge({ status }) {
    const cls = { Pending: 'badge badge-pending', Ready: 'badge badge-ready', Delivered: 'badge badge-delivered' }[status] || 'badge';
    return <span className={cls}>{status}</span>;
}

function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_OPTIONS = ['All', 'Pending', 'Ready', 'Delivered'];

export default function OrderHistory({ onMenuClick }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [viewMode, setViewMode] = useState(() => window.innerWidth < 768 ? 'card' : 'table');

    // Keep viewMode in sync with screen size changes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setViewMode('card');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    function fetchOrders() {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter !== 'All') params.set('status', statusFilter);
        if (dateFilter) params.set('date', dateFilter);
        if (search) params.set('search', search);
        api.get(`/orders?${params}`)
            .then(r => setOrders(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }

    useEffect(() => { fetchOrders(); }, [statusFilter, dateFilter]);

    async function handleStatusChange(orderId, newStatus) {
        setUpdatingId(orderId);
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
        } catch { /* silent */ } finally {
            setUpdatingId(null);
        }
    }

    const filtered = orders.filter(o => {
        if (!search) return true;
        return o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            o.phone_number.includes(search);
    });

    const handleWhatsAppReview = (order) => {
        let phoneForUrl = order.phone_number.replace(/\D/g, '');
        if (phoneForUrl.length === 10) {
            phoneForUrl = '91' + phoneForUrl;
        }
        const msg = encodeURIComponent(
            `Dear ${order.customer_name},\n\n` +
            `Thank you for choosing Demo Ladies Tailor! We hope you are satisfied with our stitching.\n\n` +
            `We would love to hear your feedback. Your review helps us improve and also supports our small business.\n\n` +
            `If you have a moment, please leave us a review on Google:\n` +
            `https://g.co/kgs/LUPXvNh\n\n` +
            `Thank you for your support!\n` +
            `– Demo Ladies Tailor`
        );
        window.open(`https://wa.me/${phoneForUrl}?text=${msg}`, '_blank');
    };

    return (
        <div>
            <div className="topbar flex-between">
                <div className="flex">
                    <button className="mobile-menu-btn" onClick={onMenuClick}>
                        <Menu size={22} />
                    </button>
                    <div>
                        <div className="topbar-title">Order History</div>
                        <div className="topbar-subtitle">{filtered.length} order(s) found</div>
                    </div>
                </div>
                <div className="flex gap-8">
                    {/* View Toggle */}
                    <div className="view-toggle">
                        <button
                            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Table View"
                        >
                            <LayoutList size={15} />
                            <span className="hide-mobile">Table</span>
                        </button>
                        <button
                            className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                            onClick={() => setViewMode('card')}
                            title="Card View"
                        >
                            <LayoutGrid size={15} />
                            <span className="hide-mobile">Cards</span>
                        </button>
                    </div>
                    <button className="btn btn-ghost" onClick={fetchOrders}>
                        <RefreshCw size={15} /> <span className="hide-mobile">Refresh</span>
                    </button>
                </div>
            </div>

            <div className="page-container">
                {/* Filters */}
                <div className="card mb-20">
                    <div className="card-body filter-card-body" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2, minWidth: 200 }}>
                            <label className="form-label"><Search size={12} style={{ marginRight: 4 }} />Search</label>
                            <input
                                className="form-input"
                                placeholder="Customer name or phone..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && fetchOrders()}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: 140 }}>
                            <label className="form-label"><Filter size={12} style={{ marginRight: 4 }} />Status</label>
                            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                            <label className="form-label">Delivery Date</label>
                            <input
                                className="form-input"
                                type="date"
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={fetchOrders}>Apply</button>
                        <button className="btn btn-ghost" onClick={() => { setSearch(''); setStatusFilter('All'); setDateFilter(''); }}>Clear</button>
                    </div>
                </div>

                {/* Status filter tabs */}
                <div className="flex gap-8 mb-16 status-tabs" style={{ flexWrap: 'wrap' }}>
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s}
                            className={`btn btn-sm ${statusFilter === s ? 'btn-maroon' : 'btn-ghost'}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="card">
                    {loading ? (
                        <div className="spinner" />
                    ) : viewMode === 'table' ? (
                        /* ── Table View ── */
                        <div className="table-container" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Customer</th>
                                        <th>Phone</th>
                                        <th>Booking</th>
                                        <th>Delivery</th>
                                        <th>Total</th>
                                        <th>Advance</th>
                                        <th>Balance</th>
                                        <th>Status</th>
                                        <th>Bill</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--gray)' }}>
                                                No orders found
                                            </td>
                                        </tr>
                                    )}
                                    {filtered.map(o => (
                                        <tr key={o.order_id}>
                                            <td>
                                                <span style={{ fontWeight: 700, color: 'var(--maroon)' }}>#{String(o.order_id).padStart(4, '0')}</span>
                                            </td>
                                            <td>
                                                <Link to={`/customer/${o.customer_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                    <strong>{o.customer_name}</strong>
                                                </Link>
                                            </td>
                                            <td style={{ fontSize: 12 }}>{o.phone_number}</td>
                                            <td style={{ fontSize: 12 }}>{formatDate(o.booking_date)}</td>
                                            <td style={{ fontSize: 12, color: new Date(o.delivery_date) < new Date() && o.status !== 'Delivered' ? '#E65100' : 'inherit' }}>
                                                {formatDate(o.delivery_date)}
                                            </td>
                                            <td><strong>{`\u20b9${parseFloat(o.total_amount).toLocaleString('en-IN')}`}</strong></td>
                                            <td style={{ color: '#2E7D32', fontSize: 13 }}>{`\u20b9${parseFloat(o.advance_paid).toLocaleString('en-IN')}`}</td>
                                            <td style={{ color: parseFloat(o.balance_amount) > 0 ? '#E65100' : '#2E7D32', fontWeight: 600, fontSize: 13 }}>
                                                {`\u20b9${parseFloat(o.balance_amount).toLocaleString('en-IN')}`}
                                            </td>
                                            <td>
                                                <select
                                                    className="form-select"
                                                    style={{ padding: '4px 8px', fontSize: 12, width: 110 }}
                                                    value={o.status}
                                                    disabled={updatingId === o.order_id}
                                                    onChange={e => handleStatusChange(o.order_id, e.target.value)}
                                                >
                                                    <option>Pending</option>
                                                    <option>Ready</option>
                                                    <option>Delivered</option>
                                                </select>
                                            </td>
                                            <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <Link to={`/bill/${o.order_id}`} className="btn btn-sm btn-outline">
                                                    <Eye size={12} /> Bill
                                                </Link>
                                                {o.status === 'Delivered' && (
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        style={{ borderColor: '#2E7D32', color: '#2E7D32', padding: '4px 8px' }}
                                                        onClick={(e) => { e.stopPropagation(); handleWhatsAppReview(o); }}
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* ── Card View ── */
                        filtered.length === 0 ? (
                            <div className="empty-state">No orders found</div>
                        ) : (
                            <div className="order-cards-grid">
                                {filtered.map(o => {
                                    const isOverdue = new Date(o.delivery_date) < new Date() && o.status !== 'Delivered';
                                    const balanceAmt = parseFloat(o.balance_amount);
                                    return (
                                        <div key={o.order_id} className="order-card">
                                            <div className="order-card-header">
                                                <span className="order-card-id">#{String(o.order_id).padStart(4, '0')}</span>
                                                <StatusBadge status={o.status} />
                                            </div>
                                            <div className="order-card-body">
                                                <div className="order-card-row">
                                                    <span className="order-card-label">Customer</span>
                                                    <Link to={`/customer/${o.customer_id}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>
                                                        {o.customer_name}
                                                    </Link>
                                                </div>
                                                <div className="order-card-row">
                                                    <span className="order-card-label">Phone</span>
                                                    <a href={`tel:${o.phone_number}`} style={{ color: 'var(--charcoal)', textDecoration: 'none' }}>{o.phone_number}</a>
                                                </div>
                                                <div className="order-card-row">
                                                    <span className="order-card-label">Booking</span>
                                                    <span>{formatDate(o.booking_date)}</span>
                                                </div>
                                                <div className="order-card-row">
                                                    <span className="order-card-label">Delivery</span>
                                                    <span style={{ color: isOverdue ? '#E65100' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                                                        {formatDate(o.delivery_date)}
                                                        {isOverdue && ' ⚠'}
                                                    </span>
                                                </div>
                                                <div className="order-card-row">
                                                    <span className="order-card-label">Total</span>
                                                    <strong>{`\u20b9${parseFloat(o.total_amount).toLocaleString('en-IN')}`}</strong>
                                                </div>
                                                <div className="order-card-row">
                                                    <span className="order-card-label">Advance</span>
                                                    <span style={{ color: '#2E7D32' }}>{`\u20b9${parseFloat(o.advance_paid).toLocaleString('en-IN')}`}</span>
                                                </div>
                                                <div className="order-card-row">
                                                    <span className="order-card-label">Balance</span>
                                                    <strong style={{ color: balanceAmt > 0 ? '#E65100' : '#2E7D32' }}>
                                                        {`\u20b9${balanceAmt.toLocaleString('en-IN')}`}
                                                    </strong>
                                                </div>
                                                <div className="order-card-row">
                                                    <span className="order-card-label">Change Status</span>
                                                    <select
                                                        className="form-select"
                                                        style={{ padding: '4px 8px', fontSize: 12, width: 115 }}
                                                        value={o.status}
                                                        disabled={updatingId === o.order_id}
                                                        onChange={e => handleStatusChange(o.order_id, e.target.value)}
                                                    >
                                                        <option>Pending</option>
                                                        <option>Ready</option>
                                                        <option>Delivered</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="order-card-footer">
                                                <Link to={`/bill/${o.order_id}`} className="btn btn-sm btn-outline">
                                                    <Eye size={12} /> Bill
                                                </Link>
                                                {o.status === 'Delivered' && (
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
                                                        onClick={() => handleWhatsAppReview(o)}
                                                    >
                                                        Review
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
