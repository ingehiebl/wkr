import React, { useRef } from 'react';
import { TrendingUp, Upload } from 'lucide-react';
import './Header.css';

interface HeaderProps {
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ logo, onLogoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
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
        
        <div className="header-logo-area" onClick={handleLogoClick}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {logo ? (
            <img src={logo} alt="Firmenlogo" className="header-logo" />
          ) : (
            <div className="header-logo-placeholder">
              <Upload size={16} />
              <span>Logo hochladen</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
