type CacheOptions = {
  public?: boolean;
  maxAge?: number; // in seconds
  staleWhileRevalidate?: number; // in seconds
  mustRevalidate?: boolean;
};

export function getCacheHeaders(options: CacheOptions = {}) {
  const {
    public: isPublic = true,
    maxAge = 60, // 1 minute default
    staleWhileRevalidate = 30,
    mustRevalidate = false,
  } = options;

  const directives = [
    isPublic ? "public" : "private",
    `max-age=${maxAge}`,
    `s-maxage=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
  ];

  if (mustRevalidate) {
    directives.push("must-revalidate");
  }

  return {
    "Cache-Control": directives.join(", "),
  };
}
