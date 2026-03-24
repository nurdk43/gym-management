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
            )}
        </div>
    );
};

export default Reports;
