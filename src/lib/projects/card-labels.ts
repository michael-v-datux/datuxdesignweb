/** Portfolio cards always use EN labels (product/project proper names). */
export type ProjectCardRow = {
  title_en?: string | null;
  title_uk?: string | null;
  category_en?: string | null;
  category_uk?: string | null;
};

export function projectCardTitle(row: ProjectCardRow): string {
  return row.title_en?.trim() || row.title_uk?.trim() || "";
}

export function projectCardCategory(row: ProjectCardRow): string {
  return row.category_en?.trim() || row.category_uk?.trim() || "";
}
