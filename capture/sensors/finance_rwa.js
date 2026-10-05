// SENSOR — Finance / RWA & Tokenization
// Source : DeFiLlama (API publique, sans clé). Catégorie "RWA".
// Renvoie une liste d'enregistrements normalisés { key, name, attributes, metrics }.
// Résilient : lève une erreur claire si la source répond mal (le moteur l'isole).

export default async function financeRwa() {
  const r = await fetch('https://api.llama.fi/protocols', { headers: { 'accept': 'application/json' } });
  if (!r.ok) throw new Error('DeFiLlama /protocols HTTP ' + r.status);
  const all = await r.json();
  if (!Array.isArray(all)) throw new Error('DeFiLlama: réponse inattendue');

  const rwa = all.filter(p => String(p.category || '').toUpperCase() === 'RWA');
  return rwa.map(p => ({
    key: 'defillama:' + (p.slug || p.name || '').toString().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: (p.name || p.slug || 'unknown').toString(),
    attributes: {
      category: p.category || 'RWA',
      chains: Array.isArray(p.chains) ? p.chains : [],
      symbol: p.symbol && p.symbol !== '-' ? p.symbol : null,
      url: p.url || null,
      source: 'defillama'
    },
    metrics: {
      tvl: Math.round(Number(p.tvl) || 0),
      chains: Array.isArray(p.chains) ? p.chains.length : 0,
      change_1d: (p.change_1d ?? null),
      change_7d: (p.change_7d ?? null)
    }
  })).filter(x => x.name && x.name !== 'unknown');
}
