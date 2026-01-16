import { useState, useEffect, useCallback, useRef } from 'react';
import type { WazeAlert } from '../types/waze';
import { buscarAlertasWaze } from '../services/wazeService';

interface WazeAlertsState {
  alertas: WazeAlert[];
  carregando: boolean;
  erro: string | null;
  ultimaAtualizacao: Date | null;
}

const INTERVALO_ATUALIZACAO = 5 * 60 * 1000; // 5 minutos

export function useWazeAlerts(ativo: boolean = true) {
  const [state, setState] = useState<WazeAlertsState>({
    alertas: [],
    carregando: false,
    erro: null,
    ultimaAtualizacao: null
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buscarAlertas = useCallback(async () => {
    setState(prev => ({ ...prev, carregando: true, erro: null }));

    try {
      const alertas = await buscarAlertasWaze();
      setState({
        alertas,
        carregando: false,
        erro: null,
        ultimaAtualizacao: new Date()
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        carregando: false,
        erro: error instanceof Error ? error.message : 'Erro ao buscar alertas'
      }));
    }
  }, []);

  // Buscar alertas inicialmente e configurar intervalo
  useEffect(() => {
    if (!ativo) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Buscar imediatamente
    buscarAlertas();

    // Configurar intervalo de atualização
    intervalRef.current = setInterval(buscarAlertas, INTERVALO_ATUALIZACAO);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [ativo, buscarAlertas]);

  const atualizar = useCallback(() => {
    buscarAlertas();
  }, [buscarAlertas]);

  return {
    ...state,
    atualizar
  };
}
