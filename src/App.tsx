import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/Map';
import { BlocoDetailPanel } from './components/BlocoDetail';
import { DateDistributionChart } from './components/Stats';
import { useBlocos, useFilters, useCameras, useCamerasProximas } from './hooks';
import type { Bloco } from './types/bloco';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

function App() {
  const { blocos, loading, error, usandoMock, recarregar } = useBlocos();
  const { todasCameras } = useCameras();
  const {
    filtros,
    setFiltros,
    blocosFiltrados,
    estatisticas,
    datasDisponiveis,
  } = useFilters(blocos);

  const [blocoSelecionado, setBlocoSelecionado] = useState<Bloco | null>(null);

  // Filtrar câmeras próximas ao bloco selecionado (raio de 100m)
  const camerasProximas = useCamerasProximas(todasCameras, blocoSelecionado, 100);

  const handleSelectBloco = useCallback((bloco: Bloco) => {
    setBlocoSelecionado(bloco);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setBlocoSelecionado(null);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-cor-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-cor-accent-orange animate-spin" />
          <p className="text-white/70">Carregando blocos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-cor-bg-primary flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <Header
          estatisticas={estatisticas}
          totalBlocosOriginal={blocos.length}
        />
      </div>

      {/* Warning banner se usando mock */}
      {(usandoMock || error) && (
        <div className="flex-shrink-0 bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-500 text-sm">
            <AlertCircle size={16} />
            <span>
              {error || 'Usando dados de demonstracao. Coloque o arquivo Excel em /public/data/PLANILHACOMPLETABLOCOS2026.xlsx'}
            </span>
          </div>
          <button
            onClick={recarregar}
            className="flex items-center gap-1 text-amber-500 hover:text-amber-400 text-sm transition-colors"
          >
            <RefreshCw size={14} />
            Recarregar
          </button>
        </div>
      )}

      {/* Main Content - flex-1 com min-h-0 para permitir scroll */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar */}
        <Sidebar
          blocos={blocosFiltrados}
          blocoSelecionado={blocoSelecionado}
          onSelectBloco={handleSelectBloco}
          filtros={filtros}
          onFiltrosChange={setFiltros}
          datasDisponiveis={datasDisponiveis}
        />

        {/* Map Area */}
        <main className="flex-1 relative min-w-0">
          <MapView
            blocos={blocosFiltrados}
            blocoSelecionado={blocoSelecionado}
            onSelectBloco={handleSelectBloco}
            camerasProximas={camerasProximas}
          />

          {/* Painel de detalhes do bloco */}
          <BlocoDetailPanel
            bloco={blocoSelecionado}
            onClose={handleCloseDetail}
          />
        </main>
      </div>

      {/* Footer com grafico de distribuicao */}
      <div className="flex-shrink-0">
        <DateDistributionChart blocos={blocosFiltrados} />
      </div>
    </div>
  );
}

export default App;
