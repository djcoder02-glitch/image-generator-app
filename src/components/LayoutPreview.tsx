interface LayoutPreviewProps {
  images: any[];
  layoutType: string;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
  onRotate: (index: number) => void;
}

const LayoutPreview: React.FC<LayoutPreviewProps> = ({ images, layoutType }) => {
  const [, cols] = layoutType.split('x').map(Number);
  const totalSlots = cols * Math.ceil(images.length / cols);

  return (
    <div style={{ marginTop: '24px' }}>
      <h4 style={{ 
        fontSize: '16px',
        fontWeight: '700',
        color: '#2d3748',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        👁️ Layout Preview
      </h4>
      
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        display: 'inline-block',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '2px solid #e2e8f0'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 100px)`,
          gap: '12px',
          padding: '20px',
          background: '#f7fafc',
          borderRadius: '8px',
          border: '3px solid #667eea'
        }}>
          {Array.from({ length: totalSlots }).map((_, index) => {
            const hasImage = index < images.length;
            return (
              <div
                key={index}
                style={{
                  width: '100px',
                  height: '75px',
                  border: '2px solid ' + (hasImage ? '#667eea' : '#cbd5e0'),
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  background: hasImage 
                    ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' 
                    : 'white',
                  transition: 'all 0.2s'
                }}
              >
                {hasImage ? (
                  <>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '32px',
                      color: '#667eea',
                      opacity: 0.5
                    }}>
                      🔄
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: 'white',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }}>
                      #{index + 1}
                    </div>
                  </>
                ) : (
                  <div style={{
                    fontSize: '28px',
                    color: '#cbd5e0'
                  }}>
                    ·
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f7fafc',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#4a5568',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          {images.length} of {totalSlots} slots filled • {layoutType} layout
        </div>
      </div>
    </div>
  );
};

export default LayoutPreview;