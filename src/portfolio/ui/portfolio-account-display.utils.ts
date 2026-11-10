const hiveProfileImageUrl = (username: string): string => {
  const safe = encodeURIComponent(username.toLowerCase());
  return `https://images.hive.blog/u/${safe}/avatar`;
};

const evmGravatarHashHex = (address: string): string => {
  const s = address.toLowerCase();
  let out = '';
  let seed = 2166136261;
  for (let round = 0; round < 4; round++) {
    seed = (Math.imul(seed, 16777619) ^ round * 73856093) | 0;
    let h = seed;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    }
    out += (h >>> 0).toString(16).padStart(8, '0');
  }
  return out.slice(0, 32);
};

const evmGravatarAvatarUrl = (address: string): string => {
  const hash = evmGravatarHashHex(address);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=128&f=y`;
};

export const PortfolioAccountDisplayUtils = {
  hiveProfileImageUrl,
  evmGravatarAvatarUrl,
};
