import {gate,num,flag,actor,handle,hit,hitEffects,dot} from './remaining-common.js';
const IDS=new Set(['mirana_arrow','sven_hammer','windranger_shackle','windranger_powershot','queen_of_pain_shadow_strike','queen_of_pain_sonic','witch_doctor_cask','tidehunter_gush']);
export function buildProjectile(config){const {definition}=config,id=definition.id,m=definition.mvp;if(!IDS.has(id))return null;
 const features=['legacy-hit-v1','legacy-linear-v1',...(m.effect==='projectile_dot'||m.damageOverTime?['legacy-dot-v1']:[])];
 if(id==='mirana_arrow'){for(const k of ['distance_damage_per_100','damage_cap','stun_cap_s','arrowStunRate'])num(m[k],k);}
 if(id==='windranger_powershot'){num(m.charge_damage_per_s,'charge_damage_per_s');num(m.charge_max_s,'charge_max_s');num(m.damage+m.charge_damage_per_s*m.charge_max_s,'derived powershot');}
 if(id==='queen_of_pain_sonic')num(m.damageOverTime,'damageOverTime',Number.MIN_VALUE,3600);
 if(id==='queen_of_pain_shadow_strike'){num(m.dot_damage,'dot_damage');num(m.tick_interval_s,'tick_interval_s',Number.MIN_VALUE,3600);}
 const pulse=(ctx,e)=>{gate(config,e,features);handle(e.handle);if(e.kind!=='legacy-dot-pulse')throw Error('Wrong DOT stage');const source=actor(e.effectiveOwner),target=actor(e.target),remaining=num(e.remainingSeconds,'remainingSeconds',-1,3600);
  const sonic=id==='queen_of_pain_sonic';const amount=sonic?num(e.capturedAmount,'capturedAmount'):m.dot_damage;
  return ctx.damage(hit(definition,source,target,amount,{dot:true,stunSeconds:0,hitstunSeconds:0,legacyInfo:{linaDone:true},legacyEffects:{profile:'legacy-hit-v1',...(sonic?{chip:flag(e.chip,'chip')}:{slow:{percent:m.slow_pct,seconds:Math.min(m.slow_duration_s??1,Math.max(0,remaining))}})}}));
 };
 return {features,requires:['projectile-request','damage',...(features.includes('legacy-dot-v1')?['status']:[])],activate(ctx,cast){gate(config,cast,features);const f=ctx.actor(cast.owner);const held=id==='windranger_powershot'?num(cast.heldSeconds,'heldSeconds',0,m.charge_max_s):0;const amount=num(m.damage+(m.charge_damage_per_s||0)*held,'launch damage');
  return {projectileHandle:ctx.projectile({owner:cast.owner,abilityId:id,castId:handle(cast.castId),direction:cast.direction,speed:m.projectile_speed_wu_s||800,range:m.range_wu,height:m.height,contactHandler:'legacy-projectile-contact',data:{profile:'legacy-linear-v1',originX:f.x+f.dir*35,originY:f.y+(m.height==='ground'?35:100),radius:Math.max(12,m.radius_wu||18),capturedAmount:amount,reflectionPolicy:'consume-counter; flip-owner-dir; reset-travel; target-offset35',reflectable:m.reflectable,sourceDeathPolicy:'retain',originalOwner:cast.owner}})};
 },onContact(ctx,e){gate(config,e,features);if(e.kind!=='legacy-projectile-contact')throw Error('Wrong projectile contact');handle(e.handle);const source=actor(e.effectiveOwner),target=actor(e.target);num(e.capturedAmount,'capturedAmount');num(e.travelDistance,'travelDistance');const reflected=flag(e.reflected,'reflected'),counter=flag(e.counterReflects,'counterReflects');if(e.direction!==1&&e.direction!==-1)throw Error('Wrong projectile direction');
  if(m.reflectable&&!reflected&&counter)return {projectileRedirect:{handle:e.handle,effectiveOwner:target,target:source,direction:-e.direction,resetTravel:true,offsetFromTarget:-e.direction*35,consumeCounterHandle:handle(e.counterHandle),reflected:true},presentation:{kind:'legacy-projectile-reflect',actor:target}};
  let amount=num(e.capturedAmount,'capturedAmount'),stun=m.stun_s;const travel=num(e.travelDistance,'travelDistance');
  if(m.distance_damage_per_100){amount=Math.min(m.damage_cap,amount+travel/100*m.distance_damage_per_100);stun=Math.min(m.stun_cap_s,stun+(m.arrowStunRate||.0006)*travel);}
  if(m.wall_bind_distance_wu&&flag(e.wallBound,'wallBound'))stun=m.wall_bind_stun_s;
  const t=ctx.actor(target),wave=!!m.damageOverTime,guardBefore=!!t.guarding,eligibleBefore=!t.invulnerable;
  const receipt=ctx.damage(hit(definition,source,target,wave?0:amount,{stunSeconds:stun,legacyInfo:{omitReflectedFlag:true},legacyEffects:hitEffects(m)}));
  if(wave&&eligibleBefore){const captured=num(amount/(m.damageOverTime/.1)*(guardBefore?.2:1),'sonic tick');ctx.status.apply(dot(definition,source,target,m.damageOverTime,.1,{originalOwner:e.owner,capturedAmount:captured,chip:guardBefore,knockbackDistance:0,stunSeconds:0,append:true,admission:'wave-pre-hit-not-invulnerable'}));}
  if(m.effect==='projectile_dot'&&receipt.landed)ctx.status.apply(dot(definition,source,target,m.duration_s,m.tick_interval_s,{originalOwner:e.owner,capturedAmount:m.dot_damage,append:true,admission:'landed-even-if-lethal'},m.dispelTier||'none'));
  return {projectileEnd:{handle:e.handle},receipt};
 },...(features.includes('legacy-dot-v1')?{onStage:pulse}:{})};
}
