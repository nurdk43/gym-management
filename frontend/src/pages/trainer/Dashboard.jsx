import { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatsCard from '../../components/StatsCard';
import { FiCalendar, FiUsers, FiCheckSquare, FiActivity } from 'react-icons/fi';

const TrainerDashboard = () => {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try { const res = await api.get('/trainer/stats'); setStats(res.data); } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

    return (
        <div className="animate-fade-in">
            <div className="page-header"><div><h1>Dashboard</h1><p>Antrenör panelinize hoş geldiniz</p></div></div>
            <div className="stats-grid">
                <StatsCard icon={<FiCalendar />} value={stats.totalPrograms || 0} label="Toplam Program" color="purple" delay={0.1} />
                <StatsCard icon={<FiActivity />} value={stats.activePrograms || 0} label="Aktif Program" color="green" delay={0.2} />
                <StatsCard icon={<FiCheckSquare />} value={stats.todayAttendance || 0} label="Bugünkü Katılım" color="blue" delay={0.3} />
                <StatsCard icon={<FiUsers />} value={stats.totalMembers || 0} label="Toplam Üye" color="yellow" delay={0.4} />
            </div>
            <div className="stats-grid">
                <div className="glass-card animate-slide-up stagger-3">
                    <h3 className="section-title">🎯 Hızlı İşlemler</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a href="/trainer/programs" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Program Oluştur</a>
                        <a href="/trainer/attendance" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Devam Takibi</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
