import React, { useRef, useState } from 'react';
import { Camera, X, ZoomIn } from 'lucide-react';
import './PhotoSection.css';

interface PhotoSectionProps {
  existingPhotos: string[];
  newPhotos: string[];
  onExistingPhotosChange: (photos: string[]) => void;
  onNewPhotosChange: (photos: string[]) => void;
}

const MAX_PHOTOS = 5;

// V3-21: Photo upload section with small tiles that enlarge on hover
export const PhotoSection: React.FC<PhotoSectionProps> = ({
  existingPhotos,
  newPhotos,
  onExistingPhotosChange,
  onNewPhotosChange,
}) => {
  const existingInputRef = useRef<HTMLInputElement>(null);
  const newInputRef = useRef<HTMLInputElement>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    currentPhotos: string[],
    onChange: (photos: string[]) => void
  ) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = MAX_PHOTOS - currentPhotos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          onChange([...currentPhotos, base64]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    event.target.value = '';
  };

  const handleRemovePhoto = (
    index: number,
    currentPhotos: string[],
    onChange: (photos: string[]) => void
  ) => {
    const newPhotoList = currentPhotos.filter((_, i) => i !== index);
    onChange(newPhotoList);
  };

  const renderPhotoGrid = (
    photos: string[],
    inputRef: React.RefObject<HTMLInputElement | null>,
    onChange: (photos: string[]) => void,
    label: string
  ) => {
    const emptySlots = MAX_PHOTOS - photos.length;

    return (
      <div className="photo-group">
        <h3 className="photo-group-title">{label}</h3>
        <div className="photo-grid">
          {/* Existing photos */}
          {photos.map((photo, index) => (
            <div key={index} className="photo-tile">
              <img src={photo} alt={`${label} ${index + 1}`} />
              <div className="photo-overlay">
                <button
                  className="photo-action-btn zoom"
                  onClick={() => setEnlargedPhoto(photo)}
                  title="Vergrößern"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  className="photo-action-btn remove"
                  onClick={() => handleRemovePhoto(index, photos, onChange)}
                  title="Entfernen"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {/* Empty slots with upload capability */}
          {emptySlots > 0 && (
            <div 
              className="photo-tile photo-tile-empty"
              onClick={() => inputRef.current?.click()}
            >
              <Camera size={24} />
              <span>Foto hinzufügen</span>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="photo-input-hidden"
          onChange={(e) => handleFileSelect(e, photos, onChange)}
        />
      </div>
    );
  };

  return (
    <section className="card photo-section">
      <h2 className="card-title">Fotos</h2>
      
      <div className="photo-groups">
        {renderPhotoGrid(
          existingPhotos,
          existingInputRef,
          onExistingPhotosChange,
          'Fotos Leuchten Bestand'
        )}
        
        {renderPhotoGrid(
          newPhotos,
          newInputRef,
          onNewPhotosChange,
          'Fotos Leuchten Neu'
        )}
      </div>

      {/* Enlarged photo modal */}
      {enlargedPhoto && (
        <div className="photo-modal" onClick={() => setEnlargedPhoto(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={enlargedPhoto} alt="Vergrößertes Foto" />
            <button 
              className="photo-modal-close"
              onClick={() => setEnlargedPhoto(null)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
