import { useState, useEffect } from 'react';
import api from '../../api/axios';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try { const res = await api.get('/member/payments'); setPayments(res.data); } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    const totalSpent = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header"><div><h1>Ödeme Geçmişi</h1><p>Tüm ödemelerinizi görüntüleyin</p></div></div>

            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card animate-slide-up">
                    <div className="stat-icon yellow">💰</div>
                    <div className="stat-info"><h3>₺{totalSpent.toLocaleString()}</h3><p>Toplam Harcama</p></div>
                </div>
                <div className="stat-card animate-slide-up stagger-1">
                    <div className="stat-icon blue">📝</div>
                    <div className="stat-info"><h3>{payments.length}</h3><p>Toplam İşlem</p></div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead><tr><th>Paket</th><th>Tutar</th><th>Ödeme Yöntemi</th><th>Tarih</th></tr></thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p._id}>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{p.enrollment?.package?.name || '-'}</td>
                                <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>₺{p.amount?.toLocaleString()}</span></td>
                                <td><span className="badge badge-info">{p.method === 'cash' ? 'Nakit' : p.method === 'card' ? 'Kredi Kartı' : 'Havale'}</span></td>
                                <td>{new Date(p.paidAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && <div className="empty-state"><div className="empty-icon">💳</div><h3>Ödeme kaydı yok</h3><p>Henüz bir ödeme işlemi gerçekleştirmediniz</p></div>}
            </div>
        </div>
    );
};

export default PaymentHistory;
