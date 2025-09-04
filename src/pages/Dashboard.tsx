import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BuyerDashboard } from './BuyerDashboard';
import { DeveloperDashboard } from './DeveloperDashboard';

interface DashboardProps {
  isDarkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ isDarkMode }) => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user type
  if (user?.userType === 'buyer') {
    return <BuyerDashboard isDarkMode={isDarkMode} />;
  } else if (user?.userType === 'developer') {
    return <DeveloperDashboard isDarkMode={isDarkMode} />;
  }

  // Fallback for unknown user types
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Unknown User Type</h2>
        <p className="text-gray-600">Please contact support.</p>
      </div>
    </div>
  );
};
