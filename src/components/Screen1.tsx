import React, { useState, useRef } from 'react';
import ImageManager from './ImageManager';
import PhotosConfigDialog from './PhotosConfigDialog';
import LayoutPreview from './LayoutPreview';

interface Screen1Props {
  onBack: () => void;
}

const Screen1: React.FC<Screen1Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'Motor' | 'Non-Motor'>('Motor');
  const [outputFolder, setOutputFolder] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    insuredName: '',
    vehicleNo: '',
    accidentDate: '',
    policyNo: '',
    refNo: '',
    insuranceCompany: '',
    location: '',
    remarks: '',
    surveyType: 'Final Survey',
    layoutType: '2x2',
    outputFormat: 'JPG',
    imageQuality: 'Small : 1350 x 960',
    fontSize: 20,
    fontFamily: 'Arial',
    alignment: 'left',
    photoRatio: 'Auto',
    autoRotate: false,
    useDefaultFilename: true,
    customFilename: '',
    startPhotoNumber: 1,
    startSheetNumber: 1,
    maxPhotosPerSheet: 0,
    addTimestampOverlay: false,
    timestampMode: 'auto',
    customTimestamp: '',
    addTextOverlay: false,
    customTextOverlay: '',
    pdfType: 'single',
    pdfMaxSize: 4,
    addLocation: false
  });

  const imageManagerRef = useRef<any>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigSave = (config: any) => {
    setFormData(prev => ({ ...prev, ...config }));
  };

  const handleSelectOutputFolder = async () => {
    const folder = await (window as any).electronAPI.selectFolder();
    if (folder) {
      setOutputFolder(folder);
    }
  };

  const handleGenerate = async () => {
    if (!outputFolder) {
      await (window as any).electronAPI.showMessage({
        type: 'error',
        title: 'Error',
        message: 'Please select an output folder first.'
      });
      return;
    }

    const images = imageManagerRef.current?.getImages();
    if (!images || images.length === 0) {
      await (window as any).electronAPI.showMessage({
        type: 'error',
        title: 'Error',
        message: 'Please add at least one image.'
      });
      return;
    }

    setIsGenerating(true);

    try {
      await generatePhotoSheet({
        formData,
        images,
        outputFolder,
        sheetType: activeTab
      });

      await (window as any).electronAPI.showMessage({
        type: 'info',
        title: 'Success',
        message: `Photo sheet generated successfully in:\n${outputFolder}`
      });
    } catch (error) {
      console.error('Generation error:', error);
      await (window as any).electronAPI.showMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate photo sheet. Check console for details.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const images = imageManagerRef.current?.getImages() || [];

  return (
    <div className="screen">
      <div className="screen-header">
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Photo Sheet Generator
        </h2>
        <button className="btn btn-secondary" onClick={onBack}>
          Back to Main
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'Motor' ? 'active' : ''}`}
          onClick={() => setActiveTab('Motor')}
        >
          Motor
        </button>
        <button
          className={`tab ${activeTab === 'Non-Motor' ? 'active' : ''}`}
          onClick={() => setActiveTab('Non-Motor')}
        >
          Non-Motor
        </button>
      </div>

      <div className="scrollable">
        {/* Survey Details */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Survey Details</h3>
          
          <div className="grid grid-2">
            <div className="input-group">
              <label>Insured Name</label>
              <input 
                type="text" 
                value={formData.insuredName}
                onChange={(e) => handleInputChange('insuredName', e.target.value)}
              />
            </div>
            
            {activeTab === 'Motor' && (
              <>
                <div className="input-group">
                  <label>Vehicle No</label>
                  <input 
                    type="text"
                    value={formData.vehicleNo}
                    onChange={(e) => handleInputChange('vehicleNo', e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Accident Date</label>
                  <input 
                    type="text"
                    value={formData.accidentDate}
                    onChange={(e) => handleInputChange('accidentDate', e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label>Policy No</label>
              <input 
                type="text"
                value={formData.policyNo}
                onChange={(e) => handleInputChange('policyNo', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Ref No</label>
              <input 
                type="text"
                value={formData.refNo}
                onChange={(e) => handleInputChange('refNo', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Insurance Company</label>
              <input 
                type="text"
                value={formData.insuranceCompany}
                onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Location</label>
              <input 
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Remarks</label>
              <textarea 
                rows={3}
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Layout Configuration with Button */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '18px' }}>Layout Configuration</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowConfigDialog(true)}
            >
              ?? Configure Layout
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div className="grid grid-3">
                <div className="input-group">
                  <label>Survey Type</label>
                  <select value={formData.surveyType} onChange={(e) => handleInputChange('surveyType', e.target.value)}>
                    <option>Final Survey</option>
                    <option>Spot Survey</option>
                    <option>Reinspection</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Layout Type</label>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <select value={formData.layoutType} onChange={(e) => handleInputChange('layoutType', e.target.value)} style={{ flex: 1 }}>
                      <option value="1x1">1x1</option>
                      <option value="2x2">2x2</option>
                      <option value="3x3">3x3</option>
                      <option value="4x4">4x4</option>
                      <option value="2x3">2x3 (6 Photos V)</option>
                      <option value="3x2">3x2 (6 Photos H)</option>
                    </select>
                    <span style={{ color: '#1f6aa5', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {formData.layoutType.split('x').reduce((a, b) => (typeof a === 'string' ? parseInt(a) : a) * parseInt(b), 1 as number)} Photos
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <label>Output Format</label>
                  <select 
                    value={formData.outputFormat} 
                    onChange={(e) => handleInputChange('outputFormat', e.target.value)}
                    style={{ 
                      background: formData.outputFormat === 'PDF' ? '#1f6aa5' : '#2b2b2b',
                      fontWeight: 'bold'
                    }}
                  >
                    <option>JPG</option>
                    <option>PDF</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Layout Preview */}
            <LayoutPreview
              images={images}
              layoutType={formData.layoutType}
              onRemove={() => {}}
              onEdit={() => {}}
              onRotate={() => {}}
            />
          </div>
        </div>

        {/* Display Settings */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Display Settings</h3>
          
          <div className="grid grid-3">
            <div className="input-group">
              <label>Image Quality</label>
              <select value={formData.imageQuality} onChange={(e) => handleInputChange('imageQuality', e.target.value)}>
                <option>Small : 1350 x 960</option>
                <option>Medium : 1920 x 1080</option>
                <option>Large : 2560 x 1440</option>
              </select>
            </div>

            <div className="input-group">
              <label>Text Alignment</label>
              <select value={formData.alignment} onChange={(e) => handleInputChange('alignment', e.target.value)}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className="input-group">
              <label>Font Size</label>
              <input 
                type="number" 
                value={formData.fontSize}
                onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
                min={10} 
                max={50} 
              />
            </div>

            <div className="input-group">
              <label>Font Family</label>
              <select value={formData.fontFamily} onChange={(e) => handleInputChange('fontFamily', e.target.value)}>
                <option>Arial</option>
                <option>Times New Roman</option>
                <option>Courier New</option>
                <option>Georgia</option>
                <option>Verdana</option>
              </select>
            </div>
          </div>
        </div>

        {/* Output Settings */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Output Settings</h3>
          
          <div className="checkbox-group" style={{ marginBottom: '15px' }}>
            <input
              type="checkbox"
              id="useDefaultFilename"
              checked={formData.useDefaultFilename}
              onChange={(e) => handleInputChange('useDefaultFilename', e.target.checked)}
            />
            <label htmlFor="useDefaultFilename">Use default filename</label>
          </div>

          {!formData.useDefaultFilename && (
            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>Custom Filename (without extension)</label>
              <input
                type="text"
                value={formData.customFilename}
                onChange={(e) => handleInputChange('customFilename', e.target.value)}
                placeholder="e.g., Survey_Report"
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={handleSelectOutputFolder}>
              Select Output Folder
            </button>
            <span style={{ color: '#888', fontSize: '14px' }}>
              {outputFolder || 'No folder selected'}
            </span>
          </div>
        </div>

        {/* Image Manager */}
        <ImageManager ref={imageManagerRef} />

        {/* Generate Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          gap: '10px',
          margin: '30px 0 50px 0',
          alignItems: 'center'
        }}>
          {isGenerating ? (
            <div className="loading-bar">
              <div className="loading-bar-fill"></div>
            </div>
          ) : (
            <>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setFormData({
                    ...formData,
                    insuredName: '',
                    vehicleNo: '',
                    accidentDate: '',
                    policyNo: '',
                    refNo: '',
                    insuranceCompany: '',
                    location: '',
                    remarks: ''
                  });
                }}
                style={{ padding: '12px 24px' }}
              >
                Reset
              </button>
              
              <button 
                className="btn btn-primary btn-large"
                onClick={handleGenerate}
              >
                Generate Photo Sheet ({formData.outputFormat})
              </button>

              <button 
                className="btn btn-secondary"
                onClick={onBack}
                style={{ padding: '12px 24px' }}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>

      <div className="footer">
        Copyright @ VantageSolutions.org : 9039061038
      </div>

      {/* Config Dialog */}
      {showConfigDialog && (
        <PhotosConfigDialog
          currentConfig={{
            layoutType: formData.layoutType,
            startPhotoNumber: formData.startPhotoNumber,
            startSheetNumber: formData.startSheetNumber,
            maxPhotosPerSheet: formData.maxPhotosPerSheet,
            photoRatio: formData.photoRatio,
            autoRotate: formData.autoRotate,
            outputFormat: formData.outputFormat,
            addTimestamp: formData.addTimestampOverlay,
            addLocation: formData.addLocation,
            pdfType: formData.pdfType,
            pdfMaxSize: formData.pdfMaxSize
          }}
          onSave={handleConfigSave}
          onClose={() => setShowConfigDialog(false)}
        />
      )}
    </div>
  );
};

// [Keep the same generatePhotoSheet function from before - unchanged]
async function generatePhotoSheet(options: any) {
  const { formData, images, outputFolder, sheetType } = options;
  
  const [rows, cols] = formData.layoutType.split('x').map(Number);
  const imagesPerSheet = formData.maxPhotosPerSheet > 0 
    ? Math.min(formData.maxPhotosPerSheet, rows * cols)
    : rows * cols;
  
  let sheetWidth = 1350;
  let sheetHeight = 960;
  
  if (formData.imageQuality.includes('1920')) {
    sheetWidth = 1920;
    sheetHeight = 1080;
  } else if (formData.imageQuality.includes('2560')) {
    sheetWidth = 2560;
    sheetHeight = 1440;
  }
  
  const numSheets = Math.ceil(images.length / imagesPerSheet);
  
  for (let sheetNum = 0; sheetNum < numSheets; sheetNum++) {
    const actualSheetNum = formData.startSheetNumber + sheetNum;
    const startIdx = sheetNum * imagesPerSheet;
    const endIdx = Math.min(startIdx + imagesPerSheet, images.length);
    const sheetImages = images.slice(startIdx, endIdx);
    
    await createSheet(
      actualSheetNum, 
      sheetImages, 
      formData.startPhotoNumber + startIdx, 
      formData, 
      sheetType, 
      sheetWidth, 
      sheetHeight, 
      rows, 
      cols,
      outputFolder
    );
  }
}

async function createSheet(
  sheetNum: number, 
  images: any[], 
  startNumber: number, 
  formData: any, 
  sheetType: string, 
  sheetWidth: number, 
  sheetHeight: number, 
  rows: number, 
  cols: number,
  outputFolder: string
) {
  const canvas = document.createElement('canvas');
  canvas.width = sheetWidth;
  canvas.height = sheetHeight;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, sheetWidth, sheetHeight);
  
  const headerHeight = 180;
  const margin = 30;
  
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PHOTO SHEET', sheetWidth / 2, margin + 40);
  
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  let y = margin + 80;
  let x = margin + 50;
  
  ctx.fillStyle = '#666666';
  ctx.fillText(`Insured Name: ${formData.insuredName || 'N/A'}`, x, y);
  
  if (sheetType === 'Motor') {
    ctx.fillText(`Vehicle No: ${formData.vehicleNo || 'N/A'}`, x + 400, y);
    y += 25;
    ctx.fillText(`Accident Date: ${formData.accidentDate || 'N/A'}`, x, y);
  }
  
  y += 25;
  ctx.fillText(`Policy No: ${formData.policyNo || 'N/A'}`, x, y);
  ctx.fillText(`Ref No: ${formData.refNo || 'N/A'}`, x + 400, y);
  y += 25;
  ctx.fillText(`Insurance Company: ${formData.insuranceCompany || 'N/A'}`, x, y);
  ctx.fillText(`Location: ${formData.location || 'N/A'}`, x + 400, y);
  
  const availableHeight = sheetHeight - headerHeight - margin * 2;
  const availableWidth = sheetWidth - margin * 2;
  const photoAreaWidth = availableWidth / cols;
  const photoAreaHeight = availableHeight / rows;
  const photoMargin = 15;
  const commentHeight = 60;
  const photoWidth = photoAreaWidth - photoMargin * 2;
  const photoHeight = photoAreaHeight - photoMargin * 2 - commentHeight;
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const row = Math.floor(i / cols);
    const col = i % cols;
    const posX = margin + col * photoAreaWidth + photoMargin;
    const posY = headerHeight + margin + row * photoAreaHeight + photoMargin;
    
    await drawImageWithOverlays(ctx, image, posX, posY, photoWidth, photoHeight, formData);
    
    ctx.fillStyle = '#000000';
    ctx.font = `${formData.fontSize}px ${formData.fontFamily}`;
    
    const commentText = `${startNumber + i}. ${image.comment || ''}`;
    const textY = posY + photoHeight + 30;
    
    if (formData.alignment === 'center') {
      ctx.textAlign = 'center';
      ctx.fillText(commentText, posX + photoWidth / 2, textY);
    } else if (formData.alignment === 'right') {
      ctx.textAlign = 'right';
      ctx.fillText(commentText, posX + photoWidth, textY);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText(commentText, posX, textY);
    }
  }
  
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.font = 'bold 48px Arial';
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  for (let x = 0; x < sheetWidth; x += 500) {
    for (let y = 0; y < sheetHeight; y += 500) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText('Vantage Solutions', 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
  
  const filename = formData.useDefaultFilename 
    ? `Sheet_${sheetNum}.${formData.outputFormat.toLowerCase()}`
    : `${formData.customFilename}_${sheetNum}.${formData.outputFormat.toLowerCase()}`;
  
  // Save directly to output folder using Electron API
canvas.toBlob(async (blob) => {
    if (!blob) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const fullPath = `${outputFolder}/${filename}`;
      
      // Check if file exists
      const exists = await (window as any).electronAPI.fileExists(fullPath);
      if (exists) {
        const overwrite = confirm(`File "${filename}" already exists. Overwrite?`);
        if (!overwrite) return;
      }
      
      // Save file directly to disk
      const result = await (window as any).electronAPI.saveFile({
        filePath: fullPath,
        base64Data: base64Data,
        format: formData.outputFormat.toLowerCase()
      });
      
      if (!result.success) {
        console.error('Failed to save file:', result.error);
      }
    };
    reader.readAsDataURL(blob);
  }, formData.outputFormat === 'PDF' ? 'application/pdf' : 'image/jpeg', 0.95);
}

async function drawImageWithOverlays(
  ctx: CanvasRenderingContext2D, 
  imageData: any, 
  x: number, 
  y: number, 
  width: number, 
  height: number,
  formData: any
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let imgWidth = img.width;
      let imgHeight = img.height;
      let imgAspect = imgWidth / imgHeight;
      let isPortrait = imgHeight > imgWidth;
      
      let rotation = imageData.rotation;
      if (formData.autoRotate && isPortrait) {
        rotation += 90;
      }
      
      let drawWidth = width;
      let drawHeight = height;
      let offsetX = x;
      let offsetY = y;
      
      if (formData.photoRatio === '4:3') {
        if (!isPortrait) {
          drawWidth = width;
          drawHeight = height;
        } else {
          const targetAspect = width / height;
          if (imgAspect > targetAspect) {
            drawHeight = width / imgAspect;
            offsetY = y + (height - drawHeight) / 2;
          } else {
            drawWidth = height * imgAspect;
            offsetX = x + (width - drawWidth) / 2;
          }
        }
      } else {
        const targetAspect = width / height;
        if (imgAspect > targetAspect) {
          drawHeight = width / imgAspect;
          offsetY = y + (height - drawHeight) / 2;
        } else {
          drawWidth = height * imgAspect;
          offsetX = x + (width - drawWidth) / 2;
        }
      }
      
      if (rotation !== 0) {
        ctx.save();
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();
      } else {
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
      
      if (formData.addTimestampOverlay) {
        const timestamp = formData.timestampMode === 'auto' 
          ? (imageData.exifDate || new Date().toLocaleString())
          : formData.customTimestamp;
        
        ctx.save();
        ctx.font = '20px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'left';
        const timestampX = x + 10;
        const timestampY = y + height - 10;
        ctx.strokeText(timestamp, timestampX, timestampY);
        ctx.fillText(timestamp, timestampX, timestampY);
        ctx.restore();
      }
      
      if (formData.addTextOverlay && formData.customTextOverlay) {
        ctx.save();
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.textAlign = 'center';
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(formData.customTextOverlay, 0, 0);
        ctx.restore();
      }
      
      resolve();
    };
    img.src = imageData.editedBuffer 
      ? `data:image/jpeg;base64,${imageData.editedBuffer}`
      : imageData.thumbnail;
  });
}

export default Screen1;


