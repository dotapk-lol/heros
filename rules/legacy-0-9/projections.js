import {BATTLE_ABI, codeIdentity, EMPTY_STATE_SCHEMA} from '../../index.js';

const slots = [[0,2,'juggernaut_blade_dance'],[1,2,'crystal_maiden_aura'],[4,1,'sniper_headshot'],[6,2,'phantom_assassin_immaterial'],[7,3,'drow_ranger_marksmanship']];
function number(value, name, max=1e7) {if(!Number.isFinite(value)||value<0||value>max)throw Error('Invalid projection '+name);return value;}
function eventShape(event, keys) {if(Object.keys(event).sort().join(',')!==keys.sort().join(','))throw Error('Invalid finite projection event');}

export function passiveProjectionFactory() {
  return {abiVersion:BATTLE_ABI,parameters:{},create({hero,definition,parameters}) {
    if(Object.keys(parameters).length)throw Error('No external projection configuration');
    const row=slots.find(([id,,ability])=>id===hero.registryNumericId&&ability===definition.id);
    if(!row||!definition.mvp.passive)throw Error('Unsupported passive projection identity');
    const m=definition.mvp,id=definition.id;
    const base={behaviorId:'legacy-0-9/'+id,revision:'1.0.0',...codeIdentity(['rules/legacy-0-9/projections.js']),stateSchema:EMPTY_STATE_SCHEMA,requires:[]};
    if(id==='juggernaut_blade_dance') {
      number(m.critChance,'critChance',1);number(m.critMultiplier,'critMultiplier',100);
      return {...base,projectAttack(ctx,event) {
        eventShape(event,['owner','damage']);number(event.damage,'damage',1e5);
        return {damage:ctx.actor(event.owner).passivesEnabled&&ctx.random()<m.critChance?event.damage*m.critMultiplier:event.damage};
      }};
    }
    if(id==='crystal_maiden_aura') {
      number(hero.mana_regen,'base mana regeneration');number(m.manaRegenBonus,'manaRegenBonus');number(m.manaRegenAmp,'manaRegenAmp',100);
      const baseRegen=hero.mana_regen||8,activeRegen=(baseRegen+m.manaRegenBonus)*(1+m.manaRegenAmp);
      number(activeRegen,'derived mana regeneration');
      return {...base,projectInterval(ctx,event) {
        eventShape(event,['owner','kind']);if(event.kind!=='mana-regeneration')throw Error('Invalid projection interval kind');
        return {manaPerSecond:ctx.actor(event.owner).passivesEnabled?activeRegen:baseRegen};
      }};
    }
    if(id==='phantom_assassin_immaterial') {
      number(m.evasion,'evasion',1);
      return {...base,projectDamage(ctx,event) {
        eventShape(event,['owner','basic']);if(typeof event.basic!=='boolean')throw Error('Invalid basic fact');
        // Host invokes after live/invulnerability admission, before other evasion
        // and guard checks. All basic damage families use this production branch.
        return {evaded:event.basic&&ctx.actor(event.owner).passivesEnabled&&ctx.random()<m.evasion};
      }};
    }
    if(id==='sniper_headshot') {
      number(m.procChance,'procChance',1);number(m.damage,'bonus damage');number(m.knockback_wu,'knockback');number(m.slow_pct,'slow percentage',100);number(m.slow_duration_s,'slow duration',60);
      return {...base,projectAttack(ctx,event) {
        eventShape(event,['owner','guaranteed']);if(typeof event.guaranteed!=='boolean')throw Error('Invalid headshot guarantee fact');
        // The host supplies one finite status-derived fact, never a status object.
        // Guaranteed headshots deliberately consume no random value.
        const proc=ctx.actor(event.owner).passivesEnabled&&(event.guaranteed||ctx.random()<m.procChance);
        return {proc,damageBonus:proc?m.damage:0,knockbackBonus:proc?m.knockback_wu:0,slowPercentage:proc?m.slow_pct:0,slowSeconds:proc?m.slow_duration_s:0};
      }};
    }
    number(m.procChance,'procChance',1);number(m.distance_threshold_wu,'distance threshold');number(m.attack_bonus,'attack bonus');
    return {...base,projectAttack(ctx,event) {
      eventShape(event,['owner','target','damage']);number(event.damage,'damage',1e5);
      const f=ctx.actor(event.owner),t=ctx.actor(event.target);
      const proc=f.passivesEnabled&&Math.abs(t.x-f.x)>=(m.distance_threshold_wu||165)&&ctx.random()<m.procChance;
      return {damage:event.damage+(proc?(m.attack_bonus||90):0)};
    }};
  }};
}

export function registerLegacyPassiveProjections(registry) {
  for(const [heroId,slot] of slots)registry.registerFactory(heroId,slot,passiveProjectionFactory());
  return registry;
}
