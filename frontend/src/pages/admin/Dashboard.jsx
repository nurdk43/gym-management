import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import { FiUsers, FiDollarSign, FiActivity, FiUserCheck } from 'react-icons/fi';

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Spor salonunuzun genel durumu</p>
                </div>
            </div>

            <div className="stats-grid">
                <StatsCard icon={<FiUsers />} value={stats.totalMembers || 0} label="Toplam Üye" color="purple" delay={0.1} />
                <StatsCard icon={<FiUserCheck />} value={stats.totalTrainers || 0} label="Antrenör" color="blue" delay={0.2} />
                <StatsCard icon={<FiActivity />} value={stats.activeEnrollments || 0} label="Aktif Üyelik" color="green" delay={0.3} />
                <StatsCard icon={<FiDollarSign />} value={`₺${(stats.totalRevenue || 0).toLocaleString()}`} label="Toplam Gelir" color="yellow" delay={0.4} />
            </div>

            <div className="stats-grid">
                <div className="glass-card animate-slide-up stagger-2">
                    <h3 className="section-title">📊 Aylık Gelir</h3>
                    <div style={{ fontSize: '36px', fontWeight: '800', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        ₺{(stats.monthlyRevenue || 0).toLocaleString()}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Bu ayki gelir</p>
                </div>
                <div className="glass-card animate-slide-up stagger-3">
                    <h3 className="section-title">🎯 Hızlı İşlemler</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a href="/admin/users" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Kullanıcı Yönetimi</a>
                        <a href="/admin/packages" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Paket Yönetimi</a>
                        <a href="/admin/reports" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Raporları Görüntüle</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
