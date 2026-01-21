import React, { useState, useRef } from 'react';
import ImageManager from './ImageManager';
import PhotosConfigDialog from './PhotosConfigDialog';

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
    addLocation: false,
    addTimestamp: false
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
        message: `Photo sheets generated successfully in:\n${outputFolder}`
      });
    } catch (error) {
      console.error('Generation error:', error);
      await (window as any).electronAPI.showMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to generate photo sheets.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const images = imageManagerRef.current?.getImages() || [];

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
              Create Survey Documentation
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary"
          onClick={onBack}
          style={{ fontSize: '14px', padding: '8px 24px' }}
        >
          Back
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 32px',
        display: 'flex',
        gap: '4px'
      }}>
        <button
          onClick={() => setActiveTab('Motor')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'Motor' ? '#3b4f6b' : 'transparent',
            color: activeTab === 'Motor' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Motor Survey
        </button>
        <button
          onClick={() => setActiveTab('Non-Motor')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'Non-Motor' ? '#3b4f6b' : 'transparent',
            color: activeTab === 'Non-Motor' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Non-Motor Survey
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px 32px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Policy Details Card */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            {/* Card Header */}
            <div style={{
              background: '#3b4f6b',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>📋</span>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                margin: 0
              }}>
                Policy Details
              </h3>
            </div>

            {/* Card Content */}
            <div style={{ padding: '24px' }}>
              <div className="grid grid-2">
                <div className="input-group">
                  <label>Insured Name</label>
                  <input 
                    type="text" 
                    value={formData.insuredName}
                    onChange={(e) => handleInputChange('insuredName', e.target.value)}
                    placeholder="Enter insured name"
                  />
                </div>
                
                {activeTab === 'Motor' && (
                  <>
                    <div className="input-group">
                      <label>Vehicle Number</label>
                      <input 
                        type="text"
                        value={formData.vehicleNo}
                        onChange={(e) => handleInputChange('vehicleNo', e.target.value)}
                        placeholder="Enter vehicle number"
                      />
                    </div>
                    <div className="input-group">
                      <label>Accident Date</label>
                      <input 
                        type="text"
                        value={formData.accidentDate}
                        onChange={(e) => handleInputChange('accidentDate', e.target.value)}
                        placeholder="DD-MM-YYYY"
                      />
                    </div>
                  </>
                )}

                <div className="input-group">
                  <label>Policy Number</label>
                  <input 
                    type="text"
                    value={formData.policyNo}
                    onChange={(e) => handleInputChange('policyNo', e.target.value)}
                    placeholder="Enter policy number"
                  />
                </div>
                <div className="input-group">
                  <label>Reference Number</label>
                  <input 
                    type="text"
                    value={formData.refNo}
                    onChange={(e) => handleInputChange('refNo', e.target.value)}
                    placeholder="Enter reference number"
                  />
                </div>
                <div className="input-group">
                  <label>Insurance Company</label>
                  <input 
                    type="text"
                    value={formData.insuranceCompany}
                    onChange={(e) => handleInputChange('insuranceCompany', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="input-group">
                  <label>Location</label>
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location"
                  />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Remarks</label>
                  <textarea 
                    rows={3}
                    value={formData.remarks}
                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                    placeholder="Add any remarks or notes"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Layout Settings Card */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#3b4f6b',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>⚙️</span>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  margin: 0
                }}>
                  Layout Settings
                </h3>
              </div>
              <button 
                className="btn"
                onClick={() => setShowConfigDialog(true)}
                style={{
                  background: 'white',
                  color: '#3b4f6b',
                  fontSize: '13px',
                  padding: '6px 16px',
                  fontWeight: '600'
                }}
              >
                Advanced Config
              </button>
            </div>

            <div style={{ padding: '24px' }}>
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
                  <select value={formData.layoutType} onChange={(e) => handleInputChange('layoutType', e.target.value)}>
                    <option value="1x1">1x1 (1 photo)</option>
                    <option value="2x2">2x2 (4 photos)</option>
                    <option value="3x3">3x3 (9 photos)</option>
                    <option value="4x4">4x4 (16 photos)</option>
                    <option value="2x3">2x3 (6 photos)</option>
                    <option value="3x2">3x2 (6 photos)</option>
                    <option value="2x4">2x4 (8 photos)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Output Format</label>
                  <select value={formData.outputFormat} onChange={(e) => handleInputChange('outputFormat', e.target.value)}>
                    <option value="JPG">JPG</option>
                    <option value="PDF">PDF</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Output Settings Card */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#3b4f6b',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>💾</span>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                margin: 0
              }}>
                Output Settings
              </h3>
            </div>

            <div style={{ padding: '24px' }}>
              <div className="grid grid-2">
                <div className="input-group">
                  <label>Output Folder</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={outputFolder}
                      readOnly
                      placeholder="Select folder"
                      style={{ flex: 1 }}
                    />
                    <button 
                      className="btn btn-secondary"
                      onClick={handleSelectOutputFolder}
                    >
                      Browse
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label>Image Quality</label>
                  <select value={formData.imageQuality} onChange={(e) => handleInputChange('imageQuality', e.target.value)}>
                    <option>Small : 1350 x 960</option>
                    <option>Medium : 1800 x 1280</option>
                    <option>Large : 2400 x 1700</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Image Manager */}
          <ImageManager ref={imageManagerRef} />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div style={{
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#6b7280'
        }}>
          {images.length} images • {formData.layoutType} layout • {outputFolder ? '✓ Folder selected' : '⚠ Select folder'}
        </div>

        {!isGenerating ? (
          <button 
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!outputFolder || images.length === 0}
            style={{
              padding: '12px 32px',
              fontSize: '15px',
              fontWeight: '600'
            }}
          >
            Generate Photo Sheet
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="loading-bar" style={{ width: '200px' }}>
              <div className="loading-bar-fill"></div>
            </div>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Generating...</span>
          </div>
        )}
      </div>

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
            addTimestamp: formData.addTimestamp,
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

// Keep all generation functions from original
async function generatePhotoSheet(options: any) {
  const { formData, images, outputFolder, sheetType } = options;
  
  const qualityMap: { [key: string]: { width: number; height: number } } = {
    'Small : 1350 x 960': { width: 1350, height: 960 },
    'Medium : 1800 x 1280': { width: 1800, height: 1280 },
    'Large : 2400 x 1700': { width: 2400, height: 1700 }
  };
  
  const { width: sheetWidth, height: sheetHeight } = qualityMap[formData.imageQuality] || { width: 1800, height: 1280 };
  
  const [rows, cols] = formData.layoutType.split('x').map(Number);
  const photosPerSheet = rows * cols;
  
  let sheetNum = formData.startSheetNumber;
  
  for (let i = 0; i < images.length; i += photosPerSheet) {
    const sheetImages = images.slice(i, i + photosPerSheet);
    const startIdx = i;
    const actualSheetNum = sheetNum++;
    
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
  
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const fullPath = `${outputFolder}/${filename}`;
      
      const exists = await (window as any).electronAPI.fileExists(fullPath);
      if (exists) {
        const overwrite = confirm(`File "${filename}" already exists. Overwrite?`);
        if (!overwrite) return;
      }
      
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
