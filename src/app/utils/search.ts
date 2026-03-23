export const buildSearchConditions = (searchTerm: string, fields: string[]) => {
  if (!searchTerm) return {};

  return {
    AND: [
      {
        OR: fields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        })),
      },
    ],
  };
};
