# Dashboard Carnaval Rio 2026

Dashboard interativo de monitoramento de blocos de carnaval para o Centro de Operações Rio (COR) - JARVIS Municipal.

## Funcionalidades

- Mapa interativo com 465 blocos de carnaval
- Visualização de percursos para blocos com deslocamento
- Filtros por data, subprefeitura, tipo de apresentação e busca
- Estatísticas em tempo real
- Detalhes completos de cada bloco
- Gráfico de distribuição por data

## Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Dados

Coloque o arquivo Excel `PLANILHACOMPLETABLOCOS2026.xlsx` em:
```
public/data/PLANILHACOMPLETABLOCOS2026.xlsx
```

Se o arquivo não for encontrado, o dashboard usará dados de demonstração.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React-Leaflet / Leaflet
- xlsx (para parsing do Excel)
- date-fns
- lucide-react (ícones)

## Estrutura

```
src/
├── components/
│   ├── Map/          # Mapa e marcadores
│   ├── Sidebar/      # Filtros e lista
│   ├── Header/       # Cabeçalho com stats
│   ├── BlocoDetail/  # Painel de detalhes
│   └── Stats/        # Gráficos
├── hooks/            # useBlocos, useFilters
├── utils/            # Parsers e formatters
├── types/            # TypeScript types
└── data/             # Coordenadas e mock data
```
