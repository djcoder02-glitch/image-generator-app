interface LayoutPreviewProps {
  images: any[];
  layoutType: string;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
  onRotate: (index: number) => void;
}

const LayoutPreview: React.FC<LayoutPreviewProps> = ({ images, layoutType }) => {
  const [, cols] = layoutType.split('x').map(Number);

  return (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Layout Preview</h4>
      
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        display: 'inline-block'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 80px)`,
          gap: '5px',
          border: '2px solid #000',
          padding: '10px'
        }}>
          {Array.from({ length: cols * Math.ceil(images.length / cols) }).map((_, index) => {
            const hasImage = index < images.length;
            return (
              <div
                key={index}
                style={{
                  width: '80px',
                  height: '60px',
                  border: '1px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  background: hasImage ? '#f0f0f0' : 'white'
                }}
              >
                {hasImage && (
                  <>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '24px'
                    }}>
                      ↻
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#000'
                    }}>
                      {index + 1}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LayoutPreview;
