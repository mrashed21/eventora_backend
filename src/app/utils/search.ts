export const buildSearchConditions = (
  search_term: string,
  fields: string[],
) => {
  if (!search_term) return {};

  return {
    AND: [
      {
        OR: fields.map((field) => ({
          [field]: {
            contains: search_term,
            mode: "insensitive",
          },
        })),
      },
    ],
  };
};
