// ==========================================
// İstatistik Kartı Bileşeni
// Dashboard'larda sayısal verileri gösterir
// ==========================================

const StatsCard = ({ icon, value, label, color = 'mor', delay = 0 }) => {
    return (
        <div className="istat-kart anim-yukari" style={{ animationDelay: `${delay}s` }}>
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="istat-bilgi">
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </div>
    );
};

export default StatsCard;
