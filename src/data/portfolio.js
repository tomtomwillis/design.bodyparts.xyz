import allPortfolio from './AllPortfolio.yaml'

const detailModules = import.meta.glob('./PortfolioDetail/*.yaml', { eager: true })

function parseDate(str) {
  const [d, m, y] = str.split('.')
  return Number(`20${y}${m}${d}`)
}

function buildItem(info, detail, id) {
  return {
    id,
    title: info.title,
    tags: info.tags,
    date: info.date,
    page: info.page,
    mindmap: {
      nodes: detail.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: { x: node.x ?? 0, y: node.y ?? 0 },
        data: {
          label: node.label,
          ...(node.image ? { image: node.image } : {}),
          ...(node.width ? { width: node.width } : {}),
        },
      })),
      edges: detail.edges.map(([source, target], i) => ({
        id: `e${i + 1}`,
        source,
        target,
      })),
    },
  }
}

export const portfolioItems = allPortfolio
  .sort((a, b) => parseDate(b.date) - parseDate(a.date))
  .map((info, i) => {
    const detail = detailModules[`./PortfolioDetail/${info.page}.yaml`]
    return buildItem(info, detail, i + 1)
  })
