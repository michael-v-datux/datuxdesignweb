export function normalizePublishFields(input: {
  status?: string | null;
  is_published?: boolean | null;
}): { status: "draft" | "published"; is_published: boolean } {
  if (input.is_published !== undefined && input.is_published !== null) {
    const is_published = !!input.is_published;
    return {
      status: is_published ? "published" : "draft",
      is_published,
    };
  }

  if (input.status !== undefined && input.status !== null) {
    const is_published = input.status === "published";
    return {
      status: is_published ? "published" : "draft",
      is_published,
    };
  }

  return { status: "draft", is_published: false };
}
