import React from 'react';

// Simple Icon fallback component
const SimpleIcon: React.FC<{ id: string }> = ({ id }) => {
    const iconMap: { [key: string]: string } = {
      'dashboard': '📊',
      'alert-triangle': '⚠️',
      'chevron-right': '→',
      'chart': '📈',
      'activity': '⚡',
      'inbox': '📥',
      'calendar-day': '📅',
      'check': '✓'
    };
    
    return <span style={{ marginRight: '0.5rem' }}>{iconMap[id] || '•'}</span>;
  };

interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
}

interface ActivityFeedProps {
  recentActivity: Activity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ recentActivity }) => {
  return (
    <div className="activity-feed-card" style={{ gridColumn: 'span 2' }}>
      <div className="card-header-premium">
        <SimpleIcon id="activity" />
        <h3>Live Activiteit</h3>
      </div>
      <div className="premium-activity-list">
        {recentActivity.length > 0 ? recentActivity.map(activity => (
          <div key={activity.id} className={`premium-activity-item priority-${activity.priority}`}>
            <div className="activity-icon-container">
              <span className="activity-emoji">{activity.icon}</span>
            </div>
            <div className="activity-content-premium">
              <div className="activity-description">{activity.description}</div>
              <div className="activity-timestamp">{activity.time}</div>
            </div>
          </div>
        )) : (
          <div className="no-activity-premium">
            <SimpleIcon id="inbox" />
            <p>Geen recente activiteit</p>
            <span>Nieuwe boekingen verschijnen hier automatisch</span>
          </div>
        )}
      </div>
    </div>
  );
};
