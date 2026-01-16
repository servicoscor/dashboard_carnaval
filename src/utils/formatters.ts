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
