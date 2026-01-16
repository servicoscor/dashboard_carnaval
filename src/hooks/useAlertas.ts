import { useState, useEffect, useCallback, useRef } from 'react';
import type { Bloco } from '../types/bloco';
import type { AlertaBloco, AlertaConfig, AlertaPrioridade } from '../types/alerta';
import { DEFAULT_ALERTA_CONFIG } from '../types/alerta';
import { blocoIniciando, getBrasiliaTime } from '../utils/formatters';

function calcularPrioridade(publico: number, config: AlertaConfig): AlertaPrioridade {
  if (publico >= config.thresholdPublicoAlta) return 'alta';
  if (publico >= config.thresholdPublicoMedia) return 'media';
  return 'baixa';
}

export function useAlertas(blocos: Bloco[], config: AlertaConfig = DEFAULT_ALERTA_CONFIG) {
  const [alertas, setAlertas] = useState<AlertaBloco[]>([]);
  const [alertasConfirmados, setAlertasConfirmados] = useState<Set<string>>(new Set());
  const [blocoIniciandoPopup, setBlocoIniciandoPopup] = useState<Bloco | null>(null);
  const [popupsExibidos, setPopupsExibidos] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Extrair valores primitivos do config para evitar loop infinito
  // (o objeto config pode ser recriado a cada render)
  const {
    minutosAntecedencia,
    somAtivado,
    thresholdPublicoAlta,
    thresholdPublicoMedia,
  } = config;

  // Carregar confirmados do localStorage
  useEffect(() => {
    const hoje = new Date().toDateString();
    const saved = localStorage.getItem('alertas-confirmados-' + hoje);
    if (saved) {
      try {
        setAlertasConfirmados(new Set(JSON.parse(saved)));
      } catch {
        // Ignore parse errors
      }
    }
    // Carregar popups já exibidos
    const savedPopups = localStorage.getItem('popups-exibidos-' + hoje);
    if (savedPopups) {
      try {
        setPopupsExibidos(new Set(JSON.parse(savedPopups)));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Verificar blocos a cada minuto
  useEffect(() => {
    const checkAlertas = () => {
      const agora = getBrasiliaTime();
      const hoje = agora.toISOString().split('T')[0]; // "2026-02-14"

      const blocosHoje = blocos.filter(b => b.data === hoje);
      const novosAlertas: AlertaBloco[] = [];

      blocosHoje.forEach(bloco => {
        if (!bloco.horaInicio) return;

        const [hora, minuto] = bloco.horaInicio.split(':').map(Number);
        const inicioBloco = new Date(agora);
        inicioBloco.setHours(hora, minuto, 0, 0);

        const diffMinutos = Math.floor((inicioBloco.getTime() - agora.getTime()) / 60000);
        const alertaId = `${bloco.id}-${hoje}-inicio`;

        // Se está dentro da janela de alerta e não foi confirmado
        if (diffMinutos > 0 && diffMinutos <= minutosAntecedencia) {
          if (!alertasConfirmados.has(alertaId)) {
            novosAlertas.push({
              id: alertaId,
              blocoId: bloco.id,
              bloco,
              tipo: 'inicio',
              minutosRestantes: diffMinutos,
              prioridade: calcularPrioridade(bloco.publicoEstimado || 0, { thresholdPublicoAlta, thresholdPublicoMedia } as AlertaConfig),
              timestamp: new Date(),
              confirmado: false,
            });
          }
        }

        // Alerta de concentração (se houver horaConcentracao)
        if (bloco.horaConcentracao) {
          const [horaConc, minConc] = bloco.horaConcentracao.split(':').map(Number);
          const concentracaoBloco = new Date(agora);
          concentracaoBloco.setHours(horaConc, minConc, 0, 0);

          const diffConcentracao = Math.floor((concentracaoBloco.getTime() - agora.getTime()) / 60000);
          const alertaConcId = `${bloco.id}-${hoje}-concentracao`;

          if (diffConcentracao > 0 && diffConcentracao <= minutosAntecedencia) {
            if (!alertasConfirmados.has(alertaConcId)) {
              novosAlertas.push({
                id: alertaConcId,
                blocoId: bloco.id,
                bloco,
                tipo: 'concentracao',
                minutosRestantes: diffConcentracao,
                prioridade: calcularPrioridade(bloco.publicoEstimado || 0, { thresholdPublicoAlta, thresholdPublicoMedia } as AlertaConfig),
                timestamp: new Date(),
                confirmado: false,
              });
            }
          }
        }
      });

      // Ordenar por prioridade e tempo
      novosAlertas.sort((a, b) => {
        const prioridadeOrder = { alta: 0, media: 1, baixa: 2 };
        if (prioridadeOrder[a.prioridade] !== prioridadeOrder[b.prioridade]) {
          return prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade];
        }
        return a.minutosRestantes - b.minutosRestantes;
      });

      setAlertas(novosAlertas);

      // Tocar som se há alertas novos de alta prioridade
      if (somAtivado && novosAlertas.some(a => a.prioridade === 'alta')) {
        audioRef.current?.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    };

    checkAlertas();
    const interval = setInterval(checkAlertas, 60000); // A cada minuto

    return () => clearInterval(interval);
  }, [blocos, alertasConfirmados, minutosAntecedencia, somAtivado, thresholdPublicoAlta, thresholdPublicoMedia]);

  // Verificar blocos que estão iniciando AGORA (para popup)
  useEffect(() => {
    const checkBlocosIniciando = () => {
      const hoje = getBrasiliaTime().toISOString().split('T')[0];

      for (const bloco of blocos) {
        if (!bloco.data || !bloco.horaInicio) continue;

        const popupId = `popup-${bloco.id}-${hoje}`;

        // Se o bloco está iniciando agora e o popup ainda não foi exibido
        if (blocoIniciando(bloco.data, bloco.horaInicio, 1) && !popupsExibidos.has(popupId)) {
          setBlocoIniciandoPopup(bloco);

          // Tocar som de alerta
          if (somAtivado) {
            audioRef.current?.play().catch(() => {
              // Ignore autoplay errors
            });
          }
          break; // Mostrar apenas um popup por vez
        }
      }
    };

    checkBlocosIniciando();
    const interval = setInterval(checkBlocosIniciando, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [blocos, popupsExibidos, somAtivado]);

  const confirmarAlerta = useCallback((alertaId: string) => {
    setAlertasConfirmados(prev => {
      const newSet = new Set(prev);
      newSet.add(alertaId);
      const hoje = new Date().toDateString();
      localStorage.setItem(
        'alertas-confirmados-' + hoje,
        JSON.stringify([...newSet])
      );
      return newSet;
    });
  }, []);

  const confirmarTodos = useCallback(() => {
    const todosIds = alertas.map(a => a.id);
    setAlertasConfirmados(prev => {
      const newSet = new Set([...prev, ...todosIds]);
      const hoje = new Date().toDateString();
      localStorage.setItem(
        'alertas-confirmados-' + hoje,
        JSON.stringify([...newSet])
      );
      return newSet;
    });
  }, [alertas]);

  // Confirmar popup de bloco iniciando
  const confirmarPopupInicio = useCallback(() => {
    if (blocoIniciandoPopup) {
      const hoje = getBrasiliaTime().toISOString().split('T')[0];
      const popupId = `popup-${blocoIniciandoPopup.id}-${hoje}`;

      setPopupsExibidos(prev => {
        const newSet = new Set(prev);
        newSet.add(popupId);
        localStorage.setItem(
          'popups-exibidos-' + new Date().toDateString(),
          JSON.stringify([...newSet])
        );
        return newSet;
      });

      setBlocoIniciandoPopup(null);
    }
  }, [blocoIniciandoPopup]);

  const alertasPendentes = alertas.filter(a => !alertasConfirmados.has(a.id));
  const hasHighPriority = alertasPendentes.some(a => a.prioridade === 'alta');

  return {
    alertas,
    alertasPendentes,
    confirmarAlerta,
    confirmarTodos,
    totalPendentes: alertasPendentes.length,
    hasHighPriority,
    audioRef,
    // Novo: popup de bloco iniciando
    blocoIniciandoPopup,
    confirmarPopupInicio,
  };
}
