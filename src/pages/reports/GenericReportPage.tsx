// src/pages/reports/GenericReportPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom'; // Assuming you use React Router

const GenericReportPage: React.FC = () => {
  const { reportName } = useParams<{ reportName: string }>();

  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h1>Rapport: {reportName}</h1>
      <p>Deze pagina zal de gedetailleerde rapportage voor '{reportName}' bevatten.</p>
      {/* Hier komt de daadwerkelijke rapportage data en visualisatie */}
    </div>
  );
};

export default GenericReportPage;
