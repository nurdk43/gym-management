const StatsCard = ({ icon, value, label, color = 'purple', delay = 0 }) => {
    return (
        <div className={`stat-card animate-slide-up`} style={{ animationDelay: `${delay}s` }}>
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info">
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </div>
    );
};

export default StatsCard;
