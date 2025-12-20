export const isMock = typeof window === 'undefined' && process.env.DATABASE_MOCK === 'true';
