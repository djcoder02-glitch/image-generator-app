import React, { useRef, useEffect, useState } from 'react';

interface ImageEditorProps {
  image: any;
  onSave: (editedBuffer: string) => void;
  onClose: () => void;
}

type DrawingTool = 'circle' | 'arrow' | 'timestamp' | 'crop' | 'none';

const ImageEditor: React.FC<ImageEditorProps> = ({ image, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawingTool>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('#ff0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [fontSize, setFontSize] = useState(24);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string>('');
  const [timestampMode, setTimestampMode] = useState<'auto' | 'manual'>('auto');
  const [manualTimestamp, setManualTimestamp] = useState('');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setOriginalImageData(imgData);
      setHistory([imgData]);
      setHistoryIndex(0);
    };
    img.src = image.thumbnail;
    setOriginalImageSrc(image.thumbnail);
  }, [image]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'none') return;
    
    const pos = getMousePos(e);
    setStartPos(pos);
    setIsDrawing(true);

    if (tool === 'timestamp') {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const timestamp = timestampMode === 'auto' 
        ? (image.exifDate || new Date().toLocaleString())
        : (manualTimestamp || new Date().toLocaleString());
      
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(timestamp, pos.x, pos.y);
      ctx.fillText(timestamp, pos.x, pos.y);
      
      setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      saveToHistory();
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'none' || tool === 'timestamp') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !originalImageData) return;

    const currentPos = getMousePos(e);
    
    ctx.putImageData(originalImageData, 0, 0);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(currentPos.x - startPos.x, 2) + 
        Math.pow(currentPos.y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (tool === 'arrow') {
      drawArrow(ctx, startPos.x, startPos.y, currentPos.x, currentPos.y);
    } else if (tool === 'crop') {
      ctx.strokeStyle = '#0066cc';
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        currentPos.x - startPos.x,
        currentPos.y - startPos.y
      );
      ctx.setLineDash([]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'none' || tool === 'timestamp') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentPos = getMousePos(e);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(currentPos.x - startPos.x, 2) + 
        Math.pow(currentPos.y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (tool === 'arrow') {
      drawArrow(ctx, startPos.x, startPos.y, currentPos.x, currentPos.y);
    } else if (tool === 'crop') {
      const cropX = Math.min(startPos.x, currentPos.x);
      const cropY = Math.min(startPos.y, currentPos.y);
      const cropWidth = Math.abs(currentPos.x - startPos.x);
      const cropHeight = Math.abs(currentPos.y - startPos.y);
      
      if (cropWidth > 0 && cropHeight > 0) {
        const croppedData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        ctx.putImageData(croppedData, 0, 0);
      }
    }

    setIsDrawing(false);
    setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    saveToHistory();
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const headLength = 20;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        onSave(base64);
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.95);
  };

  const handleResetToOriginal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setOriginalImageData(imgData);
      setHistory([imgData]);
      setHistoryIndex(0);
    };
    img.src = originalImageSrc;
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const newIndex = historyIndex - 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setOriginalImageData(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const newIndex = historyIndex + 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setOriginalImageData(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const colors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Toolbar */}
      <div style={{
        background: 'white',
        padding: '12px 20px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>
          Image Editor - {image.name}
        </h2>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleUndo} 
            disabled={historyIndex <= 0}
          >
            Undo
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1}
          >
            Redo
          </button>
          <button className="btn btn-danger" onClick={handleResetToOriginal}>
            Reset
          </button>
          <button className="btn btn-success" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar */}
        <div style={{
          width: '250px',
          background: 'white',
          borderRight: '1px solid #ddd',
          overflowY: 'auto',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
            Tools
          </h3>

          <div style={{ display: 'grid', gap: '8px', marginBottom: '20px' }}>
            <button
              className={`btn ${tool === 'circle' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTool('circle')}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              Circle
            </button>
            <button
              className={`btn ${tool === 'arrow' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTool('arrow')}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              Arrow
            </button>
            <button
              className={`btn ${tool === 'crop' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTool('crop')}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              Crop
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>
              Color
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {colors.map(c => (
                <div
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: c,
                    border: color === c ? '3px solid #0066cc' : '1px solid #ddd',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>
              Line Width: {lineWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '4px', border: '1px solid #ddd' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>
              Timestamp
            </h4>
            
            <div style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setTimestampMode('auto')}
                style={{ 
                  width: '100%',
                  background: timestampMode === 'auto' ? '#0066cc' : 'white',
                  color: timestampMode === 'auto' ? 'white' : '#666'
                }}
              >
                Auto
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={() => setTimestampMode('manual')}
                style={{ 
                  width: '100%',
                  background: timestampMode === 'manual' ? '#0066cc' : 'white',
                  color: timestampMode === 'manual' ? 'white' : '#666'
                }}
              >
                Manual
              </button>
            </div>

            {timestampMode === 'manual' && (
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  value={manualTimestamp}
                  onChange={(e) => setManualTimestamp(e.target.value)}
                  placeholder="e.g., 24-Dec-2024"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                />
              </div>
            )}
            
            <button
              className={`btn ${tool === 'timestamp' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTool('timestamp')}
              style={{ width: '100%' }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          overflow: 'auto',
          background: '#2a2a2a'
        }}>
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              border: '2px solid #555',
              cursor: tool === 'none' ? 'default' : 'crosshair',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
