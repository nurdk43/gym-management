import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import { FiShoppingCart, FiBookOpen, FiCreditCard } from 'react-icons/fi';

const MemberDashboard = () => {
    const [stats, setStats] = useState({});
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [statsRes, enrollRes] = await Promise.all([
                    api.get('/member/stats'),
                    api.get('/member/enrollments')
                ]);
                setStats(statsRes.data);
                setEnrollments(enrollRes.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header"><div><h1>Dashboard</h1><p>Üye panelinize hoş geldiniz</p></div></div>
            <div className="stats-grid">
                <StatsCard icon={<FiShoppingCart />} value={stats.activeEnrollments || 0} label="Aktif Üyelik" color="green" delay={0.1} />
                <StatsCard icon={<FiBookOpen />} value={stats.myClasses || 0} label="Kayıtlı Ders" color="blue" delay={0.2} />
                <StatsCard icon={<FiCreditCard />} value={`₺${(stats.totalSpent || 0).toLocaleString()}`} label="Toplam Harcama" color="yellow" delay={0.3} />
            </div>

            <div className="glass-card animate-slide-up stagger-2">
                <h3 className="section-title">📋 Aktif Üyeliklerim</h3>
                {enrollments.filter(e => e.status === 'active').length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {enrollments.filter(e => e.status === 'active').map(e => (
                            <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{e.package?.name}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {new Date(e.startDate).toLocaleDateString('tr-TR')} - {new Date(e.endDate).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                                <span className="badge badge-success">Aktif</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state" style={{ padding: '30px' }}><p>Aktif üyeliğiniz bulunmuyor</p></div>
                )}
            </div>

            <div className="stats-grid" style={{ marginTop: '24px' }}>
                <div className="glass-card animate-slide-up stagger-3">
                    <h3 className="section-title">🎯 Hızlı İşlemler</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a href="/member/packages" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Paket Satın Al</a>
                        <a href="/member/classes" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Derslerimi Görüntüle</a>
                        <a href="/member/payments" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Ödeme Geçmişi</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
