import React from 'react';

interface MainScreenProps {
  onStart: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ onStart }) => {
  const handleExit = () => {
    window.close();
  };

  return (
    <div className="screen" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        textAlign: 'center',
        marginBottom: '40px',
        lineHeight: '1.5'
      }}>
        Photo Sheet Generator<br />
        By Vantage Solutions
      </h1>

      <div style={{ marginTop: '100px', marginBottom: '100px' }}>
        <button 
          className="btn btn-primary btn-large"
          onClick={onStart}
        >
          Start
        </button>
      </div>

      <div style={{ 
        position: 'fixed', 
        bottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
      }}>
        <button 
          className="btn btn-danger"
          onClick={handleExit}
          style={{ width: '100px' }}
        >
          Exit
        </button>
        <p style={{ color: '#666', fontSize: '12px' }}>
          Copyright @ VantageSolutions.org : 9039061038
        </p>
      </div>
    </div>
  );
};

export default MainScreen;
