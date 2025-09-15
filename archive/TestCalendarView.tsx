import React from 'react';

interface TestCalendarViewProps {
  showEvents: any[];
  reservations: any[];
  waitingList: any[];
  onAddShow: any;
  onAddReservation: any;
  onDeleteReservation: any;
  onDeleteWaitingList: any;
  config: any;
  guestCountMap: any;
  onBulkDelete: any;
  onDeleteShow: any;
  onToggleShowStatus: any;
  onToggleCheckIn: any;
  onEditReservation: any;
  onUpdateReservation: any;
}

const TestCalendarView: React.FC<TestCalendarViewProps> = (props) => {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', border: '2px solid red' }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>🎭 TEST CALENDAR VIEW</h1>
      <p>Als je dit ziet, dan wordt de component wel gerenderd!</p>
      <p>Shows: {props.showEvents?.length || 0}</p>
      <p>Reservations: {props.reservations?.length || 0}</p>
      <p>Waiting list: {props.waitingList?.length || 0}</p>
    </div>
  );
};

export default TestCalendarView;