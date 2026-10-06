import {BATTLE_ABI, codeIdentity, EMPTY_STATE_SCHEMA} from '../../index.js';

const sourceFiles = ['rules/legacy-0-9/direct-hit.js'];
const selected = new Map([[3, 'axe_culling'], [8, 'lina_laguna']]);

// This family deliberately admits only the two complete production hit recipes.
// The host owns cast admission, guard refresh and the sole HP transaction.
export function directHitFactory(parameters = {damageMultiplier: 1, bodyPadding: 22}) {
  return {
    abiVersion: BATTLE_ABI,
    parameters,
    create({hero, definition, parameters: p}) {
      const m = definition.mvp;
      if (selected.get(hero.registryNumericId) !== definition.id || m.effect !== 'hit') throw Error('Unsupported direct-hit identity');
      if (Object.keys(p).sort().join(',') !== 'bodyPadding,damageMultiplier' || !Number.isFinite(p.damageMultiplier) || p.damageMultiplier < 0 || !Number.isFinite(p.bodyPadding) || p.bodyPadding < 0 || p.bodyPadding > 100) throw Error('Invalid direct-hit parameters');
      for (const k of ['damage', 'range_wu', 'radius_wu', 'stun_s', 'hitstun_s']) if (!Number.isFinite(m[k]) || m[k] < 0) throw Error('Invalid direct-hit coefficient: ' + k);
      if (!['physical','magical','pure'].includes(m.damage_type)) throw Error('Direct-hit requires an implemented damage enum');
      if (m.damage * p.damageMultiplier > 1e7 || m.stun_s > 60 || m.hitstun_s > 60) throw Error('Direct-hit exceeds host bounds');
      for (const k of ['root_s', 'silence_s', 'slow_pct', 'knockback_wu', 'pull_to_distance', 'vulnerability_physical', 'attack_damage_debuff', 'selfReflection', 'missing_mana_multiplier', 'execute_threshold_pct', 'chip']) if (m[k]) throw Error('Unimplemented direct-hit dependent coefficient: ' + k);
      return {
        behaviorId: 'legacy-0-9/' + definition.id,
        revision: '1.0.0',
        ...codeIdentity(sourceFiles),
        stateSchema: EMPTY_STATE_SCHEMA,
        requires: ['damage', 'target-route', 'cue'],
        activate(ctx, cast) {
          const f = ctx.actor(cast.owner), t = ctx.actor(cast.target);
          if (Math.abs(t.x - f.x) > (m.range_wu || m.radius_wu) + p.bodyPadding || m.height === 'ground' && t.y >= 45) return;
          // Production reflects all eligible targeted hit families even where the
          // recipe's projectile reflectable flag is false. Keep that distinction.
          const route = ctx.target.route({owner: cast.owner, target: cast.target, abilityId: definition.id, range: m.range_wu || m.radius_wu, reflectable: true, reflected: cast.reflected});
          if (!route.accepted) return;
          ctx.damage({source: route.owner, target: route.target, abilityId: definition.id, amount: m.damage * p.damageMultiplier, type: m.damage_type, blockable: m.blockable, stunSeconds: m.stun_s, hitstunSeconds: m.hitstun_s, reflected: route.reflected});
          ctx.cue({kind: route.reflected ? 'reflect' : 'targeted-hit', abilityId: definition.id, actor: route.owner, target: route.target});
          if (route.reflected) return {reflected: true};
        }
      };
    }
  };
}

export function registerLegacyDirectHits(registry, parameters) {
  for (const heroId of selected.keys()) registry.registerFactory(heroId, 3, directHitFactory(parameters));
  return registry;
}
