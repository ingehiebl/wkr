import React, { useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
}

// C01: Header mit Hover-Upload-Verhalten
export const Header: React.FC<HeaderProps> = ({ logo, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <TrendingUp className="header-icon" />
          <span className="header-title">Wirtschaftlichkeitsrechner</span>
        </div>
        
        {/* C01: Upload-Bereich mit Hover-Verhalten */}
        <div 
          className="header-logo-area"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          {/* Logo-Vorschau wenn vorhanden */}
          {logo && (
            <img src={logo} alt="Firmenlogo" className="header-logo" />
          )}
          
          {/* C01: Upload-Feld erscheint bei Hover */}
          {(isHovering || !logo) && (
            <div className="header-upload-overlay">
              <span className="upload-label">Logo upload</span>
              <button 
                className="btn-browse"
                onClick={handleBrowseClick}
                type="button"
              >
                Durchsuchen
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
