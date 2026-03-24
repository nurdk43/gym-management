import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiDollarSign, FiCalendar } from 'react-icons/fi';

const Reports = () => {
    const [tab, setTab] = useState('revenue');
    const [revenue, setRevenue] = useState({ totalRevenue: 0, payments: [], count: 0 });
    const [attendance, setAttendance] = useState({ attendance: [], count: 0 });
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [loading, setLoading] = useState(true);

    const fetchRevenue = async () => {
        try {
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;
            const res = await api.get('/admin/reports/revenue', { params });
            setRevenue(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchAttendance = async () => {
        try {
            const params = {};
            if (dateRange.startDate) params.startDate = dateRange.startDate;
            if (dateRange.endDate) params.endDate = dateRange.endDate;
            const res = await api.get('/admin/reports/attendance', { params });
            setAttendance(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchRevenue(), fetchAttendance()]);
            setLoading(false);
        };
        load();
    }, [dateRange]);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Raporlar</h1>
                    <p>Gelir ve devam raporlarını görüntüleyin</p>
                </div>
            </div>

            <div className="action-bar">
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={`btn ${tab === 'revenue' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('revenue')}><FiDollarSign /> Gelir Raporu</button>
                    <button className={`btn ${tab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('attendance')}><FiCalendar /> Devam Raporu</button>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                    <input type="date" className="form-control" style={{ width: 'auto' }} value={dateRange.startDate} onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })} />
                    <input type="date" className="form-control" style={{ width: 'auto' }} value={dateRange.endDate} onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })} />
                </div>
            </div>

            {tab === 'revenue' && (
                <div>
                    <div className="stats-grid" style={{ marginBottom: '24px' }}>
                        <div className="stat-card">
                            <div className="stat-icon yellow"><FiDollarSign /></div>
                            <div className="stat-info">
                                <h3>₺{revenue.totalRevenue?.toLocaleString()}</h3>
                                <p>Toplam Gelir</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue"><FiCalendar /></div>
                            <div className="stat-info">
                                <h3>{revenue.count}</h3>
                                <p>Toplam İşlem</p>
                            </div>
                        </div>
                    </div>

                    {/* Paket Dağılımı - Görsel Özet */}
                    {revenue.distribution && Object.keys(revenue.distribution).length > 0 && (
                        <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Paket Bazlı Gelir Dağılımı</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Object.entries(revenue.distribution).map(([name, amount]) => {
                                    const percentage = (amount / revenue.totalRevenue) * 100;
                                    return (
                                        <div key={name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                                                <span>{name}</span>
                                                <span style={{ fontWeight: 600 }}>₺{amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${percentage}%`,
                                                    background: 'linear-gradient(90deg, #ffd700, #ffae00)',
                                                    borderRadius: '4px',
                                                    transition: 'width 1s ease-in-out'
                                                }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>Üye</th><th>Paket</th><th>Tutar</th><th>Yöntem</th><th>Tarih</th></tr>
                            </thead>
                            <tbody>
                                {revenue.payments?.map(p => (
                                    <tr key={p._id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.user?.name}</td>
                                        <td>{p.enrollment?.package?.name || '-'}</td>
                                        <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>₺{p.amount?.toLocaleString()}</span></td>
                                        <td><span className="badge badge-info">{p.method === 'cash' ? 'Nakit' : p.method === 'card' ? 'Kart' : 'Havale'}</span></td>
                                        <td>{new Date(p.paidAt).toLocaleDateString('tr-TR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {revenue.payments?.length === 0 && <div className="empty-state"><p>Ödeme kaydı bulunamadı</p></div>}
                    </div>
                </div>
            )}

            {tab === 'attendance' && (
                <div>
                    {/* Antrenör Popülerliği - Görsel Özet */}
                    {attendance.distribution && Object.keys(attendance.distribution).length > 0 && (
                        <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
                            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Antrenör Bazlı Ders Yoğunluğu</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                {Object.entries(attendance.distribution).map(([name, count]) => {
                                    const percentage = (count / attendance.count) * 100;
                                    return (
                                        <div key={name} className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{name}</p>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                <h4 style={{ fontSize: '1.5rem', margin: 0 }}>{count}</h4>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>kayıt</span>
                                            </div>
                                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${percentage}%`,
                                                    background: 'var(--primary)',
                                                    borderRadius: '2px'
                                                }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>Üye</th><th>Antrenör</th><th>Tarih</th><th>Giriş</th><th>Çıkış</th></tr>
                            </thead>
                            <tbody>
                                {attendance.attendance?.map(a => (
                                    <tr key={a._id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.user?.name}</td>
                                        <td>{a.trainer?.name || '-'}</td>
                                        <td>{new Date(a.date).toLocaleDateString('tr-TR')}</td>
                                        <td>{new Date(a.checkIn).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : <span className="badge badge-warning">Devam ediyor</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {attendance.attendance?.length === 0 && <div className="empty-state"><p>Devam kaydı bulunamadı</p></div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
