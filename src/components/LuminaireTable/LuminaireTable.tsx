import React from 'react';
import type { Luminaire, LuminaireDefaults } from '../../types';
import { calculateLuminaire } from '../../utils/calculations';
import { Plus, Trash2 } from 'lucide-react';
import { createEmptyLuminaire } from '../../constants';
import { formatNumber } from '../../utils/calculations';
import './LuminaireTable.css';

interface LuminaireTableProps {
  title: string;
  luminaires: Luminaire[];
  defaults: LuminaireDefaults;
  onLuminairesChange: (luminaires: Luminaire[]) => void;
  onDefaultsChange: (defaults: Partial<LuminaireDefaults>) => void;
}

// V4: Removed Lumenfaktor and Lumen columns entirely
export const LuminaireTable: React.FC<LuminaireTableProps> = ({
  title,
  luminaires,
  defaults,
  onLuminairesChange,
  onDefaultsChange,
}) => {
  const handleAddLuminaire = () => {
    onLuminairesChange([...luminaires, createEmptyLuminaire()]);
  };

  const handleRemoveLuminaire = (id: string) => {
    onLuminairesChange(luminaires.filter((l) => l.id !== id));
  };

  const handleLuminaireChange = (id: string, field: keyof Luminaire, value: string | number) => {
    onLuminairesChange(
      luminaires.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      )
    );
  };

  const calculatedLuminaires = luminaires.map((l) => calculateLuminaire(l, defaults));

  const totalPowerW = calculatedLuminaires.reduce(
    (sum, l) => sum + l.quantity * l.totalPowerW,
    0
  );
  
  const totalPowerKw = totalPowerW / 1000;

  return (
    <section className="card luminaire-section new">
      <h2 className="card-title">{title}</h2>

      {/* V4: Only Nutzungsdauer in defaults bar (Lumenfaktor removed) */}
      <div className="defaults-bar">
        <div className="form-group">
          <label className="form-label">Nutzungsdauer</label>
          <div className="input-with-unit">
            <input
              type="number"
              className="form-input"
              value={defaults.serviceLifeHours}
              onChange={(e) =>
                onDefaultsChange({ serviceLifeHours: Number(e.target.value) })
              }
              min={0}
            />
            <span className="input-unit">h</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table luminaire-table-new">
          <thead>
            <tr>
              <th>Leuchte</th>
              <th>Stück</th>
              <th>Leistung (W)</th>
              <th className="calculated col-narrow">Gesamtleistung (kW)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {calculatedLuminaires.map((lum) => (
              <tr key={lum.id}>
                <td>
                  <input
                    type="text"
                    value={lum.name}
                    onChange={(e) =>
                      handleLuminaireChange(lum.id, 'name', e.target.value)
                    }
                    placeholder="Bezeichnung..."
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={lum.quantity}
                    onChange={(e) =>
                      handleLuminaireChange(lum.id, 'quantity', Number(e.target.value))
                    }
                    min={1}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={lum.powerW}
                    onChange={(e) =>
                      handleLuminaireChange(lum.id, 'powerW', Number(e.target.value))
                    }
                    min={0}
                  />
                </td>
                <td className="calculated col-narrow">
                  {formatNumber((lum.quantity * lum.totalPowerW) / 1000, 3)}
                </td>
                <td>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleRemoveLuminaire(lum.id)}
                    title="Leuchte entfernen"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td colSpan={3}><strong>Summe</strong></td>
              <td className="calculated col-narrow"><strong>{formatNumber(totalPowerKw, 3)} kW</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <button className="btn btn-secondary" onClick={handleAddLuminaire}>
        <Plus size={16} />
        Leuchte hinzufügen
      </button>
    </section>
  );
};
