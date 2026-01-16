import { useState, useCallback, useRef } from 'react';
import type { Coordenada } from '../types/rota';

interface GeolocationState {
  coordenadas: Coordenada | null;
  erro: string | null;
  carregando: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordenadas: null,
    erro: null,
    carregando: false
  });

  const tentativasRef = useRef(0);
  const maxTentativas = 3;

  const obterLocalizacao = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        erro: 'Geolocalização não suportada pelo navegador'
      }));
      return;
    }

    // Verificar se está em contexto seguro (HTTPS) - necessário para GPS em mobile
    if (window.isSecureContext === false) {
      setState(prev => ({
        ...prev,
        erro: 'GPS requer conexão segura (HTTPS)'
      }));
      return;
    }

    setState(prev => ({ ...prev, carregando: true, erro: null }));
    tentativasRef.current = 0;

    const tentarObterLocalizacao = (usarAltaPrecisao: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            coordenadas: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            erro: null,
            carregando: false
          });
          tentativasRef.current = 0;
        },
        (error) => {
          tentativasRef.current++;

          // Se timeout e ainda tem tentativas, tentar sem alta precisão
          if (error.code === error.TIMEOUT && tentativasRef.current < maxTentativas) {
            // Na segunda tentativa, desabilitar alta precisão (mais rápido em mobile)
            tentarObterLocalizacao(false);
            return;
          }

          let mensagem = 'Erro ao obter localização';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensagem = 'Permissão de localização negada. Verifique as configurações do navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              mensagem = 'Localização indisponível. Verifique se o GPS está ativado.';
              break;
            case error.TIMEOUT:
              mensagem = 'Tempo esgotado. Tente novamente em local com melhor sinal.';
              break;
          }
          setState({
            coordenadas: null,
            erro: mensagem,
            carregando: false
          });
          tentativasRef.current = 0;
        },
        {
          enableHighAccuracy: usarAltaPrecisao,
          timeout: usarAltaPrecisao ? 15000 : 30000, // Mais tempo sem alta precisão
          maximumAge: 60000
        }
      );
    };

    // Começar com alta precisão
    tentarObterLocalizacao(true);
  }, []);

  const limpar = useCallback(() => {
    setState({
      coordenadas: null,
      erro: null,
      carregando: false
    });
  }, []);

  return {
    ...state,
    obterLocalizacao,
    limpar
  };
}
