import React from 'react';

export default function ActivityCard({ card, onSelectCard, buttonLabel = 'Mulai Latihan →' }) {
    return (
        <div className={`activity-card card-${card.theme}`} onClick={onSelectCard}>
            <div>
                <div className="card-top">
                    <span className="card-icon">{card.icon}</span>
                    <span className={`card-badge ${card.badgeStyle || ''}`}>{card.badge}</span>
                </div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-desc">{card.desc}</p>
            </div>

            <div className="card-footer">
                <span>{card.level}</span>
                <button className={`play-btn ${card.btnStyle || ''}`}>{buttonLabel}</button>
            </div>
        </div>
    );
}
