import {canonicalExtension,EXTENSION_SOURCE_FILES} from './canonical.js';
import {BATTLE_ABI,codeIdentity} from '../../../index.js';
/** Review-only registry binding. It returns intents and never dispatches missing ports. */
export const extensionProposalFactory=Object.freeze({abiVersion:BATTLE_ABI,parameters:{mode:'proposal-only'},create(config){
 if(config.parameters?.mode!=='proposal-only'||Object.keys(config.parameters).length!==1)throw Error('A_INVALID_PROPOSAL_PARAMETERS');
 const {rule,stateSchema}=canonicalExtension(config);
 return {behaviorId:'heros/a/proposal/'+config.definition.id,revision:'2.0.0',...codeIdentity([...EXTENSION_SOURCE_FILES,'rules/a/extensions/proposal.js']),requires:[],namespace:'heros/a/proposal/'+config.definition.id,stateSchema,
  onStage(ctx,event){if(event.kind!=='extension-proposal')throw Error('A_PROPOSAL_EVENT_REQUIRED');const handler=rule.handlers[event.handler];if(!handler)throw Error('A_UNKNOWN_PROPOSAL_HANDLER');
   const facts={...event.facts};if(facts.owner!==undefined)facts.owner=ctx.actor(facts.owner);if(facts.target!==undefined)facts.target=ctx.actor(facts.target);
   const next=handler(ctx.state.read(),facts);ctx.state.write(next.state);return {requiresHostContract:true,commands:next.commands};
  }
 };
}});

