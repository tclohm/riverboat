export function createMockDb() {
  return {
    select: () => ({
      from: (table: any) => ({
        where: () => ({
          all: () => [],
          get: () => null,
        }),
        leftJoin: () => ({
          where: () => ({
            all: () => [],
            orderBy: () => ({ all: () => [] }),
          }),
          orderBy: () => ({ all: () => [] }),
        }),
        orderBy: () => ({ all: () => [] }),
        all: () => [],
      }),
    }),
    insert: (table: any) => ({
      values: () => ({ run: async () => {} }),
    }),
    update: (table: any) => ({
      set: () => ({
        where: () => ({ run: async () => {} }),
      }),
    }),
    delete: (table: any) => ({
      where: () => ({ run: async () => {} }),
    }),
  };
}
