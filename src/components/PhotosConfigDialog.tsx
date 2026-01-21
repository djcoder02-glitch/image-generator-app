import { useState } from 'react';

interface PhotosConfigDialogProps {
  currentConfig: {
    layoutType: string;
    startPhotoNumber: number;
    startSheetNumber: number;
    maxPhotosPerSheet: number;
    photoRatio: string;
    autoRotate: boolean;
    outputFormat: string;
    addTimestamp: boolean;
    addLocation: boolean;
    pdfType: string;
    pdfMaxSize: number;
  };
  onSave: (config: any) => void;
  onClose: () => void;
}

const PhotosConfigDialog: React.FC<PhotosConfigDialogProps> = ({ currentConfig, onSave, onClose }) => {
  const [config, setConfig] = useState(currentConfig);

  const layouts = [
    { value: '1x1', label: '1x1' },
    { value: '2x2', label: '2x2' },
    { value: '3x3', label: '3x3' },
    { value: '4x4', label: '4x4' },
    { value: '2x3', label: '2x3' },
    { value: '3x2', label: '3x2' },
    { value: '2x4', label: '2x4' }
  ];

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '4px',
        padding: '24px',
        width: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ 
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '20px'
        }}>
          Layout Configuration
        </h2>

        {/* Layout Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#555'
          }}>
            Layout Type
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '10px' 
          }}>
            {layouts.map(layout => (
              <button
                key={layout.value}
                onClick={() => setConfig({ ...config, layoutType: layout.value })}
                style={{
                  padding: '12px',
                  background: config.layoutType === layout.value ? '#0066cc' : 'white',
                  border: config.layoutType === layout.value ? '1px solid #0066cc' : '1px solid #ddd',
                  borderRadius: '4px',
                  color: config.layoutType === layout.value ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {layout.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Left Column */}
          <div>
            <div className="input-group">
              <label>Photo Start Number</label>
              <input
                type="number"
                value={config.startPhotoNumber}
                onChange={(e) => setConfig({ ...config, startPhotoNumber: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>

            <div className="input-group">
              <label>Photo Ratio</label>
              <select
                value={config.photoRatio}
                onChange={(e) => setConfig({ ...config, photoRatio: e.target.value })}
              >
                <option value="Auto">Auto</option>
                <option value="4:3">4:3</option>
                <option value="16:9">16:9</option>
              </select>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="addTimestamp"
                checked={config.addTimestamp}
                onChange={(e) => setConfig({ ...config, addTimestamp: e.target.checked })}
              />
              <label htmlFor="addTimestamp">Add Date & Time</label>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="input-group">
              <label>Sheet Start Number</label>
              <input
                type="number"
                value={config.startSheetNumber}
                onChange={(e) => setConfig({ ...config, startSheetNumber: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="autoRotate"
                checked={config.autoRotate}
                onChange={(e) => setConfig({ ...config, autoRotate: e.target.checked })}
              />
              <label htmlFor="autoRotate">Auto Rotate</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="addLocation"
                checked={config.addLocation}
                onChange={(e) => setConfig({ ...config, addLocation: e.target.checked })}
              />
              <label htmlFor="addLocation">Add Location</label>
            </div>
          </div>
        </div>

        {/* PDF Options */}
        <div style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <h4 style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '12px'
          }}>
            PDF Options
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>PDF Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  cursor: 'pointer',
                  flex: 1,
                  justifyContent: 'center',
                  padding: '6px',
                  background: config.pdfType === 'single' ? '#0066cc' : 'white',
                  color: config.pdfType === 'single' ? 'white' : '#666',
                  borderRadius: '4px',
                  border: '1px solid ' + (config.pdfType === 'single' ? '#0066cc' : '#ddd')
                }}>
                  <input
                    type="radio"
                    checked={config.pdfType === 'single'}
                    onChange={() => setConfig({ ...config, pdfType: 'single' })}
                    style={{ display: 'none' }}
                  />
                  Single
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  cursor: 'pointer',
                  flex: 1,
                  justifyContent: 'center',
                  padding: '6px',
                  background: config.pdfType === 'multiple' ? '#0066cc' : 'white',
                  color: config.pdfType === 'multiple' ? 'white' : '#666',
                  borderRadius: '4px',
                  border: '1px solid ' + (config.pdfType === 'multiple' ? '#0066cc' : '#ddd')
                }}>
                  <input
                    type="radio"
                    checked={config.pdfType === 'multiple'}
                    onChange={() => setConfig({ ...config, pdfType: 'multiple' })}
                    style={{ display: 'none' }}
                  />
                  Multiple
                </label>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Max Size (MB)</label>
              <input
                type="number"
                value={config.pdfMaxSize}
                onChange={(e) => setConfig({ ...config, pdfMaxSize: parseInt(e.target.value) || 4 })}
                min={1}
                max={50}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setConfig({
              ...config,
              startPhotoNumber: 1,
              startSheetNumber: 1
            })}
          >
            Reset Numbers
          </button>
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotosConfigDialog;
