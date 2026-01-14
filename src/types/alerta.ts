import type { Bloco } from './bloco';

export type AlertaPrioridade = 'alta' | 'media' | 'baixa';
export type AlertaTipo = 'concentracao' | 'inicio' | 'termino';

export interface AlertaBloco {
  id: string;
  blocoId: number;
  bloco: Bloco;
  tipo: AlertaTipo;
  minutosRestantes: number;
  prioridade: AlertaPrioridade;
  timestamp: Date;
  confirmado: boolean;
  confirmadoPor?: string;
  confirmadoEm?: Date;
}

export interface AlertaConfig {
  minutosAntecedencia: number;
  somAtivado: boolean;
  thresholdPublicoAlta: number;
  thresholdPublicoMedia: number;
}

export const DEFAULT_ALERTA_CONFIG: AlertaConfig = {
  minutosAntecedencia: 15,
  somAtivado: true,
  thresholdPublicoAlta: 50000,
  thresholdPublicoMedia: 10000,
};
