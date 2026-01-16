import { useState, useCallback } from 'react';
import type { Bloco } from '../types/bloco';
import type { Coordenada, RotaInfo, OrigemUsuario } from '../types/rota';
import type { WazeAlert } from '../types/waze';
import { calcularRota } from '../services/openRouteService';
import { geocodificarEndereco } from '../services/nominatimService';
import { filtrarAlertasNaRota } from '../services/wazeService';

interface RotaState {
  origem: OrigemUsuario | null;
  rotaAtiva: RotaInfo | null;
  carregando: boolean;
  erro: string | null;
}

export function useRota(alertasWaze: WazeAlert[]) {
  const [state, setState] = useState<RotaState>({
    origem: null,
    rotaAtiva: null,
    carregando: false,
    erro: null
  });

  // Definir origem por GPS
  const definirOrigemGPS = useCallback((coordenadas: Coordenada) => {
    setState(prev => ({
      ...prev,
      origem: {
        tipo: 'gps',
        coordenadas
      },
      erro: null
    }));
  }, []);

  // Definir origem por endereço
  const definirOrigemEndereco = useCallback(async (endereco: string) => {
    setState(prev => ({ ...prev, carregando: true, erro: null }));

    const resultado = await geocodificarEndereco(endereco);

    if (!resultado.sucesso) {
      const mensagensErro = {
        nao_encontrado: 'Endereço não encontrado. Tente ser mais específico.',
        erro_rede: 'Erro de conexão. Use o GPS ou tente novamente.',
        erro_servidor: 'Serviço indisponível. Use o GPS ou tente mais tarde.'
      };

      setState(prev => ({
        ...prev,
        carregando: false,
        erro: mensagensErro[resultado.erro]
      }));
      return false;
    }

    setState(prev => ({
      ...prev,
      origem: {
        tipo: 'endereco',
        coordenadas: resultado.dados.coordenadas,
        endereco: resultado.dados.enderecoCompleto
      },
      carregando: false,
      erro: null
    }));

    return true;
  }, []);

  // Calcular rota até um bloco
  const calcularRotaParaBloco = useCallback(async (bloco: Bloco) => {
    if (!state.origem) {
      setState(prev => ({
        ...prev,
        erro: 'Defina uma origem primeiro'
      }));
      return null;
    }

    setState(prev => ({ ...prev, carregando: true, erro: null }));

    try {
      const destino: Coordenada = {
        lat: bloco.lat,
        lng: bloco.lng
      };

      const resultado = await calcularRota(state.origem.coordenadas, destino);

      // Filtrar alertas que estão na rota
      const alertasNaRota = filtrarAlertasNaRota(alertasWaze, resultado.polyline);

      const rotaInfo: RotaInfo = {
        origem: state.origem.coordenadas,
        destino,
        blocoDestino: bloco,
        distanciaKm: resultado.distanciaKm,
        duracaoMinutos: resultado.duracaoMinutos,
        polyline: resultado.polyline,
        instrucoes: resultado.instrucoes,
        alertasNaRota
      };

      setState(prev => ({
        ...prev,
        rotaAtiva: rotaInfo,
        carregando: false,
        erro: null
      }));

      return rotaInfo;
    } catch (error) {
      setState(prev => ({
        ...prev,
        carregando: false,
        erro: error instanceof Error ? error.message : 'Erro ao calcular rota'
      }));
      return null;
    }
  }, [state.origem, alertasWaze]);

  // Limpar rota
  const limparRota = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotaAtiva: null
    }));
  }, []);

  // Limpar origem
  const limparOrigem = useCallback(() => {
    setState({
      origem: null,
      rotaAtiva: null,
      carregando: false,
      erro: null
    });
  }, []);

  return {
    ...state,
    definirOrigemGPS,
    definirOrigemEndereco,
    calcularRotaParaBloco,
    limparRota,
    limparOrigem
  };
}
