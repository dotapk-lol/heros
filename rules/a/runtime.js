import {model,coefficient,clamp,validateExpression,expressionBound} from './model.js';
import {HOST_REQUESTS,HostPortRequired} from './gaps.js';
import {codeIdentity} from '../../index.js';
import {ownStateSchema} from './state.js';
import {canonicalExtension,EXTENSION_SOURCE_FILES} from './extensions/canonical.js';
import {executionParameters} from './parameters.js';
export const A_SOURCE_FILES=Object.freeze(['rules/a/register.js','rules/a/runtime.js','rules/a/model.js','rules/a/gaps.js','rules/a/state.js','rules/a/parameters.js',...EXTENSION_SOURCE_FILES]);
const actors=[0,1],negativeKeys=new Set(['disarm','magicVulnerable','moveSlow']);
const controls=['stun','root','hex','fear','taunt'];
const sameKeys=(x,keys)=>x&&Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
const finite=n=>Number.isFinite(n)&&n>=0;
const initial=()=>({next:1,records:[],jobs:[],areas:[]});
function capabilities(a){
 const set=new Set(['cue','status']);
 function scan(x){if(!x||typeof x!=='object')return;
  if(Array.isArray(x)){x.forEach(scan);return;}
  const map={damage:'damage',heal:'heal',selfCost:'self-damage',mana:x.steal?'transfer-mana':'mana',delay:'schedule',area:'schedule',toggle:'schedule',upkeepPulse:'mana',deferredHP:'deferred-hp'};
  if(map[x.op])set.add(map[x.op]);if(x.op==='area')set.add('legacy-effect');
  if(x.tick)set.add('schedule');
  if(x.values&&controls.some(k=>x.values[k]))set.add('control');
  Object.values(x).forEach(scan);
 }
 scan(a.recipe);if(a.recipe.target==='enemy')set.add('target-route');
 if(a.recipe.aura)set.add('schedule');
 if(a.id==='death_prophet_spirit_siphon'){set.add('schedule');set.add('damage');set.add('heal');}
 return [...set].sort();
}
export function createRule(config){
 const settings=executionParameters(config.parameters);
 const a=config.definition,m=a.mvp,r=a.recipe,lookup=model(config),id=a.id;
 function preflight(node){
  if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(preflight);return;}
  if(node.op&&!['damage','heal','status','selfCost','mana','delay','area','deferredHP','toggle','upkeepPulse','special','swap','mark','rupture','pullStep'].includes(node.op))throw Error('A_UNSUPPORTED_RECIPE_OPERATION:'+id+'/'+node.op);
  if(node.op==='special'&&!['siphon','exorcism','dragon'].includes(node.name))throw Error('A_UNSUPPORTED_SPECIAL:'+id+'/'+node.name);
  for(const key of ['amount','percent','cap','cost','duration','interval','radius','delay','damageFraction','repayDuration'])if(key in node){validateExpression(node[key],a);const bound=expressionBound(node[key],a,config.definitions);if(!Number.isFinite(bound)||bound>1e7||['duration','delay','interval','repayDuration'].includes(key)&&bound>3600||key==='interval'&&bound<.001||key==='damageFraction'&&bound>1)throw Error('A_EFFECT_COEFFICIENT_OUT_OF_BOUNDS:'+key);}
  if(node.values)for(const v of Object.values(node.values))if(typeof v!=='boolean')validateExpression(v,a);
  Object.values(node).forEach(preflight);
 }
 if(!r||!['self','enemy','point','passive'].includes(r.target)||!Array.isArray(r.ops))throw Error('A_INVALID_RECIPE');
 preflight(r);if(r.stats)Object.values(r.stats).forEach(x=>validateExpression(x,a));
 const programs=new Map([...lookup.programs].filter(([key])=>key.startsWith(id+':')));
 const paths=new Map([...programs].map(([key,value])=>[value,key]));
 const root=id+':recipe.ops';
 const usesEffectiveRange=id==='dragon_knight_breathe_fire'||id==='dragon_knight_dragon_tail';
 const declaresStatuses=id==='omniknight_hammer_of_purity',declarationIds=new WeakMap();
 if(declaresStatuses)r.ops.forEach((op,index)=>{if(op.op==='status')declarationIds.set(op,id+':recipe.ops.'+index);});
 const resolve=(x,ctx,c)=>coefficient(x,ctx,c,a,lookup);
 const vv=(v,ctx,c)=>Object.fromEntries(Object.entries(v||{}).map(([k,x])=>[k,typeof x==='boolean'?x:resolve(x,ctx,c)]));
 const read=ctx=>structuredClone(ctx.state.read()??initial());
 const write=(ctx,s)=>ctx.state.write(s);
 const statusSchemas=[],areaSchemas=[],delayPrograms=new Set();
 const noFacts={actor(){throw Error('A_STATUS_SCHEMA_DYNAMIC_FACT');}};
 function schema(node){
  if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(schema);return;}
  if(['status','toggle'].includes(node.op)){
   const v=vv(node.values,noFacts,{}),mixed=v.physicalImmune&&Object.keys(v).some(k=>negativeKeys.has(k));
   const parts=mixed?[{key:(node.key||id)+'_positive',polarity:'positive',values:Object.fromEntries(Object.entries(v).filter(([k])=>!negativeKeys.has(k)))},{key:(node.key||id)+'_hostile',polarity:'negative',values:Object.fromEntries(Object.entries(v).filter(([k])=>negativeKeys.has(k)))}]:[{key:node.key||id,polarity:node.op==='toggle'||node.to==='self'?'positive':'negative',values:v}];
   for(const part of parts)statusSchemas.push({...part,pierces:!!node.pierces,duration:node.op==='toggle'?settings.statusToggleSeconds:resolve(node.duration,noFacts,{}),interval:node.tick?resolve(node.tick.interval,noFacts,{}):0,program:node.tick?paths.get(node.tick.ops):null,...(declaresStatuses?{statusDeclarationId:declarationIds.get(node),recipient:node.to==='self'?'self':'enemy',dispel:node.dispel||'basic'}:{})});
  }
  if(node.op==='delay')delayPrograms.add(paths.get(node.ops));
  if(node.op==='area')areaSchemas.push({kind:'area',duration:resolve(node.duration,noFacts,{}),interval:resolve(node.interval,noFacts,{}),radius:resolve(node.radius,noFacts,{})*settings.unitScale,follow:!!node.follow,program:paths.get(node.ops)});
  Object.values(node).forEach(schema);
 }
 schema(r);
 if(HOST_REQUESTS[id]&&id!=='death_prophet_spirit_siphon')canonicalExtension(config); // Six source-dependent proposals; the link admission gap has no active reducer.
 const statusDeclarations=declaresStatuses?statusSchemas.map(x=>({id:x.statusDeclarationId,key:x.key,recipient:x.recipient,duration:x.duration,interval:x.interval,programId:x.program,schedule:x.program?{handler:'statusPulse',binding:'status',delivery:'actor.status-advance'}:null,polarity:x.polarity,dispel:x.dispel,pierces:x.pierces,values:x.values})):null;
 // The upkeepPulse opcode is an enemy AoE program carried by a self toggle.
 // Declare program recipient separately from status/schedule recipient; both
 // domains are source/schema identity, never a private hero-specific override.
 const programTargets=statusSchemas.filter(x=>programs.get(x.program)?.some(op=>op.op==='upkeepPulse')).map(x=>{
  if(x.polarity!=='positive'||x.values.pulseToggle!==true)throw Error('A_UPKEEP_STATUS_DOMAIN');
  return {programId:x.program,key:x.key,statusRecipient:'self',effectRecipient:'enemy'};
 });
 for(const [programId,ops] of programs)if(ops.some(op=>op.op==='upkeepPulse')&&!programTargets.some(x=>x.programId===programId))throw Error('A_UPKEEP_PROGRAM_DOMAIN');
 // Immutable delivery facts split nominal cadence from actual resource birth.
 // Declared in the owned schema so the host can gate admission before payment.
 const areaDeliveryClock=areaSchemas.length?{version:1,handler:'areaPulse',binding:'entity-area',delivery:'pack.entity',callbackAt:'authenticated-nominal',nativeExpired:'leased-native',resourceAt:'ctx.now',ordinal:'state.areas.pulses'}:null;
 const stateSchema=ownStateSchema(lookup,id,statusSchemas,areaSchemas,delayPrograms,statusDeclarations,programTargets,areaDeliveryClock);
 function exists(ctx,x){return ctx.actor(x.target).alive&&x.expires>=ctx.now-1e-8&&ctx.status.query(x.target,x.key).some(s=>s.abilityId===id&&s.owner===x.owner);}
 function effective(ctx,x){const t=ctx.actor(x.target);return exists(ctx,x)&&(x.polarity==='positive'||!t.invulnerable&&(x.pierces||!t.debuffImmune));}
 function cancelRecord(ctx,s,x){ctx.status.remove(x.handle);s.records=s.records.filter(v=>v.n!==x.n);}
 function addStatus(ctx,c,op){
  const target=op.to==='self'?c.owner:c.target,f=ctx.actor(target),duration=resolve(op.duration,ctx,c),v=vv(op.values,ctx,c);
  if(duration<=0||!f.alive||f.invulnerable)return;
  const mixed=!!v.physicalImmune&&Object.keys(v).some(k=>negativeKeys.has(k));
  const parts=mixed?[{key:(op.key||id)+'_positive',polarity:'positive',values:Object.fromEntries(Object.entries(v).filter(([k])=>!negativeKeys.has(k)))},{key:(op.key||id)+'_hostile',polarity:'negative',values:Object.fromEntries(Object.entries(v).filter(([k])=>negativeKeys.has(k)))}]:[{key:op.key||id,polarity:target===c.owner?'positive':'negative',values:v}];
  for(const part of parts){
   if(part.polarity==='negative'&&(f.invulnerable||f.debuffImmune&&!op.pierces))continue;
   const statusDeclarationId=declaresStatuses?declarationIds.get(op):null;
   if(declaresStatuses&&!statusDeclarationId)throw Error('A_STATUS_DECLARATION_SOURCE');
   const identity=declaresStatuses?{statusDeclarationId}:{};
   const handle=ctx.status.apply({owner:c.owner,target,abilityId:id,key:part.key,duration,polarity:part.polarity,dispel:op.dispel||'basic',pierces:!!op.pierces,values:part.values,...identity});
   if(!handle)continue;
   const s=read(ctx);for(const old of s.records.filter(x=>x.target===target&&x.key===part.key))cancelRecord(ctx,s,old);
   const row={n:s.next++,owner:c.owner,target,reflected:!!c.reflected,handle,key:part.key,polarity:part.polarity,pierces:!!op.pierces,startedAt:ctx.now,expires:ctx.now+duration,program:op.tick?paths.get(op.tick.ops):null,interval:op.tick?resolve(op.tick.interval,ctx,c):0,values:part.values,remaining:Number(part.values.shield||0),...identity};
   s.records.push(row);write(ctx,s);
   if(row.program)ctx.schedule({abilityId:id,owner:row.owner,target:row.target,handler:'statusPulse',delay:row.interval,data:{record:row.n},binding:{kind:'status',ref:row.handle},delivery:'actor.status-advance',...identity});
  }
  if(parts.some(part=>part.polarity==='positive')||!f.invulnerable&&(!f.debuffImmune||op.pierces))for(const type of controls)if(v[type])ctx.control.apply({owner:c.owner,target,abilityId:id,key:id,type,duration,pierces:!!op.pierces,dispel:op.dispel||'basic'});
 }
 function hit(ctx,c,amount,type=m.damage_type){return ctx.damage({source:c.owner,target:c.target,abilityId:id,amount,type:type==='none'?'magical':type,dot:true,blockable:false,reflected:!!c.reflected,noReflect:!!c.reflected,noLifesteal:!!c.reflected});}
 function execute(ctx,c,program){
  const ops=programs.get(program);if(!ops)throw Error('A_NONCANONICAL_PROGRAM');
  for(const op of ops){const target=op.to==='self'?c.owner:c.target,f=ctx.actor(target);
   if(!['delay','area'].includes(op.op)&&op.radius!==undefined&&Math.abs((op.center==='aim'?c.aimX:ctx.actor(c.owner).x)-f.x)>resolve(op.radius,ctx,c)*settings.unitScale)continue;
   switch(op.op){
    case 'damage':hit(ctx,{...c,target},resolve(op.amount,ctx,c),op.type||m.damage_type);break;
    case 'heal':ctx.heal({source:c.owner,target,abilityId:id,amount:resolve(op.amount,ctx,c)});break;
    case 'status':addStatus(ctx,c,op);break;
    case 'selfCost':ctx.selfDamage({actor:c.owner,abilityId:id,amount:ctx.actor(c.owner).maxHp*resolve(op.percent,ctx,c)/100,nonlethal:true});break;
    case 'mana':if(f.alive&&!f.invulnerable&&!f.debuffImmune){const requested=Math.max(0,resolve(op.amount,ctx,c));if(op.steal)ctx.transferMana({source:target,target:c.owner,abilityId:id,requested});else ctx.mana({actor:target,abilityId:id,delta:-Math.min(f.mp,requested)});}break;
    case 'delay':{const s=read(ctx),row={n:s.next++,owner:c.owner,target:c.target,reflected:!!c.reflected,handle:'pending',program:paths.get(op.ops),aimX:c.aimX,route:id==='vengefulspirit_magic_missile'&&!c.reflected};
     row.handle=ctx.schedule({abilityId:id,owner:row.owner,target:row.target,handler:'delayedProgram',delay:resolve(op.delay,ctx,c),data:{job:row.n},binding:{kind:'source-job'},delivery:'pack.job-due'});s.jobs.push(row);write(ctx,s);break;}
    case 'area':startArea(ctx,c,{duration:resolve(op.duration,ctx,c),interval:resolve(op.interval,ctx,c),radius:resolve(op.radius,ctx,c)*settings.unitScale,follow:!!op.follow,program:paths.get(op.ops),kind:'area'});break;
    case 'deferredHP':ctx.deferredHP.begin({owner:c.owner,target:c.owner,abilityId:id,duration:resolve(op.duration,ctx,c),damageFraction:resolve(op.damageFraction,ctx,c),deferHealing:false,healingMultiplier:1,repayDuration:resolve(op.repayDuration,ctx,c),nonlethal:op.nonlethal!==false,priority:0});break;
    case 'toggle':{const s=read(ctx),old=s.records.filter(x=>x.owner===c.owner&&x.key===id);
     if(old.length){old.forEach(x=>cancelRecord(ctx,s,x));write(ctx,s);}else addStatus(ctx,c,{...op,to:'self',duration:settings.statusToggleSeconds});break;}
    case 'upkeepPulse':{
     const domain=programTargets.find(x=>x.programId===program);
     if(!domain||domain.statusRecipient!=='self'||domain.effectRecipient!=='enemy'||c.target!==c.owner)throw Error('A_UPKEEP_PROGRAM_DOMAIN');
     const pulse={...c,target:1-c.owner,aimX:ctx.actor(1-c.owner).x},cost=resolve(op.cost,ctx,pulse);
     if(ctx.actor(c.owner).mp<cost){const s=read(ctx);s.records.filter(x=>x.owner===c.owner&&x.key===id).forEach(x=>cancelRecord(ctx,s,x));write(ctx,s);}
     else{ctx.mana({actor:c.owner,abilityId:id,delta:-cost});if(ctx.target.distance(c.owner,pulse.target)<=resolve(op.radius,ctx,pulse)*settings.unitScale)execute(ctx,pulse,paths.get(op.ops));}
     break;
    }
    case 'special':if(op.name==='siphon')startArea(ctx,c,{duration:m.params.haunt_duration,interval:.25,radius:(m.params.AbilityCastRange+m.params.siphon_buffer)*settings.unitScale,follow:true,program:null,kind:'siphon'});else throw new HostPortRequired(id);break;
    case 'swap':case 'mark':case 'rupture':case 'pullStep':throw new HostPortRequired(id);
    default:throw Error('A_UNSUPPORTED_RECIPE_OPERATION:'+id+'/'+op.op);
   }
  }
 }
 function startArea(ctx,c,fields){
  if(fields.interval<=0)throw Error('A_INVALID_INTERVAL');if(fields.kind==='siphon')throw new HostPortRequired(id);
  // The declared native area primitive supplies the accepted lifecycle reference.
  // Host owns its clock/follow/geometry; this record never substitutes for an entity.
  const handle=ctx.legacyEffect.spawn({abilityId:id,owner:c.owner,castId:c.castId,kind:'area',x:fields.follow?ctx.actor(c.owner).x:c.aimX,radius:fields.radius,duration:fields.duration,data:{target:c.target,interval:fields.interval,follow:fields.follow}});
  if(typeof handle!=='string'||!/^[-a-zA-Z0-9_:/.]{1,160}$/.test(handle))throw Error('A-ENTITY-14: native area admission requires an accepted opaque handle');
  const s=read(ctx),row={n:s.next++,owner:c.owner,target:c.target,reflected:!!c.reflected,handle,startedAt:ctx.now,expires:ctx.now+fields.duration,interval:fields.interval,radius:fields.radius,follow:fields.follow,aimX:c.aimX,program:fields.program,kind:fields.kind,pulses:0};
  s.areas.push(row);write(ctx,s);ctx.schedule({abilityId:id,owner:row.owner,target:row.target,handler:'areaPulse',delay:fields.interval,data:{area:row.n},binding:{kind:'entity',mode:'area',ref:row.handle},delivery:'pack.entity'});
 }
 function route(ctx,c){return ctx.target.route({owner:c.owner,target:c.target,abilityId:id,range:settings.routedDeliveryRange,reflectable:true,reflected:!!c.reflected});}
 const scheduledHandlers={
  delayedProgram(ctx,data){const s=read(ctx),j=s.jobs.find(x=>x.n===data.job);if(!j)return;s.jobs=s.jobs.filter(x=>x.n!==j.n);write(ctx,s);
   if(!ctx.actor(j.owner).alive||!ctx.actor(j.target).alive)return;let c={...j};if(j.route){const routed=route(ctx,c);if(!routed.accepted)return;c={...c,...routed};}execute(ctx,c,j.program);
  },
  statusPulse(ctx,data){const s=read(ctx),row=s.records.find(x=>x.n===data.record);if(!row)return;
   if(!exists(ctx,row)){cancelRecord(ctx,s,row);write(ctx,s);return;}
   if(effective(ctx,row))execute(ctx,{...row,aimX:ctx.actor(row.target).x},row.program);
   const next=read(ctx).records.find(x=>x.n===row.n);if(next&&ctx.now+row.interval<=row.expires+1e-8)ctx.schedule({abilityId:id,owner:next.owner,target:next.target,handler:'statusPulse',delay:next.interval,data:{record:next.n},binding:{kind:'status',ref:next.handle},delivery:'actor.status-advance',...(declaresStatuses?{statusDeclarationId:next.statusDeclarationId}:{})});
  },
  areaPulse(ctx,data){if(!data||!Number.isSafeInteger(data.area)||data.area<1)throw Error('A-AREA-CLOCK-01: canonical area locator required');const s=read(ctx),row=s.areas.find(x=>x.n===data.area);if(!row)return;
   // Host authenticates the entity/job ref, source and consumed native pulse.
   // Public checks the declared readonly facts and source-derived next ordinal;
   // an opaque delivery handle is never parsed into identity or a clock.
   const expectedAt=row.startedAt+(row.pulses+1)*row.interval;
   if(!Number.isFinite(data.callbackAt)||data.callbackAt<0||data.callbackAt>ctx.now+1e-8||Math.abs(data.callbackAt-expectedAt)>1e-8||data.callbackAt>row.expires+1e-8||typeof data.nativeExpired!=='boolean'||typeof data.handle!=='string'||data.handle.length<1||data.handle.length>160||data.nativeExpired&&ctx.now<row.expires-1e-8)throw Error('A-AREA-CLOCK-01: authenticated nominal callback/native lifetime facts required');
   const owner=ctx.actor(row.owner),target=ctx.actor(row.target);
   if(!owner.alive){ctx.legacyEffect.end(row.handle,'owner-dead');s.areas=s.areas.filter(x=>x.n!==row.n);write(ctx,s);return;}
   row.pulses++;write(ctx,s);
   // Keep ctx.now actual: child statuses, heals and damage are born at the
   // native frame/resource clock, even when this callback is caught up late.
   if(Math.abs(target.x-(row.follow?owner.x:row.aimX))<=row.radius)execute(ctx,{...row,aimX:row.follow?owner.x:row.aimX},row.program);
   if(data.callbackAt+row.interval<=row.expires+1e-8)ctx.schedule({abilityId:id,owner:row.owner,target:row.target,handler:'areaPulse',delay:row.interval,data:{area:row.n},binding:{kind:'entity',mode:'area',ref:row.handle},delivery:'pack.entity'});
   else if(data.nativeExpired){ctx.legacyEffect.end(row.handle,'expired');const after=read(ctx);after.areas=after.areas.filter(x=>x.n!==row.n);write(ctx,after);}
   // A non-integral duration can have its last nominal pulse while still live.
   // Leave its area for native expiry/reconciliation; never end it early.
  }
 };
 function liveRows(ctx,actor){return read(ctx).records.filter(x=>x.target===actor&&effective(ctx,x));}
 function sum(ctx,actor,key){return liveRows(ctx,actor).reduce((n,x)=>n+Number(x.values[key]||0),0);}
 return {
  behaviorId:'heros/a/v8/'+id,revision:areaDeliveryClock?'2.3.0':usesEffectiveRange||declaresStatuses||programTargets.length?'2.2.0':'2.1.0',...codeIdentity(A_SOURCE_FILES),requires:capabilities(a),namespace:'heros/a/'+id,stateSchema,
  ...(usesEffectiveRange?{requiredCastFacts:['effectiveCastRange']}:{}),
  ...(declaresStatuses?{statusDeclarations}:{}),
  ...(capabilities(a).includes('schedule')?{scheduledBindings:{
   ...(statusSchemas.some(x=>x.program)?{statusPulse:[{binding:'status',delivery:'actor.status-advance'}]}:{}),
   ...(delayPrograms.size?{delayedProgram:[{binding:'source-job',delivery:'pack.job-due'}]}:{}),
   ...(areaSchemas.some(x=>x.kind==='area')?{areaPulse:[{binding:'entity-area',delivery:'pack.entity'}]}:{})
  }}:{}),
  planCast(ctx,facts){const owner=ctx.actor(facts.owner),target=ctx.actor(facts.target),base={manaCost:m.mana,cooldownSeconds:m.cooldown_s,chargeCost:m.charges?1:0,windupSeconds:m.startup_frames/60,recoverySeconds:m.recovery_frames/60,action:'cast'};
   let reason=m.passive?'passive':HOST_REQUESTS[id]||(!owner.alive?'dead':!facts.actionReady?'action':owner.silenced?'silenced':null);
   const toggle=r.toggle&&liveRows(ctx,facts.owner).some(x=>x.key===id);if(toggle&&!reason)return {...base,accepted:true,manaCost:0,cooldownSeconds:0,chargeCost:0,windupSeconds:0,recoverySeconds:0,action:'toggle-off'};
   if(!reason&&facts.cooldownRemaining>1e-8)reason='cooldown';if(!reason&&facts.manaAvailable<m.mana)reason='mana';if(!reason&&m.charges&&facts.chargesAvailable<=0)reason='charges';
   if(!reason&&r.target==='enemy'&&(!target.alive||target.invulnerable||ctx.target.distance(facts.owner,facts.target)>(usesEffectiveRange?facts.effectiveCastRange:m.range_wu)+22))reason='target';
   if(!reason&&!Number.isFinite(facts.aimX))reason='aim';
   if(!reason&&r.target==='point'&&(facts.aimX<45||facts.aimX>1155||Math.abs(facts.aimX-owner.x)>m.range_wu+22))reason='aim';
   return {...base,accepted:!reason,...(reason?{reason}:{})};
  },
  activate(ctx,event){if(m.passive)throw Error('A_PASSIVE_ACTIVATION');if(HOST_REQUESTS[id])throw new HostPortRequired(id);
   let c={...event};if(r.target==='enemy'&&id!=='vengefulspirit_magic_missile'){const routed=route(ctx,c);if(!routed.accepted)return {accepted:false,reason:routed.reason};c={...c,...routed};}
   execute(ctx,c,root);ctx.cue({kind:'cast',abilityId:id,actor:event.owner});return {accepted:true};
  },
  projectAttack(ctx,event){let amount=event.amount;
   if(id==='kunkka_tidebringer'&&ctx.actor(event.actor).passivesEnabled&&liveRows(ctx,event.actor).some(x=>x.key===id))amount+=m.params.damage_bonus;
   if(r.stats?.attackPct&&ctx.actor(event.actor).heroId===config.hero.registryNumericId&&ctx.actor(event.actor).passivesEnabled)amount*=1+resolve(r.stats.attackPct,ctx,{owner:event.actor,target:1-event.actor});
   return {amount:amount*(1-clamp(sum(ctx,event.actor,'attackReduction'),0,1))};
  },
  projectDamage(ctx,event){let amount=event.amount;const source=event.source,target=event.target;
   if(!['pre-mitigation','post-mitigation'].includes(event.stage))throw Error('A-STAGE-09: explicit damage projection stage required');
   if(event.stage==='pre-mitigation'){
    if(!event.basic&&!event.reflected)amount*=1+sum(ctx,source,'spellAmp');
    if(event.type==='magical')amount*=(1-clamp(sum(ctx,target,'magicResist'),0,1))*(1+sum(ctx,target,'magicVulnerable'));
    if(event.basic)amount*=1-clamp(sum(ctx,target,'basicReduction'),0,1);
   }
   const shieldDebits=[];if(event.stage==='post-mitigation'){
    if(event.type==='physical'&&sum(ctx,target,'physicalImmune'))amount=0;
    for(const row of liveRows(ctx,target)){const debit=Math.min(amount,row.remaining);if(debit>0){amount-=debit;shieldDebits.push({record:row.n,amount:debit});}}
   }
   return {amount,armor:event.stage==='pre-mitigation'&&event.type==='physical'?sum(ctx,target,'armor'):0,shieldDebits};
  },
  projectHealing(ctx,event){return {amount:event.amount*(1+sum(ctx,event.actor,'healAmp'))};},
  projectInterval(ctx,event){return {seconds:event.seconds*100/Math.max(20,100+sum(ctx,event.actor,'attackSpeed')-sum(ctx,event.actor,'attackSlow'))};},
  onAttack(ctx,event){if(!event.landed||event.secondary||!ctx.actor(event.owner).passivesEnabled)return;
   if(r.attack?.requiresToggle&&!liveRows(ctx,event.owner).some(x=>x.key===id))return;
   if(r.attack?.ops?.length)execute(ctx,{...event,aimX:ctx.actor(event.target).x,reflected:false},paths.get(r.attack.ops));
   if(r.attack?.consumeToggle){const s=read(ctx);s.records.filter(x=>x.owner===event.owner&&x.key===id).forEach(x=>cancelRecord(ctx,s,x));write(ctx,s);}
  },
  onDamage(ctx,event){if(event.kind!=='shield-committed')return;const s=read(ctx),row=s.records.find(x=>x.n===event.record);if(!row||!finite(event.amount)||event.amount>row.remaining)throw Error('A_INVALID_SHIELD_COMMIT');row.remaining-=event.amount;write(ctx,s);},
  onStage(ctx,event){if(event.kind==='passive-pulse'&&r.aura){
    const owner=ctx.actor(event.owner);if(owner.heroId!==config.hero.registryNumericId)throw Error('A_PASSIVE_OWNER');
    if(owner.alive&&owner.passivesEnabled&&ctx.target.distance(event.owner,1-event.owner)<=resolve(r.aura.radius,ctx,{owner:event.owner,target:1-event.owner})*settings.unitScale)
     execute(ctx,{owner:event.owner,target:1-event.owner,aimX:owner.x,reflected:false},paths.get(r.aura.ops));
   }else if(event.kind==='status-removed'){const s=read(ctx);s.records=s.records.filter(x=>x.handle!==event.handle);write(ctx,s);
   }else if(event.kind==='effect-end'){const s=read(ctx);s.areas=s.areas.filter(x=>x.handle!==event.handle);write(ctx,s);
   }else if(event.kind==='job-ended'){const s=read(ctx);s.jobs=s.jobs.filter(x=>x.handle!==event.handle);write(ctx,s);}
  },
  onInterrupt(){/* Launched V8 non-channel programs survive interruption. Gaze is gated. */},
  onDeath(ctx,event){const s=read(ctx);s.records.filter(x=>x.target===event.actor).forEach(x=>cancelRecord(ctx,s,x));for(const x of s.jobs.filter(x=>x.owner===event.actor))ctx.cancelJob(x.handle);s.jobs=s.jobs.filter(x=>x.owner!==event.actor);for(const x of s.areas.filter(x=>x.owner===event.actor))ctx.legacyEffect.end(x.handle,'owner-dead');s.areas=s.areas.filter(x=>x.owner!==event.actor);write(ctx,s);},
  scheduledHandlers
 };
}
