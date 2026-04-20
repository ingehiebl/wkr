import React from 'react';
import type { ExistingLuminaire, LampType, FlameCount } from '../../types';
import { calculateExistingLuminaire } from '../../utils/calculations';
import { Plus, Trash2 } from 'lucide-react';
import { createEmptyExistingLuminaire, LAMP_TYPE_OPTIONS, FLAME_COUNT_OPTIONS, LAMP_POWER_LOOKUP } from '../../constants';
import { formatNumber } from '../../utils/calculations';
import './ExistingLuminaireTable.css';

interface ExistingLuminaireTableProps {
  luminaires: ExistingLuminaire[];
  onLuminairesChange: (luminaires: ExistingLuminaire[]) => void;
}

// V3-04/V3-05/V3-06: Updated column order, 3/4-flammig support, kW display
export const ExistingLuminaireTable: React.FC<ExistingLuminaireTableProps> = ({
  luminaires,
  onLuminairesChange,
}) => {
  const handleAddLuminaire = () => {
    onLuminairesChange([...luminaires, createEmptyExistingLuminaire()]);
  };

  const handleRemoveLuminaire = (id: string) => {
    onLuminairesChange(luminaires.filter((l) => l.id !== id));
  };

  const handleLuminaireChange = (
    id: string, 
    field: keyof ExistingLuminaire, 
    value: number | LampType | FlameCount
  ) => {
    onLuminairesChange(
      luminaires.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      )
    );
  };

  const calculatedLuminaires = luminaires.map((l) => calculateExistingLuminaire(l));

  const totalPowerW = calculatedLuminaires.reduce(
    (sum, l) => sum + l.totalPowerW,
    0
  );
  
  // V3-06: Convert to kW
  const totalPowerKw = totalPowerW / 1000;

  return (
    <section className="card luminaire-section existing">
      <h2 className="card-title">Leuchten – Bestand</h2>

      {/* V3-05: Column order changed - Lampentyp/Länge first, then Stück */}
      <div className="table-container">
        <table className="data-table existing-luminaire-table">
          <thead>
            <tr>
              <th>Lampentyp / Länge</th>
              <th>Stück</th>
              <th className="calculated">Leistung (W)</th>
              <th>Bestückung</th>
              <th className="calculated col-narrow">Gesamtleistung (kW)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {calculatedLuminaires.map((lum) => (
              <tr key={lum.id}>
                {/* V3-05: Lampentyp/Länge now first */}
                <td>
                  <select
                    value={lum.lampType}
                    onChange={(e) =>
                      handleLuminaireChange(lum.id, 'lampType', e.target.value as LampType)
                    }
                    className="lamp-type-select"
                  >
                    {LAMP_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    value={lum.quantity}
                    onChange={(e) =>
                      handleLuminaireChange(lum.id, 'quantity', Number(e.target.value))
                    }
                    min={1}
                    className="quantity-input"
                  />
                </td>
                <td className="calculated power-cell">
                  {LAMP_POWER_LOOKUP[lum.lampType]}
                </td>
                <td>
                  {/* V3-04: Now includes 3-flammig and 4-flammig */}
                  <select
                    value={lum.flameCount}
                    onChange={(e) =>
                      handleLuminaireChange(lum.id, 'flameCount', Number(e.target.value) as FlameCount)
                    }
                    className="flame-count-select"
                  >
                    {FLAME_COUNT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                {/* V3-06: Display in kW */}
                <td className="calculated total-power-cell col-narrow">
                  {formatNumber(lum.totalPowerW / 1000, 3)}
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
              <td colSpan={4}><strong>Summe</strong></td>
              {/* V3-06: Total in kW */}
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
