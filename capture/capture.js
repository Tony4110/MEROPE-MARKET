// ORCHESTRATEUR — pour chaque marché du registry : lance le capteur, écrit
// entities + snapshots (historique privé = le moat), puis rafraîchit un product
// public (record_count, preview, fraîcheur). Chaque marché est isolé : un échec
// n'arrête pas les autres.
import { sb, TODAY } from './lib/supa.js';
import { REGISTRY } from './lib/registry.js';

async function idBySlug(table, slug) {
  if (!slug) return null;
  const { data } = await sb.from(table).select('id').eq('slug', slug).maybeSingle();
  return data ? data.id : null;
}

async function runOne(cfg) {
  const recs = await cfg.sensor();
  if (!recs || !recs.length) { console.log(`· ${cfg.opp}: aucune donnée (en attente d'activation)`); return { opp: cfg.opp, n: 0 }; }

  const [oppId, opId, mkId, terrId] = await Promise.all([
    idBySlug('market_opportunities', cfg.opp),
    idBySlug('operators', cfg.operator),
    idBySlug('markets', cfg.market),
    idBySlug('territories', cfg.territory)
  ]);

  let written = 0;
  for (const rec of recs) {
    try {
      let entId = null;
      const { data: existing } = await sb.from('entities')
        .select('id').eq('market_id', mkId).eq('slug', rec.key).maybeSingle();
      if (existing) {
        entId = existing.id;
        await sb.from('entities').update({ last_seen: TODAY, attributes: rec.attributes || {}, opportunity_id: oppId }).eq('id', entId);
      } else {
        const { data: ins, error } = await sb.from('entities')
          .insert({ market_id: mkId, opportunity_id: oppId, canonical_name: rec.name, slug: rec.key, attributes: rec.attributes || {}, first_seen: TODAY, last_seen: TODAY })
          .select('id').single();
        if (error) throw error;
        entId = ins.id;
      }
      if (entId) {
        await sb.from('snapshots').upsert(
          { entity_id: entId, captured_at: TODAY, metrics: rec.metrics || {}, source: 'merope-capture' },
          { onConflict: 'entity_id,captured_at' }
        );
        written++;
      }
    } catch (e) {
      console.error(`  ! ${cfg.opp} entité ${rec.key}: ${e.message}`);
    }
  }

  // product public (valeur visible). Preview = top 3 par tvl si présent.
  const top = [...recs]
    .sort((a, b) => (b.metrics?.tvl || 0) - (a.metrics?.tvl || 0))
    .slice(0, 3)
    .map(r => r.metrics?.tvl != null
      ? [r.name, '$' + new Intl.NumberFormat('en').format(r.metrics.tvl)]
      : [r.name]);

  if (opId) {
    const { error } = await sb.from('products').upsert({
      operator_id: opId, market_id: mkId, territory_id: terrId,
      name: cfg.product, product_type: cfg.type, coverage: cfg.coverage || 'Global',
      record_count: recs.length, history_to: TODAY, update_frequency: 'daily',
      confidence: 'Medium', license: cfg.license, price_eur: cfg.price,
      status: 'live', preview: { rows: top }
    }, { onConflict: 'operator_id,name' });
    if (error) console.error(`  ! ${cfg.opp} product: ${error.message}`);
  }

  console.log(`✓ ${cfg.opp}: ${recs.length} enregistrements, ${written} snapshots`);
  return { opp: cfg.opp, n: recs.length, written };
}

const results = [];
for (const cfg of REGISTRY) {
  try { results.push(await runOne(cfg)); }
  catch (e) { console.error(`✗ ${cfg.opp} ÉCHEC: ${e.message}`); results.push({ opp: cfg.opp, error: e.message }); }
}
console.log('\nRÉSUMÉ ' + TODAY + ': ' + JSON.stringify(results));

// Sortie en échec seulement si TOUT a échoué (sinon on garde les succès partiels).
const anyOk = results.some(r => r && !r.error);
if (!anyOk) process.exit(1);
