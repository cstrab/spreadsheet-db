import React from 'react';
import '../../styles/styles.css';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay" data-testid="loading-overlay">
      <div className="loading-spinner" data-testid="loading-spinner"></div>
    </div>
  );
};

export default LoadingOverlay;
