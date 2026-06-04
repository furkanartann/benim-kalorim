import { useState } from 'react';
import { X, Info } from 'lucide-react';
import type { FoodCategory } from '../interfaces';

interface LibraryFoodModalProps {
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: FoodCategory;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: number;
    servingUnit: string;
  }) => void;
}

export function LibraryFoodModal({ onClose, onSave }: LibraryFoodModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('diğer');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !calories || !servingSize || !servingUnit) {
      setError('Lütfen yıldızlı (*) tüm zorunlu alanları doldurun.');
      return;
    }
    if (isNaN(Number(calories)) || Number(calories) < 0) {
      setError('Geçerli bir kalori değeri girin.');
      return;
    }
    if (isNaN(Number(servingSize)) || Number(servingSize) <= 0) {
      setError('Geçerli bir porsiyon boyutu girin.');
      return;
    }
    onSave({
      name: name.trim(),
      category,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      servingSize: Number(servingSize),
      servingUnit: servingUnit.trim(),
    });
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-label="Yeni Besin Tanımla">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">📚 Yeni Besin Tanımla</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Kütüphaneye sık kullandığınız bir besini ekleyin
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
          
          <div className="input-group">
            <label className="input-label">Besin Adı *</label>
            <input type="text" className="input-field" placeholder="Örn: Haşlanmış Tavuk Göğsü" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="input-group">
              <label className="input-label">Kategori</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value as FoodCategory)}>
                <option value="protein">🥩 Protein</option>
                <option value="karbonhidrat">🍞 Karbonhidrat</option>
                <option value="sağlıklı-yağ">🥑 Sağlıklı Yağ</option>
                <option value="meyve-sebze">🥦 Meyve/Sebze</option>
                <option value="süt-ürünü">🥛 Süt Ürünü</option>
                <option value="içecek">🥤 İçecek</option>
                <option value="atıştırmalık">🍪 Atıştırmalık</option>
                <option value="diğer">🍽️ Diğer</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Kalori (kcal) *</label>
              <input type="number" min="0" className="input-field" placeholder="0" value={calories} onChange={e => setCalories(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="input-group">
              <label className="input-label">Servis Büyüklüğü *</label>
              <input type="number" min="0.1" step="any" className="input-field" placeholder="100" value={servingSize} onChange={e => setServingSize(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">Servis Birimi *</label>
              <select 
                className="input-field" 
                value={servingUnit} 
                onChange={e => {
                  const unit = e.target.value;
                  setServingUnit(unit);
                  if (unit === 'g' || unit === 'ml') {
                    setServingSize('100');
                  } else {
                    setServingSize('1');
                  }
                }}
              >
                <option value="g">g (Gram)</option>
                <option value="adet">adet (Adet/Tane)</option>
                <option value="ml">ml (Mililitre)</option>
                <option value="porsiyon">porsiyon (Porsiyon)</option>
                <option value="yemek kaşığı">yemek kaşığı</option>
                <option value="fincan">fincan</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-2">
              <Info size={12} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Makrolar (gram)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="input-group">
                <label className="input-label" style={{ color: '#00C853' }}>Protein</label>
                <input type="number" min="0" step="0.1" className="input-field" placeholder="0" value={protein} onChange={e => setProtein(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ color: '#3b82f6' }}>Karb.</label>
                <input type="number" min="0" step="0.1" className="input-field" placeholder="0" value={carbs} onChange={e => setCarbs(e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ color: '#f59e0b' }}>Yağ</label>
                <input type="number" min="0" step="0.1" className="input-field" placeholder="0" value={fat} onChange={e => setFat(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>İptal</button>
            <button type="submit" className="btn-primary flex-1">Kütüphaneye Ekle</button>
          </div>
        </form>
      </div>
    </div>
  );
}
