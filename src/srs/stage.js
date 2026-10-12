// Garden stage from FSRS stability (days). Must match the `garden` view in 0001_schema.sql.
export const STAGES = [
  ['Benih', 'seed'],
  ['Tunas', 'sprout'],
  ['Daun', 'leaves'],
  ['Kudup', 'bud'],
  ['Mekar', 'bloom'],
];

export function stageFor({ reps = 0, stability = 0 } = {}) {
  if (!reps) return 0;
  if (stability < 2) return 1;
  if (stability < 7) return 2;
  if (stability < 21) return 3;
  return 4;
}
