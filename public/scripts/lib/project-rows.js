/** Browser copy of row grouping (keep in sync with src/lib/projects/rows.ts). */

export function layoutFraction(layout) {
  switch (layout) {
    case '1/2':
      return 0.5;
    case '1/3':
      return 1 / 3;
    case '1/4':
      return 0.25;
    case 'full':
    case '1/1':
    default:
      return 1;
  }
}

export function groupBlocksIntoRows(blocks) {
  const rows = [];
  let current = [];
  let used = 0;

  const flush = () => {
    if (current.length > 0) {
      rows.push(current);
      current = [];
      used = 0;
    }
  };

  for (const block of blocks) {
    const fraction = layoutFraction(block.layout);

    if (fraction >= 1 - 0.001) {
      flush();
      rows.push([block]);
      continue;
    }

    if (used + fraction > 1.001) flush();

    current.push(block);
    used += fraction;
  }

  flush();
  return rows;
}
