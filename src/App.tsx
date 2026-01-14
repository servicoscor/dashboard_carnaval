import { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/Map';
import { BlocoDetailPanel } from './components/BlocoDetail';
import { DateDistributionChart } from './components/Stats';
import { useBlocos, useFilters, useCameras, useCamerasProximas, useResponsive } from './hooks';
import type { Bloco } from './types/bloco';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const TOUR_DURATION_SECONDS = 10;

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

  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile); // Aberto por padrão no desktop
  const [blocoSelecionado, setBlocoSelecionado] = useState<Bloco | null>(null);

  // Estado do Tour
  const [tourAtivo, setTourAtivo] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);
  const [tourBloco, setTourBloco] = useState<Bloco | null>(null);
  const [tempoRestante, setTempoRestante] = useState(TOUR_DURATION_SECONDS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filtrar câmeras próximas ao bloco selecionado (raio de 300m)
  const camerasProximas = useCamerasProximas(todasCameras, blocoSelecionado, 300);

  const handleSelectBloco = useCallback((bloco: Bloco) => {
    setBlocoSelecionado(bloco);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleCloseDetail = useCallback(() => {
    setBlocoSelecionado(null);
  }, []);

  // Selecionar data pelo gráfico de distribuição
  const handleSelectData = useCallback((data: string | null) => {
    setFiltros(prev => ({
      ...prev,
      data: data || 'todos'
    }));
  }, [setFiltros]);

  // Limpar timers do tour
  const limparTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Iniciar tour
  const handleTourStart = useCallback(() => {
    if (blocosFiltrados.length === 0) return;

    limparTimers();
    setTourAtivo(true);
    setTourIndex(0);
    setTourBloco(blocosFiltrados[0]);
    setBlocoSelecionado(blocosFiltrados[0]);
    setTempoRestante(TOUR_DURATION_SECONDS);
  }, [blocosFiltrados, limparTimers]);

  // Parar tour
  const handleTourStop = useCallback(() => {
    limparTimers();
    setTourAtivo(false);
    setTourBloco(null);
    setTempoRestante(TOUR_DURATION_SECONDS);
  }, [limparTimers]);

  // Próximo bloco do tour
  const handleTourNext = useCallback(() => {
    if (!tourAtivo || blocosFiltrados.length === 0) return;

    limparTimers();
    const nextIndex = (tourIndex + 1) % blocosFiltrados.length;
    setTourIndex(nextIndex);
    setTourBloco(blocosFiltrados[nextIndex]);
    setBlocoSelecionado(blocosFiltrados[nextIndex]);
    setTempoRestante(TOUR_DURATION_SECONDS);
  }, [tourAtivo, tourIndex, blocosFiltrados, limparTimers]);

  // Efeito para controlar o tour automático
  useEffect(() => {
    if (!tourAtivo || blocosFiltrados.length === 0) return;

    // Timer para próximo bloco
    timerRef.current = setTimeout(() => {
      handleTourNext();
    }, TOUR_DURATION_SECONDS * 1000);

    // Countdown
    countdownRef.current = setInterval(() => {
      setTempoRestante(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      limparTimers();
    };
  }, [tourAtivo, tourIndex, blocosFiltrados.length, handleTourNext, limparTimers]);

  // Resetar countdown quando muda de bloco
  useEffect(() => {
    if (tourAtivo) {
      setTempoRestante(TOUR_DURATION_SECONDS);
    }
  }, [tourIndex, tourAtivo]);

  // Parar tour se os blocos filtrados mudarem
  useEffect(() => {
    if (tourAtivo && blocosFiltrados.length === 0) {
      handleTourStop();
    }
  }, [blocosFiltrados.length, tourAtivo, handleTourStop]);

  // Estado do tour para passar ao Header
  const tourState = {
    ativo: tourAtivo,
    index: tourIndex,
    bloco: tourBloco,
    tempoRestante,
    totalBlocos: blocosFiltrados.length,
  };

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
          tourState={tourState}
          onTourStart={handleTourStart}
          onTourStop={handleTourStop}
          onTourNext={handleTourNext}
          isMobile={isMobile}
          onMenuClick={() => setSidebarOpen(true)}
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
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Sidebar - Drawer em mobile, colapsável em desktop */}
        <Sidebar
          blocos={blocosFiltrados}
          blocoSelecionado={blocoSelecionado}
          onSelectBloco={handleSelectBloco}
          filtros={filtros}
          onFiltrosChange={setFiltros}
          datasDisponiveis={datasDisponiveis}
          isMobile={isMobile}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(prev => isMobile ? false : !prev)}
        />

        {/* Map Area */}
        <main className="flex-1 relative min-w-0 flex flex-col">
          <div className="flex-1 relative">
            <MapView
              blocos={blocosFiltrados}
              blocoSelecionado={blocoSelecionado}
              onSelectBloco={handleSelectBloco}
              camerasProximas={camerasProximas}
            />

            {/* Painel de detalhes do bloco - Bottom Sheet em mobile */}
            <BlocoDetailPanel
              bloco={blocoSelecionado}
              onClose={handleCloseDetail}
              isMobile={isMobile}
            />
          </div>

          {/* Gráfico de distribuição - dentro do main, abaixo do mapa */}
          <div className="flex-shrink-0">
            <DateDistributionChart
              blocos={blocos}
              dataSelecionada={filtros.data !== 'todos' ? filtros.data : undefined}
              onSelectData={handleSelectData}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
