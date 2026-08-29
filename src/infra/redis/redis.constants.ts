export const CACHE_REDIS_CLIENT = Symbol('CACHE_REDIS_CLIENT');

type CacheDefinition = {
  key: string;
  ttlSeconds: number;
};

type CacheFactory<TArgs extends unknown[] = [string]> = (
  ...args: TArgs
) => CacheDefinition;

type CacheKeys = {
  video: {
    session: CacheFactory<[videoId: string]>;
  };
};

export const CACHE_KEY = {
  video: {
    session: (videoId: string) => ({
      key: `stream:video:session:${videoId}`,
      ttlSeconds: 60 * 60 * 24,
    }),
  },
} satisfies CacheKeys;
