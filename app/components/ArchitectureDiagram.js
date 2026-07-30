'use client';

const GROUP_ORDER = ['client', 'api', 'ai', 'data', 'obs'];
const COL_WIDTH = 190;
const NODE_W = 150;
const NODE_H = 40;
const ROW_GAP = 58;
const PAD = 20;

function layout(nodes) {
  const byGroup = {};
  nodes.forEach((n) => {
    const g = GROUP_ORDER.includes(n.group) ? n.group : 'api';
    byGroup[g] = byGroup[g] || [];
    byGroup[g].push(n);
  });

  const positions = {};
  const usedCols = GROUP_ORDER.filter((g) => byGroup[g]?.length);
  const maxRows = Math.max(...usedCols.map((g) => byGroup[g].length), 1);

  usedCols.forEach((g, colIdx) => {
    const items = byGroup[g];
    const startY = PAD + ((maxRows - items.length) * ROW_GAP) / 2;
    items.forEach((n, rowIdx) => {
      positions[n.id] = {
        x: PAD + colIdx * COL_WIDTH,
        y: startY + rowIdx * ROW_GAP,
        group: g,
        label: n.label,
      };
    });
  });

  const width = PAD * 2 + usedCols.length * COL_WIDTH - (COL_WIDTH - NODE_W);
  const height = PAD * 2 + maxRows * ROW_GAP - (ROW_GAP - NODE_H);
  return { positions, width, height };
}

export default function ArchitectureDiagram({ architecture, reducedMotion }) {
  if (!architecture) return null;
  const { positions, width, height } = layout(architecture.nodes);

  return (
    <svg
      className="arch-diagram"
      viewBox={`0 0 ${width} ${Math.max(height, NODE_H + PAD * 2)}`}
      role="img"
      aria-label="System architecture diagram"
    >
      <g>
        {architecture.edges.map(([from, to], i) => {
          const a = positions[from];
          const b = positions[to];
          if (!a || !b) return null;
          const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2;
          const x2 = b.x, y2 = b.y + NODE_H / 2;
          const sameCol = a.x === b.x;
          const d = sameCol
            ? `M ${a.x + NODE_W / 2} ${a.y + NODE_H} L ${b.x + NODE_W / 2} ${b.y}`
            : `M ${x1} ${y1} C ${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2} ${y2}`;
          return (
            <path
              key={i}
              d={d}
              className={`arch-edge${reducedMotion ? '' : ' flowing'}`}
            />
          );
        })}
      </g>
      <g>
        {Object.entries(positions).map(([id, n]) => (
          <g key={id} className={`arch-node group-${n.group}`} transform={`translate(${n.x}, ${n.y})`}>
            <rect width={NODE_W} height={NODE_H} rx="8" />
            <text x={NODE_W / 2} y={NODE_H / 2 + 4} textAnchor="middle">{n.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
