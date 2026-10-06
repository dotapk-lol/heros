import {BATTLE_ABI} from '../../../index.js';
import {castFacts,damage,damageRecipe,finite,geometry,grant,metadata,near,recipeShape,reflectedHit,route} from './common.js';

const selected=[[3,0,'axe_call','taunt'],[6,1,'phantom_assassin_strike','blink_strike'],[8,1,'lina_array','ground'],[9,3,'lion_finger','hit']];
export function legacyActiveDraftFactory(kind, parameters = kind==='lion_finger'?{bodyPadding:22,groundCutoff:45,worldScale:.55}:{bodyPadding:22,groundCutoff:45}) {
  return {abiVersion:BATTLE_ABI,parameters,create({hero,definition,parameters:p}) {
    const row=selected.find(([id,,ability,effect])=>hero.registryNumericId===id&&definition.id===ability&&kind===ability&&definition.mvp.effect===effect);
    if(!row)throw Error('Unsupported draft active identity');
    const m=definition.mvp,slot=row[1],id=definition.id;
    recipeShape(m,id==='axe_call'?['physical_reduction']:id==='phantom_assassin_strike'?['buff_duration_s','attack_interval_multiplier']:[]);
    geometry(p,id==='lion_finger'?['worldScale']:[]);
    finite(m.range_wu,'range_wu');finite(m.radius_wu,'radius_wu');
    if(id==='axe_call') {
      finite(m.duration_s,'duration_s',60);finite(m.physical_reduction,'physical_reduction',1);
      return {...metadata(definition,'active-skills.js',['control','status']),activate(ctx,event) {
        castFacts(event,definition,slot);
        if(!near(ctx,event,m.radius_wu,m.height,p)||ctx.actor(event.target).guarding)return;
        ctx.control.apply({owner:event.owner,target:event.target,abilityId:id,key:'taunt',type:'taunt',duration:m.duration_s,pierces:false,dispel:'none'});
        // Original production grants the armor even when immunity/grace rejects
        // the control. Do not make this contingent on the control receipt.
        grant(ctx,event.owner,definition,id,{physical_reduction:m.physical_reduction},m.duration_s);
      }};
    }
    damageRecipe(m);
    if(id==='phantom_assassin_strike') {
      finite(m.buff_duration_s,'buff_duration_s',60);finite(m.attack_interval_multiplier,'attack_interval_multiplier',100);
      return {...metadata(definition,'active-skills.js',['target-route','motion-request','damage','status','cue']),activate(ctx,event) {
        castFacts(event,definition,slot);if(!near(ctx,event,m.range_wu,m.height,p))return;
        const routed=route(ctx,event,definition);if(!routed.accepted)return;if(routed.reflected)return reflectedHit(ctx,definition,routed);
        const target=ctx.actor(event.target);
        ctx.motion({actor:event.owner,abilityId:id,castId:event.castId,kind:'blink',destinationX:target.x-event.direction*70,speed:0,duration:0});
        damage(ctx,definition,event.owner,event.target);
        // This is a real zero-damage hit (guard meter/hitstun still matter), and
        // the speed status is granted even if the hit is guarded/invulnerable.
        grant(ctx,event.owner,definition,id,{attack_interval_multiplier:m.attack_interval_multiplier},m.buff_duration_s||2);
      }};
    }
    if(id==='lina_array')return {...metadata(definition,'active-skills.js',['damage','cue']),activate(ctx,event) {
      castFacts(event,definition,slot);const t=ctx.actor(event.target);
      if(Math.abs(t.x-event.aimX)<=m.radius_wu+p.bodyPadding&&(m.height!=='ground'||t.y<p.groundCutoff))damage(ctx,definition,event.owner,event.target);
      // Frozen cue shape carries no position. The host must bind this named cue
      // to the immutable current cast.aimX/radius; its absence blocks acceptance.
      ctx.cue({kind:'hit',abilityId:id,actor:event.owner,target:event.target});
    }};
    finite(p.worldScale,'worldScale',1);finite(m.duration_s,'form duration',60);
    const semantic=m.officialSemantic;
    const form={attack_range_override:finite(semantic?.punch_attack_range,'form range')*p.worldScale,attack_bonus:finite(semantic?.punch_bonus_damage,'form attack bonus'),move_bonus:finite(semantic?.punch_bonus_movespeed,'form move bonus')*p.worldScale,melee:true};
    return {...metadata(definition,'active-skills.js',['target-route','damage','status','cue']),activate(ctx,event) {
      castFacts(event,definition,slot);const inRange=near(ctx,event,m.range_wu||m.radius_wu,m.height,p);
      let routed=null;
      if(inRange){routed=route(ctx,event,definition);if(!routed.accepted)return;if(routed.reflected)return reflectedHit(ctx,definition,routed);}
      // Production's special form grant precedes the hit-range branch. A miss
      // still grants it; a reflected hit returns before it. No new kill stacking.
      grant(ctx,event.owner,definition,'lionForm',form,m.duration_s);
      if(inRange){damage(ctx,definition,event.owner,event.target);ctx.cue({kind:'targeted-hit',abilityId:id,actor:event.owner,target:event.target});}
    }};
  }};
}
export function registerLegacyActiveDrafts(registry) {
  for(const [heroId,slot,id]of selected)registry.registerFactory(heroId,slot,legacyActiveDraftFactory(id));
  return registry;
}
