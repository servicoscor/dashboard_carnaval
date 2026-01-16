import { Calendar, MapPinned, Route, Map, Users } from 'lucide-react';
import type { Filtros } from '../../types/bloco';
import { ZONAS, SUBPREFEITURAS, TIPOS_APRESENTACAO, FAIXAS_PUBLICO } from '../../utils/constants';

interface FiltersProps {
  filtros: Filtros;
  onFiltrosChange: (filtros: Filtros) => void;
  datasDisponiveis: string[];
}

export function Filters({
  filtros,
  onFiltrosChange,
  datasDisponiveis,
}: FiltersProps) {
  const updateFiltro = <K extends keyof Filtros>(key: K, value: Filtros[K]) => {
    onFiltrosChange({ ...filtros, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Filtro por Data */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wide">
          <Calendar size={12} />
          Data
        </label>
        <select
          value={filtros.data}
          onChange={(e) => updateFiltro('data', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cor-accent-orange/50 focus:border-cor-accent-orange/50 transition-all cursor-pointer appearance-none"
        >
          <option value="hoje" className="bg-cor-bg-secondary">Hoje</option>
          <option value="todos" className="bg-cor-bg-secondary">Todas as datas</option>
          {datasDisponiveis.map((data) => (
            <option key={data} value={data} className="bg-cor-bg-secondary">
              {new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por Zona */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wide">
          <Map size={12} />
          Zona
        </label>
        <select
          value={filtros.zona}
          onChange={(e) => updateFiltro('zona', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cor-accent-orange/50 focus:border-cor-accent-orange/50 transition-all cursor-pointer appearance-none"
        >
          <option value="todos" className="bg-cor-bg-secondary">Todas</option>
          {ZONAS.map((zona) => (
            <option key={zona} value={zona} className="bg-cor-bg-secondary">
              {zona}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por Subprefeitura */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wide">
          <MapPinned size={12} />
          Subprefeitura
        </label>
        <select
          value={filtros.subprefeitura}
          onChange={(e) => updateFiltro('subprefeitura', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cor-accent-orange/50 focus:border-cor-accent-orange/50 transition-all cursor-pointer appearance-none"
        >
          <option value="todos" className="bg-cor-bg-secondary">Todas</option>
          {SUBPREFEITURAS.map((sub) => (
            <option key={sub} value={sub} className="bg-cor-bg-secondary">
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por Tipo */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wide">
          <Route size={12} />
          Tipo de Apresentacao
        </label>
        <select
          value={filtros.tipo}
          onChange={(e) => updateFiltro('tipo', e.target.value as Filtros['tipo'])}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cor-accent-orange/50 focus:border-cor-accent-orange/50 transition-all cursor-pointer appearance-none"
        >
          {Object.entries(TIPOS_APRESENTACAO).map(([key, label]) => (
            <option key={key} value={key} className="bg-cor-bg-secondary">
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por Publico */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-white/70 mb-1.5 uppercase tracking-wide">
          <Users size={12} />
          Publico Estimado
        </label>
        <select
          value={filtros.publico}
          onChange={(e) => updateFiltro('publico', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cor-accent-orange/50 focus:border-cor-accent-orange/50 transition-all cursor-pointer appearance-none"
        >
          {Object.entries(FAIXAS_PUBLICO).map(([key, faixa]) => (
            <option key={key} value={key} className="bg-cor-bg-secondary">
              {faixa.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
