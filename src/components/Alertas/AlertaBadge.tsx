import { Bell } from 'lucide-react';

interface Props {
  count: number;
  hasHighPriority: boolean;
  onClick: () => void;
}

export function AlertaBadge({ count, hasHighPriority, onClick }: Props) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 rounded-lg transition-all
        ${hasHighPriority
          ? 'bg-red-500 animate-pulse'
          : 'bg-cor-accent-orange hover:bg-cor-accent-orange/80'
        }
      `}
      title={`${count} alerta${count > 1 ? 's' : ''} pendente${count > 1 ? 's' : ''}`}
    >
      <Bell className="w-5 h-5 text-white" />
      <span className="absolute -top-1 -right-1 bg-white text-cor-bg-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
        {count > 9 ? '9+' : count}
      </span>
    </button>
  );
}
