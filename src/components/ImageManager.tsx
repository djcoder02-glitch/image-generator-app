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
    if (window.confirm('Remove this image?')) {
      setImages(prev => prev.filter(img => img.id !== imageId));
    }
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
    if (window.confirm('Reset this image to original?')) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ marginBottom: 0 }}>Images ({images.length})</h3>
        <button className="btn btn-primary" onClick={handleAddImages}>
          Add Images
        </button>
      </div>

      {images.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No images added</div>
          <div className="empty-state-text">Click "Add Images" to get started</div>
        </div>
      ) : (
        <div className="image-grid">
          {images.map((image, index) => (
            <div key={image.id} className="image-card">
              <div className="image-card-thumbnail">
                <img
                  src={image.thumbnail}
                  alt={image.name}
                  style={{
                    transform: `rotate(${image.rotation}deg)`,
                  }}
                />
                <div className="image-card-badge">#{index + 1}</div>
                {image.editedBuffer && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    background: '#28a745',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    Edited
                  </div>
                )}
              </div>

              <div className="image-card-content">
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: '500', 
                  color: '#333',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {image.name}
                </div>
                
                <div className="input-group" style={{ marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={image.comment}
                    onChange={(e) => handleCommentChange(image.id, e.target.value)}
                    placeholder="Comment"
                    style={{ fontSize: '12px', padding: '6px 8px' }}
                  />
                </div>

                <div className="image-card-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEditImage(image)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleRotateImage(image.id)}
                  >
                    ↻
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === images.length - 1}
                  >
                    ↓
                  </button>
                  {(image.editedBuffer || image.rotation !== 0) && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleResetImage(image.id)}
                      style={{ width: '100%' }}
                    >
                      Reset
                    </button>
                  )}
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleRemoveImage(image.id)}
                    style={{ width: '100%' }}
                  >
                    Remove
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
