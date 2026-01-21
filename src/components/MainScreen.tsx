import React from 'react';

interface MainScreenProps {
  onStart: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ onStart }) => {
  const handleExit = () => {
    window.close();
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#f0f2f5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navigation */}
      <div style={{
        height: '64px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#3b4f6b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            📄
          </div>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Photo Sheet Generator
            </div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              Vantage Solutions
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleExit}
          style={{ fontSize: '14px', padding: '8px 24px' }}
        >
          Exit
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {/* Card Header */}
          <div style={{
            background: '#3b4f6b',
            padding: '24px 32px',
            color: 'white'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Welcome to Photo Sheet Generator
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#d1d5db'
            }}>
              Create professional documentation for insurance surveys
            </p>
          </div>

          {/* Card Content */}
          <div style={{
            padding: '40px 32px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              marginBottom: '32px'
            }}>
              {/* Motor Survey */}
              <div style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1e40af';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(30, 64, 175, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  🚗
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  Motor Survey
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  Vehicle damage assessment and documentation
                </p>
              </div>

              {/* Non-Motor Survey */}
              <div style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1e40af';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(30, 64, 175, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  🏠
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  Property Survey
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  Property and asset damage documentation
                </p>
              </div>
            </div>

            {/* Features List */}
            <div style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Key Features
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                {[
                  'Multiple layout configurations',
                  'Image annotation tools',
                  'Batch photo processing',
                  'PDF and JPG export',
                  'Custom watermarks',
                  'EXIF data extraction'
                ].map((feature, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      background: '#1e40af',
                      borderRadius: '50%'
                    }} />
                    <span style={{
                      fontSize: '14px',
                      color: '#374151'
                    }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              className="btn btn-primary"
              onClick={onStart}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              Start Creating Photo Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        height: '48px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        color: '#6b7280'
      }}>
        © 2025 Vantage Solutions • Support: 9039061038
      </div>
    </div>
  );
};

export default MainScreen;
