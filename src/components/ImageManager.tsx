import { useState, forwardRef, useImperativeHandle } from 'react';
import ImageEditor from './ImageEditor';

interface ImageData {
  id: string;
  path: string;
  name: string;
  buffer: string;
  rotation: number;
  comment: string;
  thumbnail: string;
  editedBuffer?: string;
  exifDate?: string;
}

const ImageManager = forwardRef((_props, ref) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useImperativeHandle(ref, () => ({
    getImages: () => images
  }));

  const extractEXIFDate = (imgElement: HTMLImageElement): string | undefined => {
    try {
      // @ts-ignore
      if (window.EXIF) {
        // @ts-ignore
        const exifData = window.EXIF.readFromBinaryFile(imgElement);
        if (exifData && exifData.DateTime) {
          return exifData.DateTime;
        }
      }
    } catch (error) {
      console.log('Could not extract EXIF data:', error);
    }
    return undefined;
  };

  const handleAddImages = async () => {
    const imagePaths = await (window as any).electronAPI.selectImages();
    
    if (imagePaths && imagePaths.length > 0) {
      const newImages: ImageData[] = [];
      
      for (const path of imagePaths) {
        const imageData = await (window as any).electronAPI.readImage(path);
        if (imageData) {
          const img = new Image();
          const thumbnailSrc = `data:image/jpeg;base64,${imageData.buffer}`;
          
          img.onload = () => {
            const exifDate = extractEXIFDate(img);
            console.log('EXIF Date for', imageData.name, ':', exifDate);
          };
          img.src = thumbnailSrc;
          
          newImages.push({
            id: Date.now().toString() + Math.random(),
            path: imageData.path,
            name: imageData.name,
            buffer: imageData.buffer,
            rotation: 0,
            comment: '',
            thumbnail: thumbnailSrc,
            exifDate: undefined
          });
        }
      }
      
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleRotateImage = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, rotation: (img.rotation + 90) % 360 }
        : img
    ));
  };

  const handleRemoveImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setImages(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    setImages(newImages);
  };

  const handleCommentChange = (imageId: string, comment: string) => {
    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, comment } : img
    ));
  };

  const handleEditImage = (image: ImageData) => {
    setSelectedImage(image);
    setShowEditor(true);
  };

  const handleSaveEdit = (editedBuffer: string) => {
    if (selectedImage) {
      setImages(prev => prev.map(img =>
        img.id === selectedImage.id
          ? { ...img, editedBuffer, thumbnail: `data:image/jpeg;base64,${editedBuffer}` }
          : img
      ));
    }
    setShowEditor(false);
    setSelectedImage(null);
  };

  const handleResetImage = (imageId: string) => {
    const confirmed = window.confirm('Are you sure you want to reset this image to original? All edits will be lost.');
    if (confirmed) {
      setImages(prev => prev.map(img =>
        img.id === imageId
          ? { 
              ...img, 
              editedBuffer: undefined, 
              rotation: 0,
              thumbnail: `data:image/jpeg;base64,${img.buffer}`
            }
          : img
      ));
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '18px' }}>Images ({images.length})</h3>
        <button className="btn btn-primary" onClick={handleAddImages}>
          ➕ Add Images
        </button>
      </div>

      {images.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          border: '2px dashed #333',
          borderRadius: '8px'
        }}>
          <p>No images added yet. Click "Add Images" to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflow: 'auto' }}>
          {images.map((image, index) => (
            <div 
              key={image.id}
              className="card"
              style={{ 
                display: 'flex', 
                gap: '15px',
                padding: '15px',
                background: '#1f1f1f'
              }}
            >
              <div style={{ 
                width: '150px', 
                height: '100px',
                flexShrink: 0,
                border: '2px solid #333',
                borderRadius: '6px',
                overflow: 'hidden',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={image.thumbnail}
                  alt={image.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    transform: `rotate(${image.rotation}deg)`,
                    objectFit: 'contain'
                  }}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <strong>{index + 1}. {image.name}</strong>
                  {image.editedBuffer && (
                    <span style={{ 
                      color: '#1f6aa5', 
                      fontSize: '12px',
                      background: '#1f1f1f',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #1f6aa5'
                    }}>
                      ✏️ Edited
                    </span>
                  )}
                  {image.exifDate && (
                    <span style={{ 
                      color: '#888', 
                      fontSize: '11px'
                    }}>
                      📅 {image.exifDate}
                    </span>
                  )}
                </div>
                
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    value={image.comment}
                    onChange={(e) => handleCommentChange(image.id, e.target.value)}
                    placeholder="Add a comment for this image"
                    style={{ fontSize: '12px', padding: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => handleRotateImage(image.id)}
                  >
                    🔄 Rotate
                  </button>
                  <button 
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => handleEditImage(image)}
                  >
                    ✏️ Edit
                  </button>
                  {(image.editedBuffer || image.rotation !== 0) && (
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => handleResetImage(image.id)}
                    >
                      ↺ Reset
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    ↑ Up
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => handleMoveDown(index)}
                    disabled={index === images.length - 1}
                  >
                    ↓ Down
                  </button>
                  <button 
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && selectedImage && (
        <ImageEditor
          image={selectedImage}
          onSave={handleSaveEdit}
          onClose={() => {
            setShowEditor(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
});

export default ImageManager;
