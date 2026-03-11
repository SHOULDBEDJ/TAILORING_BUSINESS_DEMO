import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Phone, User, ShoppingBag, Plus, Eye, Ruler, Edit2, Check, X, Menu } from 'lucide-react';
import api from '../api/axios';

const MEASUREMENT_LABELS = {
    m_length: 'Length', shoulder: 'Shoulder', chest: 'Chest', waist: 'Waist',
    dot: 'Dot', back_neck: 'Back Neck', front_neck: 'Front Neck',
    sleeves_length: 'Sleeves Length', armhole: 'Armhole',
    chest_distance: 'Chest Distance', sleeves_round: 'Sleeves Round',
};

function StatusBadge({ status }) {
    const cls = { Pending: 'badge badge-pending', Ready: 'badge badge-ready', Delivered: 'badge badge-delivered' }[status] || 'badge';
    return <span className={cls}>{status}</span>;
}

function formatDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CustomerSearch({ onMenuClick }) {
    const { id } = useParams();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const isMobile = window.innerWidth < 768;

    useEffect(() => {
        if (id) {
            handleSelectById(id);
        }
    }, [id]);

    async function handleSelectById(cid) {
        setLoading(true);
        try {
            const res = await api.get(`/customers/${cid}`);
            setSelected(res.data);
            setSearched(true);
        } catch {
            setSelected(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleSearch(e) {
        e && e.preventDefault();
        setLoading(true);
        setSelected(null);
        setSearched(true);
        try {
            const param = /^\d+$/.test(query) ? `phone=${query}` : `name=${query}`;
            const res = await api.get(`/customers/search?${param}`);
            setResults(res.data || []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    async function handleSelect(customer) {
        setIsEditing(false);
        try {
            const res = await api.get(`/customers/${customer.id}`);
            setSelected(res.data);
        } catch {
            setSelected(customer);
        }
    }

    function handleStartEdit() {
        setEditForm({
            m_length: selected.m_length, shoulder: selected.shoulder, chest: selected.chest,
            waist: selected.waist, dot: selected.dot, back_neck: selected.back_neck,
            front_neck: selected.front_neck, sleeves_length: selected.sleeves_length,
            armhole: selected.armhole, chest_distance: selected.chest_distance,
            sleeves_round: selected.sleeves_round
        });
        setIsEditing(true);
    }

    function handleCancelEdit() {
        setIsEditing(false);
        setEditForm({});
    }

    async function handleSaveEdit() {
        setLoading(true);
        try {
            await api.put(`/customers/${selected.id}/measurements`, editForm);
            const res = await api.get(`/customers/${selected.id}`);
            setSelected(res.data);
            setIsEditing(false);
            setEditForm({});
        } catch (err) {
            console.error('Failed to save measurements:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="topbar flex-between">
                <div className="flex">
                    <button className="mobile-menu-btn" onClick={onMenuClick}>
                        <Menu size={22} />
                    </button>
                    <div>
                        <div className="topbar-title">Customer Search</div>
                        <div className="topbar-subtitle">Find or view customer profile</div>
                    </div>
                </div>
                <Link to="/new-order" className="btn btn-primary"><Plus size={16} /> <span className="hide-mobile">New Order</span></Link>
            </div>

            <div className="page-container">
                {/* Search Box */}
                <div className="card mb-24">
                    <div className="card-body">
                        <form onSubmit={handleSearch}>
                            <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
                                <div className="input-prefix" style={{ flex: 1, minWidth: 200 }}>
                                    <span className="prefix-symbol"><Search size={15} /></span>
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder="Enter phone number or customer name..."
                                        autoFocus
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={!query || loading}>
                                    {loading ? 'Searching…' : 'Search'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Results List */}
                {searched && !selected && (
                    <div className="card mb-24">
                        <div className="card-header">
                            <h3 className="card-title">
                                {results.length > 0 ? `${results.length} customer(s) found` : 'No results found'}
                            </h3>
                        </div>
                        {results.length === 0 ? (
                            <div className="empty-state">
                                <User size={40} />
                                <p>No customer found matching "{query}"</p>
                                <Link to="/new-order" className="btn btn-primary mt-16">
                                    <Plus size={16} /> Create New Order
                                </Link>
                            </div>
                        ) : isMobile ? (
                            /* Mobile: card list */
                            <div style={{ padding: '8px 0' }}>
                                {results.map(c => (
                                    <div key={c.id} onClick={() => handleSelect(c)} style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-light)', cursor: 'pointer' }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                                            <User size={13} style={{ marginRight: 5, color: 'var(--gold)' }} />
                                            {c.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 8 }}>
                                            <Phone size={12} style={{ marginRight: 4 }} />{c.phone_number}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 11, color: 'var(--gray)' }}>Since {formatDate(c.created_at)}</span>
                                            <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); handleSelect(c); }}>
                                                <Eye size={12} /> View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Desktop: table */
                            <div className="table-container" style={{ border: 'none' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Customer Name</th>
                                            <th>Phone</th>
                                            <th>Member Since</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map(c => (
                                            <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => handleSelect(c)}>
                                                <td><strong><User size={13} style={{ marginRight: 6, color: 'var(--gold)' }} />{c.name}</strong></td>
                                                <td><Phone size={12} style={{ marginRight: 4 }} />{c.phone_number}</td>
                                                <td style={{ fontSize: 12 }}>{formatDate(c.created_at)}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); handleSelect(c); }}>
                                                        <Eye size={12} /> View Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Customer Profile */}
                {selected && (
                    <div>
                        <button className="btn btn-ghost mb-16" onClick={() => setSelected(null)}>
                            ← Back to results
                        </button>

                        {/* grid-2 collapses on mobile via CSS */}
                        <div className="grid-2 gap-16 mb-24">
                            {/* Info card */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title flex gap-8"><User size={18} color="var(--gold)" /> Customer Info</h3>
                                    <Link to="/new-order" className="btn btn-sm btn-primary"><Plus size={13} /> New Order</Link>
                                </div>
                                <div className="card-body">
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: 22, fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--maroon-dark)' }}>
                                            {selected.name}
                                        </div>
                                        <div className="flex gap-8 mt-4" style={{ color: 'var(--gray)', fontSize: 13 }}>
                                            <Phone size={14} />
                                            <a href={`tel:${selected.phone_number}`} style={{ color: 'var(--gray)', textDecoration: 'none' }}>{selected.phone_number}</a>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--gray)', marginTop: 6 }}>
                                            Customer since {formatDate(selected.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Measurements card */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title flex gap-8"><Ruler size={18} color="var(--gold)" /> Measurements</h3>
                                    {!isEditing ? (
                                        <button className="btn btn-sm btn-outline" onClick={handleStartEdit} title="Edit Measurements">
                                            <Edit2 size={13} /> Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-8">
                                            <button className="btn btn-sm btn-ghost" onClick={handleCancelEdit} style={{ color: 'var(--maroon)' }}>
                                                <X size={14} /> Cancel
                                            </button>
                                            <button className="btn btn-sm btn-primary" onClick={handleSaveEdit} disabled={loading}>
                                                <Check size={14} /> {loading ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="card-body">
                                    {(isEditing || Object.keys(MEASUREMENT_LABELS).some(k => selected[k] != null)) ? (
                                        <div className="grid-2" style={{ gap: 10 }}>
                                            {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => (
                                                <div key={key} className="flex-between" style={{ padding: '4px 8px', background: 'var(--ivory)', borderRadius: 6 }}>
                                                    <span style={{ fontSize: 12, color: 'var(--gray)' }}>{label}</span>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={editForm[key] || ''}
                                                            onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                                                            style={{
                                                                width: 70, height: 24, fontSize: 13,
                                                                border: '1px solid var(--gold-pale)', borderRadius: 4,
                                                                padding: '0 4px', background: 'white'
                                                            }}
                                                        />
                                                    ) : (
                                                        <strong style={{ fontSize: 13 }}>{selected[key] != null ? `${selected[key]}"` : '-'}</strong>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-state" style={{ padding: '16px 0' }}>
                                            No measurements recorded yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order history — horizontal scroll on mobile */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title flex gap-8"><ShoppingBag size={18} color="var(--gold)" /> Order History</h3>
                                <span className="badge" style={{ background: 'var(--blush)', color: 'var(--maroon)', border: '1px solid var(--gold-pale)' }}>
                                    {selected.orders?.length || 0} orders
                                </span>
                            </div>
                            {!selected.orders?.length ? (
                                <div className="empty-state">No orders found for this customer.</div>
                            ) : isMobile ? (
                                /* Mobile: mini cards */
                                <div>
                                    {selected.orders.map(o => (
                                        <div key={o.order_id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-light)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <span style={{ fontWeight: 700, color: 'var(--maroon)' }}>#{String(o.order_id).padStart(4, '0')}</span>
                                                <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 12, color: 'var(--gray)', marginBottom: 8 }}>
                                                <span>Booking: <strong style={{ color: 'var(--charcoal)' }}>{formatDate(o.booking_date)}</strong></span>
                                                <span>Delivery: <strong style={{ color: 'var(--charcoal)' }}>{formatDate(o.delivery_date)}</strong></span>
                                                <span>Total: <strong style={{ color: 'var(--charcoal)' }}>{`\u20b9${parseFloat(o.total_amount).toLocaleString('en-IN')}`}</strong></span>
                                                <span>Balance: <strong style={{ color: parseFloat(o.balance_amount) > 0 ? '#E65100' : '#2E7D32' }}>{`\u20b9${parseFloat(o.balance_amount).toLocaleString('en-IN')}`}</strong></span>
                                            </div>
                                            <Link to={`/bill/${o.order_id}`} className="btn btn-sm btn-outline">
                                                <Eye size={12} /> Bill
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="table-container" style={{ border: 'none' }}>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th><th>Booking</th><th>Delivery</th>
                                                <th>Amount</th><th>Advance</th><th>Balance</th><th>Status</th><th>Bill</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selected.orders.map(o => (
                                                <tr key={o.order_id}>
                                                    <td><span style={{ fontWeight: 600, color: 'var(--maroon)' }}>#{String(o.order_id).padStart(4, '0')}</span></td>
                                                    <td style={{ fontSize: 12 }}>{formatDate(o.booking_date)}</td>
                                                    <td style={{ fontSize: 12 }}>{formatDate(o.delivery_date)}</td>
                                                    <td><strong>{`\u20b9${parseFloat(o.total_amount).toLocaleString('en-IN')}`}</strong></td>
                                                    <td style={{ color: '#2E7D32' }}>{`\u20b9${parseFloat(o.advance_paid).toLocaleString('en-IN')}`}</td>
                                                    <td style={{ color: parseFloat(o.balance_amount) > 0 ? '#E65100' : '#2E7D32', fontWeight: 600 }}>
                                                        {`\u20b9${parseFloat(o.balance_amount).toLocaleString('en-IN')}`}
                                                    </td>
                                                    <td><span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span></td>
                                                    <td>
                                                        <Link to={`/bill/${o.order_id}`} className="btn btn-sm btn-outline">
                                                            <Eye size={12} /> Bill
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
