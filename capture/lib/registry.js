// REGISTRY — quel capteur alimente quel marché du catalogue, et comment le
// résultat devient un product vendable (vitrine publique).
import financeRwa from '../sensors/finance_rwa.js';
import spaceSatellite from '../sensors/space_satellite.js';
import energyGrid from '../sensors/energy_grid.js';
import aiDatacenters from '../sensors/ai_datacenters.js';

// opp      : slug dans market_opportunities (le vrai marché)
// operator : slug d'operators (qui opère ; Dreamotion pour les marchés phares)
// market   : slug de markets (famille, pour entities/products)
// territory: slug de territories
export const REGISTRY = [
  { opp: 'finance-global-rwa', sensor: financeRwa, operator: 'founder-capital', market: 'capital', territory: 'global',
    product: 'RWA & Tokenization — Protocoles & TVL', type: 'dataset', license: 'commercial', price: 199, coverage: 'Global' },

  // --- prêts à activer (sensor renvoie [] pour l'instant) ---
  { opp: 'space-europe-satellite-connectivity', sensor: spaceSatellite, operator: 'founder-space', market: 'space', territory: 'europe',
    product: 'Satellite Connectivity — Opérateurs & Constellations', type: 'dataset', license: 'commercial', price: 149, coverage: 'Europe' },
  { opp: 'energy-europe-grid-infrastructure', sensor: energyGrid, operator: 'energy-germany', market: 'energy', territory: 'europe',
    product: 'European Grid — Charge & Capacité', type: 'dataset', license: 'commercial', price: 249, coverage: 'Europe' },
  { opp: 'ai-europe-ai-data-centers', sensor: aiDatacenters, operator: 'founder-ai', market: 'ai-infra', territory: 'france',
    product: 'European Data Center Projects', type: 'dataset', license: 'commercial', price: 249, coverage: 'Europe' }
];
