// src/components/dashboard/KpiCard.tsx
import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    direction: 'positive' | 'negative' | 'neutral';
  };
  onClick?: () => void;
  gridArea: string;
}

const TrendIcon: React.FC<{ direction: 'positive' | 'negative' | 'neutral' }> = ({ direction }) => {
  if (direction === 'positive') return <span className="kpi-trend-icon">▲</span>;
  if (direction === 'negative') return <span className="kpi-trend-icon">▼</span>;
  return null;
};

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, onClick, gridArea }) => {
  const trendClass = trend ? (trend.direction === 'positive' ? 'positive' : 'negative') : '';

  return (
    <div className={`kpi-card ${gridArea}`} onClick={onClick}>
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-value">{value}</div>
      {trend ? (
        <div className={`kpi-trend ${trendClass}`}>
          <TrendIcon direction={trend.direction} /> {trend.value}
        </div>
      ) : (
        <div className="kpi-trend">&nbsp;</div> // Placeholder for alignment
      )}
    </div>
  );
};
