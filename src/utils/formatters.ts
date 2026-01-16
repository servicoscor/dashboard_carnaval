import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatarNumero(numero: number): string {
  return new Intl.NumberFormat('pt-BR').format(numero);
}

export function formatarData(data: string): string {
  if (!data) return '';
  try {
    const date = parseISO(data);
    return format(date, "dd/MM/yyyy (EEEE)", { locale: ptBR });
  } catch {
    return data;
  }
}

export function formatarDataCurta(data: string): string {
  if (!data) return '';
  try {
    const date = parseISO(data);
    return format(date, "dd/MM", { locale: ptBR });
  } catch {
    return data;
  }
}

export function formatarDiaSemana(data: string): string {
  if (!data) return '';
  try {
    const date = parseISO(data);
    return format(date, "EEEE", { locale: ptBR });
  } catch {
    return data;
  }
}

export function formatarHora(hora: string): string {
  if (!hora) return '--:--';
  // Remove segundos se existir
  const partes = hora.split(':');
  return `${partes[0]}:${partes[1]}`;
}

export function extrairPontosPercurso(percursoDetalhado: string): string[] {
  if (!percursoDetalhado) return [];
  // Separar por | ou /
  return percursoDetalhado
    .split(/[|\/]/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

export function normalizarBairro(bairro: string): string {
  return bairro
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function abreviarNome(nome: string, maxLength: number = 30): string {
  if (nome.length <= maxLength) return nome;
  return nome.substring(0, maxLength - 3) + '...';
}

// Obter horário atual de Brasília
export function getBrasiliaTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
}

// Verificar se um bloco já terminou baseado no horário de Brasília
export function blocoTerminou(data: string, horaTermino: string): boolean {
  if (!data || !horaTermino) return false;

  const now = getBrasiliaTime();
  const hoje = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Se a data do bloco é anterior a hoje, já terminou
  if (data < hoje) return true;

  // Se a data do bloco é posterior a hoje, ainda não terminou
  if (data > hoje) return false;

  // Se é hoje, verificar o horário
  const [horaFim, minFim] = horaTermino.split(':').map(Number);
  const horaAtual = now.getHours();
  const minAtual = now.getMinutes();

  // Se passou do horário de término
  if (horaAtual > horaFim) return true;
  if (horaAtual === horaFim && minAtual >= minFim) return true;

  return false;
}

// Verificar se um bloco está acontecendo agora (em andamento)
export function blocoEmAndamento(data: string, horaInicio: string, horaTermino: string): boolean {
  if (!data || !horaInicio || !horaTermino) return false;

  const now = getBrasiliaTime();
  const hoje = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Só pode estar em andamento se for hoje
  if (data !== hoje) return false;

  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFim, minFim] = horaTermino.split(':').map(Number);
  const horaAtual = now.getHours();
  const minAtual = now.getMinutes();

  // Verificar se está entre o início e o término
  const aposInicio = horaAtual > horaIni || (horaAtual === horaIni && minAtual >= minIni);
  const antesTermino = horaAtual < horaFim || (horaAtual === horaFim && minAtual < minFim);

  return aposInicio && antesTermino;
}

// Verificar se um bloco é de hoje
export function blocoHoje(data: string): boolean {
  if (!data) return false;
  const now = getBrasiliaTime();
  const hoje = now.toISOString().split('T')[0]; // YYYY-MM-DD
  return data === hoje;
}

// Verificar se um bloco está prestes a iniciar (dentro de X minutos)
export function blocoIniciando(data: string, horaInicio: string, minutosTolerancia: number = 1): boolean {
  if (!data || !horaInicio) return false;

  const now = getBrasiliaTime();
  const hoje = now.toISOString().split('T')[0];

  if (data !== hoje) return false;

  const [hora, minuto] = horaInicio.split(':').map(Number);
  const inicioBloco = new Date(now);
  inicioBloco.setHours(hora, minuto, 0, 0);

  const diffMinutos = (inicioBloco.getTime() - now.getTime()) / 60000;

  // Retorna true se o bloco vai iniciar nos próximos X minutos (ou acabou de iniciar há menos de 1 minuto)
  return diffMinutos >= -1 && diffMinutos <= minutosTolerancia;
}
