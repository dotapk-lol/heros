import {BATTLE_ABI} from '../../../index.js';
import {castFacts,closed,finite,grant,metadata,recipeShape} from './common.js';

const selected=[[2,2,'pudge_meat_shield','buff'],[4,2,'sniper_take_aim','buff'],[5,2,'anti_mage_counterspell','counter']];
export function legacyStatusDraftFactory() {
  return {abiVersion:BATTLE_ABI,parameters:{},create({hero,definition,parameters}) {
    closed(parameters,[],'status parameters');
    const row=selected.find(([id,,ability,effect])=>hero.registryNumericId===id&&definition.id===ability&&definition.mvp.effect===effect);
    if (!row) throw Error('Unsupported draft status identity');
    const slot=row[1],m=definition.mvp,id=definition.id;finite(m.duration_s,'duration_s',60);
    recipeShape(m,id==='pudge_meat_shield'?['block_flat','block_fraction_cap']:id==='sniper_take_aim'?['attack_range_bonus','self_slow','headshotGuaranteed']:[]);
    // These skills only grant a closed named status. Do not copy the full recipe
    // dictionary into host storage; the host must admit these exact value keys.
    function activation(values,key=id) {
      return (ctx,event)=>{castFacts(event,definition,slot);grant(ctx,event.owner,definition,key,values,m.duration_s);ctx.cue({kind:'cast',abilityId:id,actor:event.owner});};
    }
    if(id==='pudge_meat_shield') {
      finite(m.block_flat,'block_flat');finite(m.block_fraction_cap,'block_fraction_cap',1);
      return {...metadata(definition,'status-skills.js',['status','cue']),activate:activation({block_flat:m.block_flat,block_fraction_cap:m.block_fraction_cap}),projectDamage(ctx,event) {
        closed(event,['owner','type','damage'],'Meat Shield projection');finite(event.damage,'incoming damage');
        if(!['physical','magical','pure'].includes(event.type))throw Error('Invalid incoming damage type');
        const entries=ctx.status.query(event.owner,id);
        if(!Array.isArray(entries)||entries.length>1)throw Error('Host must expose one replacement Meat Shield status');
        if(!entries.length)return {damage:event.damage};
        const status=entries[0];
        if(status.abilityId!==id||status.key!==id||status.target!==event.owner)throw Error('Cross-status projection fact');
        finite(status.duration,'live status duration',60,Number.MIN_VALUE);
        closed(status.values,['block_flat','block_fraction_cap'],'Meat Shield values');
        const flat=finite(status.values.block_flat,'live block_flat'),cap=finite(status.values.block_fraction_cap,'live block_fraction_cap',1)||.4;
        return {damage:event.damage-(flat?Math.min(flat,event.damage*cap):0)};
      }};
    }
    if(id==='sniper_take_aim') {
      finite(m.attack_range_bonus,'attack_range_bonus');finite(m.self_slow,'self_slow',1);
      if(typeof m.headshotGuaranteed!=='boolean')throw Error('Invalid guarantee coefficient');
      return {...metadata(definition,'status-skills.js',['status','cue']),activate:activation({attack_range_bonus:m.attack_range_bonus,self_slow:m.self_slow,headshotGuaranteed:m.headshotGuaranteed})};
    }
    const resistance=finite(m.officialSemantic?.passive_magic_resistance_pct,'passive magic resistance percent',100)/100;
    return {...metadata(definition,'status-skills.js',['status','cue']),activate:activation({mode:'spell'},'counter'),projectDamage(ctx,event) {
      closed(event,['owner','type','magicReduction'],'Counterspell reduction projection');finite(event.magicReduction,'existing magical reduction',1);
      if(!['physical','magical','pure'].includes(event.type))throw Error('Invalid incoming damage type');
      return {magicReduction:event.type==='magical'?Math.max(event.magicReduction,ctx.actor(event.owner).passivesEnabled?resistance:0):event.magicReduction};
    }};
  }};
}
export function registerLegacyStatusDrafts(registry) {
  for(const [heroId,slot]of selected)registry.registerFactory(heroId,slot,legacyStatusDraftFactory());
  return registry;
}