// Canonical command protocol. Explicit opt-in only; default registerA/gates stay.
// Provider authenticates native admission/resources; this module owns reduction.
import {defineStateSchema} from '../../../index.js';
import {createExtensionDraft} from './index.mjs';
const freezeDispatch=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freezeDispatch);Object.freeze(v);}return v;};
const stableDispatch=v=>JSON.stringify(v,(_,x)=>x&&Object.getPrototypeOf(x)===Object.prototype?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const obj=(p,optional=[])=>({type:'object',additionalProperties:false,required:Object.keys(p).filter(k=>!optional.includes(k)),properties:p});
const scalarDispatch={type:'number',minimum:0},actorDispatch={enum:[0,1]},boolDispatch={type:'boolean'},opaqueDispatch={type:'string',minLength:1,maxLength:128};
const ordinalDispatch={type:'integer',minimum:1,maximum:Number.MAX_SAFE_INTEGER};
const nullableHandle={anyOf:[{type:'null'},opaqueDispatch]},lit=x=>({const:x});
const reasonDispatch={enum:['control','input-cancel','movement','action','silence','interrupted','expired','owner-dead']};
const castFact={castId:opaqueDispatch},beginFact=obj({...castFact,owner:actorDispatch,target:actorDispatch,accepted:boolDispatch,reflected:boolDispatch});
const receiptFact={anyOf:[obj({...castFact,accepted:lit(true),handle:opaqueDispatch}),obj({...castFact,accepted:lit(false),handle:lit(null)})]};
const removalFact=obj({...castFact,handle:opaqueDispatch}),deathFact=obj({actor:actorDispatch});
const damageReceiptDispatch=obj({accepted:boolDispatch,landed:boolDispatch,guarded:boolDispatch,raw:scalarDispatch,actual:scalarDispatch,deferred:scalarDispatch,killedAtDebit:boolDispatch});
const H=(facts,actors,commands,binding)=>({facts,actorViews:actors,commands,binding});
const skill=(heroId,slot,handlers,commandSchemas)=>({heroId,slot,handlers,commandSchemas});
const commandBase=id=>({abilityId:lit(id)});
const damageShape=(id,type,receipt=false)=>obj({kind:lit('damage'),...commandBase(id),source:actorDispatch,target:actorDispatch,amount:scalarDispatch,type:lit(type),dot:lit(true),blockable:lit(false),reflected:boolDispatch,noReflect:boolDispatch,noLifesteal:boolDispatch,...(receipt?{receiptHandler:lit('damageReceipt'),receiptId:ordinalDispatch}:{})});
const statusShape=(id,key,values,{positive=false,pierces=false,dispel='basic',interval=0,receipt=false}={})=>obj({kind:lit('apply-status'),...commandBase(id),requestId:lit(key),owner:actorDispatch,target:actorDispatch,key:lit(key),duration:scalarDispatch,polarity:lit(positive?'positive':'negative'),pierces:lit(pierces),dispel:lit(dispel),interval:lit(interval),values:obj(values),...(receipt?{receiptHandler:lit('corrosionReceipt'),receiptTarget:actorDispatch}:{})});
const swap='vengefulspirit_nether_swap',mark='kunkka_x_marks_the_spot',rupture='bloodseeker_rupture',gaze='lich_sinister_gaze',exorcism='death_prophet_exorcism',dragon='dragon_knight_elder_dragon_form';
const selectedDefinitions={
 [swap]:skill(28,3,{
  begin:H(beginFact,['owner','target'],['atomic-swap','damage','apply-status'],'admitted-routed-cast'),statusReceipt:H(receiptFact,[],[],'status-admission'),
  projectPostMitigation:H(obj({...castFact,effective:boolDispatch,target:actorDispatch,amount:scalarDispatch}),['target'],['damage-projection'],'status-post-mitigation-preview'),
  shieldCommitted:H(obj({...castFact,handle:opaqueDispatch,ordinal:ordinalDispatch,amount:scalarDispatch}),[],[],'status-actual-shield-debit'),statusRemoved:H(removalFact,[],[],'status-removal'),death:H(deathFact,[],[],'resource-scoped-death')
 },{
  'atomic-swap':obj({kind:lit('atomic-swap'),...commandBase(swap),castId:opaqueDispatch,owner:actorDispatch,target:actorDispatch,ownerDestinationX:{type:'number',minimum:45,maximum:1155},targetDestinationX:{type:'number',minimum:45,maximum:1155},interruptTarget:lit(true),collisionPolicy:lit('v8-move')}),
  damage:damageShape(swap,'magical'),'apply-status':statusShape(swap,swap,{shield:scalarDispatch},{positive:true}),
  'damage-projection':obj({kind:lit('damage-projection'),...commandBase(swap),amount:scalarDispatch,shieldDebit:scalarDispatch,statusHandle:opaqueDispatch})
 }),
 [mark]:skill(29,2,{
  begin:H(beginFact,['owner','target'],['apply-status'],'admitted-routed-cast'),statusReceipt:H(receiptFact,[],[],'status-admission'),
  statusExpiring:H(obj({...castFact,handle:opaqueDispatch,target:actorDispatch,effective:boolDispatch}),['target'],['forced-return'],'natural-status-expiry-before-removal'),statusRemoved:H(removalFact,[],[],'status-removal-no-return'),death:H(deathFact,[],[],'resource-scoped-death')
 },{'apply-status':statusShape(mark,mark,{}, {dispel:'none'}),'forced-return':obj({kind:lit('forced-return'),...commandBase(mark),castId:opaqueDispatch,actor:actorDispatch,destinationX:{type:'number',minimum:45,maximum:1155},rootPolicy:lit('v8-forced-motion'),collisionPolicy:lit('v8-move')})}),
 [rupture]:skill(21,3,{
  begin:H(beginFact,['owner','target'],['damage','apply-status'],'admitted-routed-cast'),statusReceipt:H(receiptFact,[],[],'status-admission'),
  movementObserved:H(obj({...castFact,handle:opaqueDispatch,ordinal:ordinalDispatch,target:actorDispatch,effective:boolDispatch}),['target'],['damage'],'actor.status-pre-advance-observation'),statusRemoved:H(removalFact,[],[],'status-removal'),death:H(deathFact,[],[],'resource-scoped-death')
 },{damage:damageShape(rupture,'pure'),'apply-status':statusShape(rupture,rupture,{rupture:scalarDispatch,damageCap:scalarDispatch},{pierces:true,dispel:'none'})}),
 [gaze]:skill(32,2,{
  begin:H(beginFact,['owner','target'],['begin-channel-area'],'admitted-routed-cast'),channelReceipt:H(receiptFact,[],[],'channel-admission'),
  gazePulse:H(obj({...castFact,handle:opaqueDispatch,ordinal:ordinalDispatch,owner:actorDispatch,target:actorDispatch,channelAliveBeforePulse:boolDispatch,tokenValid:boolDispatch,reason:reasonDispatch},['reason']),['owner','target'],['end-channel-area','transfer-mana','apply-status','control','bounded-pull'],'channel-advance-before-pulse'),
  interrupted:H(obj({...castFact,reason:reasonDispatch},['reason']),[],['end-channel-area'],'irreversible-channel-cancellation'),expired:H(removalFact,[],['end-channel-area'],'channel-expiry'),death:H(deathFact,[],['end-channel-area'],'resource-scoped-death')
 },{
  'begin-channel-area':obj({kind:lit('begin-channel-area'),...commandBase(gaze),castId:opaqueDispatch,owner:actorDispatch,target:actorDispatch,duration:scalarDispatch,interval:lit(.25),radius:lit(330),followOwner:lit(true),lockMovement:lit(true),lockAttacks:lit(true),lockCasts:lit(true),cancellation:lit(['control','input-cancel','movement','action','silence']),handler:lit('gazePulse')}),
  'end-channel-area':obj({kind:lit('end-channel-area'),...commandBase(gaze),castId:opaqueDispatch,channelHandle:nullableHandle,reason:reasonDispatch}),
  'transfer-mana':obj({kind:lit('transfer-mana'),...commandBase(gaze),source:actorDispatch,target:actorDispatch,requested:scalarDispatch}),
  'apply-status':statusShape(gaze,gaze,{stun:lit(true)},{dispel:'strong'}),
  control:obj({kind:lit('control'),...commandBase(gaze),owner:actorDispatch,target:actorDispatch,type:lit('stun'),duration:lit(.25),pierces:lit(false),dispel:lit('strong')}),
  'bounded-pull':obj({kind:lit('bounded-pull'),...commandBase(gaze),castId:opaqueDispatch,actor:actorDispatch,destinationX:{type:'number',minimum:45,maximum:1155},maxDistance:lit(25),rootPolicy:lit('v8-forced-motion'),collisionPolicy:lit('v8-move')})
 }),
 [exorcism]:skill(42,3,{
  begin:H(beginFact,['owner','target'],['end-returning-spirits','begin-returning-spirits'],'admitted-routed-cast'),swarmReceipt:H(receiptFact,[],[],'swarm-admission'),
  hostileArrival:H(obj({...castFact,handle:opaqueDispatch,ordinal:ordinalDispatch,owner:actorDispatch,target:actorDispatch}),['owner','target'],['damage'],'swarm-hostile-contact'),
  damageReceipt:H(obj({...castFact,ordinal:ordinalDispatch,receipt:damageReceiptDispatch}),[],[],'contact-actual-damage-receipt'),
  expired:H(obj({...castFact,handle:opaqueDispatch,owner:actorDispatch}),['owner'],['heal'],'swarm-natural-expiry-after-receipts'),death:H(deathFact,[],['end-returning-spirits'],'resource-scoped-death')
 },{
  'begin-returning-spirits':obj({kind:lit('begin-returning-spirits'),...commandBase(exorcism),castId:opaqueDispatch,owner:actorDispatch,target:actorDispatch,duration:scalarDispatch,maxSpirits:{type:'integer',minimum:0,maximum:64},spawnInterval:{type:'number',minimum:Number.MIN_VALUE},speed:scalarDispatch,giveUpDistance:scalarDispatch,returnOnTargetDead:lit(true),contactHandler:lit('hostileArrival'),expiryHandler:lit('expired')}),
  'end-returning-spirits':obj({kind:lit('end-returning-spirits'),...commandBase(exorcism),castId:opaqueDispatch,handle:nullableHandle,reason:{enum:['replaced','owner-dead']}}),damage:damageShape(exorcism,'physical',true),
  heal:obj({kind:lit('heal'),...commandBase(exorcism),source:actorDispatch,target:actorDispatch,amount:scalarDispatch})
 }),
 [dragon]:skill(47,3,{
  begin:H(beginFact,['owner','target'],['apply-status','begin-attack-range-profile'],'admitted-routed-cast'),formReceipt:H(receiptFact,[],[],'form-status-admission'),profileReceipt:H(receiptFact,[],[],'native-profile-admission'),
  projectAbilityRange:H(obj({...castFact,formEffective:boolDispatch}),[],['cast-range-contribution'],'effective-form-range-preview'),projectMovement:H(obj({...castFact,formEffective:boolDispatch}),[],['movement-contribution'],'effective-form-movement-preview'),
  landedAttack:H(obj({owner:actorDispatch,target:actorDispatch,formPresent:boolDispatch,landed:boolDispatch,secondary:boolDispatch,ordinal:ordinalDispatch}),['owner','target'],['apply-status'],'native-landed-primary-attack'),
  corrosionReceipt:H({anyOf:[obj({accepted:lit(true),handle:opaqueDispatch,target:actorDispatch}),obj({accepted:lit(false),handle:lit(null),target:actorDispatch})]},[],[],'originating-attack-corrosion-admission'),
  corrosionPulse:H(obj({handle:opaqueDispatch,ordinal:ordinalDispatch,owner:actorDispatch,target:actorDispatch,effective:boolDispatch}),['owner','target'],['damage'],'corrosion-status-live-slice-independent-of-form'),
  formExpired:H(obj({handle:opaqueDispatch}),[],[],'form-status-expiry'),profileExpired:H(obj({handle:opaqueDispatch}),[],[],'native-profile-expiry'),statusRemoved:H(obj({handle:opaqueDispatch}),[],[],'status-removal'),death:H(deathFact,[],['end-attack-range-profile'],'resource-scoped-death')
 },{
  'apply-status':{anyOf:[statusShape(dragon,dragon,{attackRange:scalarDispatch,moveFlat:scalarDispatch},{positive:true,dispel:'none'}),statusShape(dragon,dragon+'_corrosion',{}, {interval:1,receipt:true}),statusShape(dragon,dragon+'_frost',{moveSlow:scalarDispatch,attackSlow:scalarDispatch},{pierces:true})]},
  'begin-attack-range-profile':obj({kind:lit('begin-attack-range-profile'),...commandBase(dragon),castId:opaqueDispatch,actor:actorDispatch,attackRangeBonus:scalarDispatch,duration:scalarDispatch}),
  'end-attack-range-profile':obj({kind:lit('end-attack-range-profile'),...commandBase(dragon),castId:opaqueDispatch,actor:actorDispatch,handle:opaqueDispatch,reason:lit('owner-dead')}),
  'cast-range-contribution':obj({kind:lit('cast-range-contribution'),...commandBase(dragon),actor:actorDispatch,flat:scalarDispatch}),
  'movement-contribution':obj({kind:lit('movement-contribution'),...commandBase(dragon),actor:actorDispatch,flat:scalarDispatch}),damage:damageShape(dragon,'magical')
 })
};
export const A_EXTENSION_DISPATCH=freezeDispatch({id:'heros/a/extension-dispatch/1',version:1,eventKind:'a-extension-dispatch',originOwner:'envelope.owner',routedActors:'facts',resultKind:'a-extension-commands',eventEnvelope:{requiredKeys:['abilityId','dispatchId','facts','handler','kind','owner','slot'],additionalProperties:false,fixed:{kind:'a-extension-dispatch',dispatchId:'heros/a/extension-dispatch/1'},selectedRowFields:['abilityId','slot'],owner:actorDispatch,handlerBinding:'skills[abilityId].handlers',factsBinding:'skills[abilityId].handlers[handler].facts'},resultEnvelope:{requiredKeys:['abilityId','commands','dispatchId','handler','kind','owner','slot'],additionalProperties:false,fixed:{kind:'a-extension-commands',dispatchId:'heros/a/extension-dispatch/1'},echoFields:['abilityId','slot','owner','handler'],commandsBinding:'skills[abilityId].handlers[handler].commands + skills[abilityId].commandSchemas'},statusTranslation:{sourceField:'interval',unit:'seconds',zero:'omit native intervalSeconds',positive:'native intervalSeconds = exact intent.interval',periodic:{skill:dragon,key:dragon+'_corrosion',handler:'corrosionPulse',binding:'status',delivery:'actor.status-advance',clock:'native lifetime-limited status live slice',ordinal:'authenticated per corrosion resource'},markExpiry:{handler:'statusExpiring',delivery:'natural expiry before status removal',dispel:'statusRemoved only; no return'}},skills:selectedDefinitions});
const canonicalParameters=freezeDispatch({mode:'canonical-command-dispatch',dispatch:A_EXTENSION_DISPATCH});
const validatorDispatch=new Map();
function acceptsDispatch(key,schema,value){let v=validatorDispatch.get(key);if(!v){v=defineStateSchema({id:'heros/a/wire/'+key,version:'1.0.0',schema}).validate;validatorDispatch.set(key,v);}return v(value);}
export function validateExtensionCommands(abilityId,handler,commands){
 const declared=A_EXTENSION_DISPATCH.skills[abilityId],entry=declared?.handlers[handler];if(!entry||!Array.isArray(commands)||commands.length>8)throw Error('A_DISPATCH_COMMAND_LIST');
 for(const command of commands){if(!command||!entry.commands.includes(command.kind)||!acceptsDispatch(abilityId+'/'+command.kind,declared.commandSchemas[command.kind],command))throw Error('A_DISPATCH_COMMAND_SHAPE');
  if(command.kind==='damage'&&(command.noReflect!==command.reflected||command.noLifesteal!==command.reflected))throw Error('A_DISPATCH_DAMAGE_FLAGS');
 }
 return true;
}
export function refineCanonicalDispatchState(state,parameters){
 if(state===null)return true;const machine=createExtensionDraft(parameters.definition),handles=new Set();
 for(const own of state.casts){if(!machine.validateState(own))return false;if(own)for(const ref of [own.statusHandle,own.channelHandle,own.swarmHandle,own.formHandle,own.profileHandle,...(own.corrosion??[]).map(x=>x.handle)]){if(ref==null)continue;if(handles.has(ref))return false;handles.add(ref);}}
 return true;
}
/** Canonical named JSON protocol; explicit registry opt-in, no native wiring claim. */
export const extensionCanonicalFactory=Object.freeze({abiVersion:BATTLE_ABI,parameters:canonicalParameters,create(config){
 if(stableDispatch(config.parameters)!==stableDispatch(canonicalParameters))throw Error('A_DISPATCH_PARAMETERS');
 const id=config.definition.id,declared=A_EXTENSION_DISPATCH.skills[id];if(!declared||config.hero.registryNumericId!==declared.heroId||config.hero.abilities[declared.slot]?.id!==id)throw Error('A_DISPATCH_SKILL_ROW');
 const {rule,stateSchema:single}=canonicalExtension(config),identity=codeIdentity([...EXTENSION_SOURCE_FILES,'rules/a/extensions/proposal.js']);
 const schema=defineStateSchema({id:'heros/a/extension-dispatch/'+id,version:'1.0.0',schema:{anyOf:[{type:'null'},obj({casts:{type:'array',minItems:2,maxItems:2,items:single.schema}})]},parameters:{definition:config.definition,dispatch:A_EXTENSION_DISPATCH,originOwner:'envelope.owner'},refinement:{id:'heros/a/extension-dispatch/actor-resource-state',...identity,validate:refineCanonicalDispatchState}});
 return {behaviorId:'heros/a/extension-dispatch/'+id,revision:'1.0.0',...identity,requires:[],namespace:'heros/a/extension-dispatch/'+id,stateSchema:schema,
  onStage(ctx,event){
   // Validate envelope without letting a handler name choose an arbitrary program.
   if(!event||Object.keys(event).sort().join(',')!==A_EXTENSION_DISPATCH.eventEnvelope.requiredKeys.join(',')||event.kind!==A_EXTENSION_DISPATCH.eventKind||event.dispatchId!==A_EXTENSION_DISPATCH.id||event.abilityId!==id||event.slot!==declared.slot||!Object.hasOwn(declared.handlers,event.handler)||event.owner!==0&&event.owner!==1)throw Error('A_DISPATCH_ENVELOPE');
   const chosen=declared.handlers[event.handler];if(!acceptsDispatch(id+'/'+event.handler,chosen.facts,event.facts))throw Error('A_DISPATCH_FACTS');
   if(event.handler==='damageReceipt'&&!event.facts.receipt.accepted&&event.facts.receipt.actual>0)throw Error('A_DISPATCH_REJECTED_DAMAGE_CREDIT');
   const facts={...event.facts};for(const name of chosen.actorViews)facts[name]=ctx.actor(facts[name]);
   const state=structuredClone(ctx.state.read()??{casts:[null,null]}),next=rule.handlers[event.handler](state.casts[event.owner],facts);
   validateExtensionCommands(id,event.handler,next.commands);state.casts[event.owner]=next.state;
   if(!schema.validate(state))throw Error('A_DISPATCH_OWN_STATE');ctx.state.write(state);
   return {kind:A_EXTENSION_DISPATCH.resultKind,dispatchId:A_EXTENSION_DISPATCH.id,abilityId:id,slot:declared.slot,owner:event.owner,handler:event.handler,commands:next.commands};
  }
 };
}});
