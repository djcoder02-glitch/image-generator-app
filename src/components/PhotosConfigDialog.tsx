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
    { value: '1x1', icon: '1', label: '1 Photo' },
    { value: '2x2', icon: '4', label: '4 Photos' },
    { value: '3x3', icon: '9', label: '9 Photos' },
    { value: '4x4', icon: '12', label: '12 Photos' },
    { value: '2x3', icon: '6', label: '6 Photos (V)' },
    { value: '3x2', icon: '6', label: '6 Photos (H)' },
    { value: '2x4', icon: '8', label: '8 Photos' }
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
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: '#2b2b2b',
        borderRadius: '12px',
        padding: '30px',
        width: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #444'
      }}>
        <h2 style={{ color: 'white', marginBottom: '25px', textAlign: 'center' }}>Configure Photos Layout</h2>

        {/* Layout Selection */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {layouts.map(layout => (
              <button
                key={layout.value}
                onClick={() => setConfig({ ...config, layoutType: layout.value })}
                style={{
                  padding: '15px 10px',
                  background: config.layoutType === layout.value ? '#1f6aa5' : '#404040',
                  border: config.layoutType === layout.value ? '2px solid #1f6aa5' : '2px solid #555',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {layout.value === '1x1' && '📄'}
                {layout.value === '2x3' && '📱'}
                {layout.icon !== '1' && layout.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left Column */}
          <div>
            <div className="input-group">
              <label>Photo Start No.</label>
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

            <div className="input-group">
              <label>PDF Type</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={config.pdfType === 'single'}
                    onChange={() => setConfig({ ...config, pdfType: 'single' })}
                  />
                  Single PDF
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={config.pdfType === 'multiple'}
                    onChange={() => setConfig({ ...config, pdfType: 'multiple' })}
                  />
                  Multiple PDF
                </label>
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="addDate"
                checked={config.addTimestamp}
                onChange={(e) => setConfig({ ...config, addTimestamp: e.target.checked })}
              />
              <label htmlFor="addDate">Add Date</label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="addTime"
                checked={config.addTimestamp}
                onChange={(e) => setConfig({ ...config, addTimestamp: e.target.checked })}
              />
              <label htmlFor="addTime">Add Time</label>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="input-group">
              <label>Sheet Start No.</label>
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

            <div className="input-group">
              <label>PDF max size (MB)</label>
              <input
                type="number"
                value={config.pdfMaxSize}
                onChange={(e) => setConfig({ ...config, pdfMaxSize: parseInt(e.target.value) || 4 })}
                min={1}
                max={50}
              />
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setConfig({
              ...config,
              startPhotoNumber: 1,
              startSheetNumber: 1
            })}
            style={{ padding: '10px 20px' }}
          >
            Reset Numbers
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{ padding: '10px 30px' }}
          >
            Save
          </button>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '10px 20px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotosConfigDialog;
