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

      let timestamp: string;
      
      if (timestampMode === 'auto') {
        timestamp = image.exifDate || new Date().toLocaleString();
      } else {
        // Manual mode - use custom input or current date/time
        timestamp = manualTimestamp || new Date().toLocaleString();
      }
      
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
    ctx.fillStyle = color;

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
      ctx.strokeStyle = '#ffff00';
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
    ctx.fillStyle = color;

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

  const handleClearAll = () => {
    handleResetToOriginal();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 1000,
      display: 'flex'
    }}>
      {/* Canvas Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        overflow: 'auto'
      }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            border: '2px solid #333',
            cursor: tool === 'none' ? 'default' : 'crosshair',
            background: '#000',
            margin: 'auto'
          }}
        />
        
        {/* Comment Input */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ color: '#ccc', marginBottom: '5px', display: 'block' }}>Comment:</label>
          <input
            type="text"
            style={{
              width: '100%',
              padding: '10px',
              background: '#2b2b2b',
              border: '1px solid #333',
              borderRadius: '6px',
              color: 'white'
            }}
            placeholder="Add a comment for this image"
          />
        </div>
      </div>

      {/* Right Sidebar - Drawing Tools */}
      <div style={{
        width: '250px',
        background: '#2b2b2b',
        padding: '20px',
        overflowY: 'auto',
        borderLeft: '1px solid #333'
      }}>
        <h3 style={{ color: 'white', marginBottom: '20px' }}>Drawing Tools</h3>
        
        {/* Tool Buttons */}
        <button
          className={`btn ${tool === 'circle' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTool('circle')}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          Circle
        </button>
        <button
          className={`btn ${tool === 'arrow' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTool('arrow')}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          Arrow
        </button>
        
        {/* Color Picker */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ color: '#ccc', display: 'block', marginBottom: '10px' }}>Color:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px', marginBottom: '10px' }}>
            {['#000000', '#ff0000', '#0000ff', '#ffffff'].map(c => (
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '45px',
                  height: '45px',
                  background: c,
                  border: color === c ? '3px solid #1f6aa5' : '2px solid #555',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              />
            ))}
          </div>
        </div>

        {/* Timestamp Options */}
        <div style={{ marginTop: '20px', padding: '15px', background: '#1f1f1f', borderRadius: '8px' }}>
          <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Timestamp Options</h4>
          
          <button
            className="btn btn-secondary"
            onClick={() => setTimestampMode('auto')}
            style={{ 
              width: '100%', 
              marginBottom: '5px', 
              background: timestampMode === 'auto' ? '#1f6aa5' : '#404040' 
            }}
          >
            Auto Timestamp
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={() => setTimestampMode('manual')}
            style={{ 
              width: '100%', 
              marginBottom: '10px', 
              background: timestampMode === 'manual' ? '#1f6aa5' : '#404040' 
            }}
          >
            Manual Timestamp
          </button>

          {timestampMode === 'manual' && (
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={manualTimestamp}
                onChange={(e) => setManualTimestamp(e.target.value)}
                placeholder="e.g., 24-Dec-2024 10:30 AM"
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#2b2b2b',
                  border: '1px solid #555',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
              <small style={{ color: '#888', fontSize: '10px', display: 'block', marginTop: '5px' }}>
                Enter custom date/time text
              </small>
            </div>
          )}
          
          <button
            className={`btn ${tool === 'timestamp' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTool('timestamp')}
            style={{ width: '100%' }}
          >
            Add Timestamp
          </button>

          {timestampMode === 'auto' && image.exifDate && (
            <small style={{ color: '#888', fontSize: '10px', display: 'block', marginTop: '5px' }}>
              EXIF: {image.exifDate}
            </small>
          )}
        </div>

        {/* Line Thickness */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Line Thickness</label>
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <span style={{ color: '#ccc' }}>{lineWidth}px</span>
        </div>

        {/* Font Size */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Font Size</label>
          <input
            type="range"
            min="12"
            max="48"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <span style={{ color: '#ccc' }}>{fontSize}px</span>
        </div>

        {/* Crop Tool */}
        <button
          className={`btn ${tool === 'crop' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTool('crop')}
          style={{ width: '100%', marginTop: '20px' }}
        >
          Crop
        </button>

        {/* Action Buttons */}
        <div style={{ marginTop: '30px' }}>
          <button className="btn btn-secondary" onClick={handleUndo} disabled={historyIndex <= 0} style={{ width: '100%', marginBottom: '5px' }}>
            Undo
          </button>
          <button className="btn btn-secondary" onClick={handleRedo} disabled={historyIndex >= history.length - 1} style={{ width: '100%', marginBottom: '5px' }}>
            Redo
          </button>
          <button className="btn btn-secondary" onClick={handleClearAll} style={{ width: '100%', marginBottom: '5px' }}>
            Clear All
          </button>
        </div>

        {/* Save / Reset / Cancel */}
        <div style={{ marginTop: '30px' }}>
          <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%', marginBottom: '5px' }}>
            Save
          </button>
          <button className="btn btn-danger" onClick={handleResetToOriginal} style={{ width: '100%', marginBottom: '5px' }}>
            Reset to Original
          </button>
          <button className="btn btn-secondary" onClick={onClose} style={{ width: '100%' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
