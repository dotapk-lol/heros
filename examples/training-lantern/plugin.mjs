// Original teaching behavior. The fixed public roster supplies identity only.
import {BATTLE_ABI, codeIdentity, defineStateSchema, EMPTY_STATE_SCHEMA} from '../../index.js';
export const CARRIER_HERO_ID = 1;
export const trainingPresentation = Object.freeze({name:'Lantern Keeper', slots:['Spark','Mend','Echo','Clear Sky']});
const passiveState = defineStateSchema({id:'example/lantern-echo', schema:{anyOf:[{type:'null'},{type:'object',properties:{attacks:{type:'integer',minimum:0,maximum:1000000}},required:['attacks'],additionalProperties:false}]}});
function parametersChecked(parameters) {
 const expected=['damage','healing','echoDamage','regenHealing','intervalSeconds','durationSeconds'];
 if(Object.keys(parameters).sort().join()!==expected.sort().join()) throw Error('Unexpected training parameter');
 for(const value of Object.values(parameters)) if(!Number.isFinite(value)||value<=0||value>1000) throw Error('Invalid training parameter');
 if(parameters.intervalSeconds>parameters.durationSeconds) throw Error('Interval exceeds duration');
}
export function trainingFactory(slot, overrides={}) {
 if(!Number.isInteger(slot)||slot<0||slot>3) throw Error('Invalid training slot');
 const parameters={damage:15,healing:12,echoDamage:3,regenHealing:2,intervalSeconds:.25,durationSeconds:.5,...overrides};
 return {abiVersion:BATTLE_ABI, parameters, create({hero,definition,parameters:p}) {
  if(hero.registryNumericId!==CARRIER_HERO_ID) throw Error('Wrong identity carrier');
  parametersChecked(p);
  const id=definition.id;
  const base={behaviorId:`example/lantern/${slot}`,revision:'1.0.0',...codeIdentity(['examples/training-lantern/plugin.mjs']),stateSchema:EMPTY_STATE_SCHEMA};
  if(slot===0) return {...base,requires:['damage'],
   planCast(ctx,facts) {const accepted=ctx.actor(facts.owner).alive&&facts.actionReady&&facts.manaAvailable>=definition.mvp.mana&&facts.cooldownRemaining===0;return {accepted,...(accepted?{}:{reason:'training-admission'}),manaCost:definition.mvp.mana,cooldownSeconds:definition.mvp.cooldown_s,chargeCost:0,windupSeconds:definition.mvp.startup_frames/60,recoverySeconds:definition.mvp.recovery_frames/60,action:'cast'};},
   activate(ctx,event) {return ctx.damage({source:event.owner,target:event.target,abilityId:id,amount:p.damage,type:'magical'});}
  };
  if(slot===1) {
   const declaration={id:'example/lantern/mend',key:'lantern-mend',recipient:'self',duration:p.durationSeconds,interval:p.intervalSeconds,programId:'example/lantern/regen',schedule:{handler:'regen',binding:'status',delivery:'actor.status-advance'},polarity:'positive',dispel:'basic',pierces:false,values:{healing:p.regenHealing}};
   function queue(ctx,owner,handle) {ctx.schedule({owner,target:owner,abilityId:id,handler:'regen',delay:p.intervalSeconds,binding:{kind:'status',ref:handle},delivery:'actor.status-advance',statusDeclarationId:declaration.id,data:{owner,handle}});}
   return {...base,requires:['heal','status','schedule'],statusDeclarations:[declaration],scheduledBindings:{regen:[{binding:'status',delivery:'actor.status-advance'}]},
    activate(ctx,event) {
     const receipt=ctx.heal({source:event.owner,target:event.owner,abilityId:id,amount:p.healing});
     const handle=ctx.status.apply({owner:event.owner,target:event.owner,abilityId:id,key:declaration.key,duration:declaration.duration,polarity:declaration.polarity,dispel:declaration.dispel,pierces:declaration.pierces,values:declaration.values,statusDeclarationId:declaration.id});
     if(handle) queue(ctx,event.owner,handle);
     return {receipt,handle};
    },
    scheduledHandlers:{regen(ctx,data) {
     const record=ctx.status.query(data.owner,declaration.key).find(row=>row.handle===data.handle&&row.effective===true);
     if(!record) return;
     ctx.heal({source:data.owner,target:data.owner,abilityId:id,amount:p.regenHealing});
     if(record.remainingSeconds>0) queue(ctx,data.owner,data.handle);
    }}
   };
  }
  if(slot===2) return {...base,stateSchema:passiveState,requires:['damage'],
   onAttack(ctx,event) {
    if(!ctx.actor(event.owner).alive||!ctx.actor(event.owner).passivesEnabled) return;
    const attacks=(ctx.state.read()?.attacks??0)+1;
    ctx.state.write({attacks});
    ctx.damage({source:event.owner,target:event.target,abilityId:id,amount:p.echoDamage,type:'pure',passive:true});
   },
   onDeath(ctx) {ctx.state.remove();}
  };
  return {...base,requires:['status','protect'],
   activate(ctx,event) {const removed=ctx.status.cleanse(event.owner,'basic',id);const protection=ctx.protect({actor:event.owner,abilityId:id,kind:'debuff-immunity',duration:p.durationSeconds});return {removed,protection};}
  };
 }};
}
export function installTrainingLantern(registry, overrides={}) {
 for(let slot=0;slot<4;slot++) registry.registerFactory(CARRIER_HERO_ID,slot,trainingFactory(slot,overrides));
 return registry;
}
