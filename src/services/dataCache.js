// Simple Global In-Memory Cache untuk navigasi instan (Stale-While-Revalidate)
const memoryCache = {
  wallets: null,
  categories: null,
  transactions: null,
  cashFlow: null,
};

export function getCached(key) {
  return memoryCache[key];
}

export function setCached(key, data) {
  memoryCache[key] = data;
}

export function clearCache() {
  memoryCache.wallets = null;
  memoryCache.categories = null;
  memoryCache.transactions = null;
  memoryCache.cashFlow = null;
}
