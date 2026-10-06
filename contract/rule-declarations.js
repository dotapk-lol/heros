import {canonical,freeze,json} from './value.js';

const actor=id=>id===0||id===1;
const exact=(v,keys)=>!!v&&Object.getPrototypeOf(v)===Object.prototype&&Object.keys(v).sort().join(',')===keys.slice().sort().join(',');
const bounded=n=>Number.isFinite(n)&&n>=0&&n<=3600;
const identity=s=>typeof s==='string'&&/^[A-Za-z0-9][A-Za-z0-9_:/.\-]{0,159}$/.test(s);

export function validateCastFactRequirements(value,implementation){
 if(value===undefined)return null;
 if(!Array.isArray(value)||value.length!==1||value[0]!=='effectiveCastRange'||typeof implementation.planCast!=='function')throw Error('Invalid declared cast fact requirements');
 return Object.freeze([...value]);
}

export function validateDeclaredCastFacts(implementation,slot,hook,facts){
 const declared=implementation.requiredCastFacts?.includes('effectiveCastRange');
 if(Object.hasOwn(facts,'effectiveCastRange')&&(!declared||hook!=='planCast'))throw Error('Undeclared or misplaced effective cast range fact');
 if(!declared||hook!=='planCast')return;
 if(!Object.hasOwn(facts,'effectiveCastRange')||!Number.isFinite(facts.effectiveCastRange)||facts.effectiveCastRange<0||facts.effectiveCastRange>1e7)throw Error('Missing or invalid effective cast range fact');
 if(!actor(facts.owner)||!actor(facts.target)||facts.slot!==slot||typeof facts.abilityId!=='string')throw Error('Mismatched effective cast range fact identity');
}

const declarationKeys=['id','key','recipient','duration','interval','programId','schedule','polarity','dispel','pierces','values'];
export function validateStatusDeclarations(value,implementation,scheduledBindings){
 if(value===undefined)return null;
 if(!Array.isArray(value)||!value.length||value.length>128||!implementation.requires.includes('status'))throw Error('Invalid declared status identity table');
 const table=json(value),ids=new Set(),domains=new Set();
 for(const d of table){
  if(!exact(d,declarationKeys)||!identity(d.id)||!identity(d.key)||!['self','enemy'].includes(d.recipient)||!bounded(d.duration)||!bounded(d.interval)||!['positive','negative'].includes(d.polarity)||!['basic','strong','none'].includes(d.dispel)||typeof d.pierces!=='boolean'||!d.values||Object.getPrototypeOf(d.values)!==Object.prototype||Object.keys(d.values).length>64)throw Error('Invalid status declaration');
  const domain=d.key+':'+d.recipient;
  if(ids.has(d.id)||domains.has(domain))throw Error('Ambiguous status declaration identity or recipient domain');
  ids.add(d.id);domains.add(domain);
  if(d.programId===null){if(d.interval!==0||d.schedule!==null)throw Error('Unscheduled status cannot declare a pulse');}
  else{
   const s=d.schedule;
   if(!identity(d.programId)||d.interval<=0||!exact(s,['handler','binding','delivery'])||typeof s.handler!=='string'||!/^[-\w]{1,64}$/.test(s.handler)||s.binding!=='status'||!['actor.status-pre-advance','actor.status-advance'].includes(s.delivery)||!Object.hasOwn(implementation.scheduledHandlers??{},s.handler)||!implementation.requires.includes('schedule')||!scheduledBindings?.[s.handler]?.some(pair=>pair.binding==='status'&&pair.delivery===s.delivery))throw Error('Invalid status program/binding declaration');
  }
 }
 return freeze(table);
}

function selectedDeclaration(spec,implementation){
 if(!spec||Object.getPrototypeOf(spec)!==Object.prototype||!identity(spec.statusDeclarationId))throw Error('Missing status declaration identity');
 const d=implementation.statusDeclarations?.find(d=>d.id===spec.statusDeclarationId);
 if(!d)throw Error('Unknown status declaration identity');
 // Recipient is relative to the explicitly supplied EFFECTIVE owner, including reflection.
 // The private host must authenticate this owner against its route receipt/generation.
 if(!actor(spec.owner)||!actor(spec.target)||spec.target!==(d.recipient==='self'?spec.owner:1-spec.owner))throw Error('Mismatched status recipient domain');
 return d;
}

export function validateDeclaredStatusRequest(name,spec,implementation){
 const hasId=!!spec&&typeof spec==='object'&&Object.hasOwn(spec,'statusDeclarationId');
 if(hasId&&!['status.apply','schedule'].includes(name))throw Error('Misplaced status declaration identity');
 if(!implementation.statusDeclarations){if(hasId)throw Error('Undeclared status identity request');return;}
 if(name==='status.apply'){
  const d=selectedDeclaration(spec,implementation);
  if(!exact(spec,['owner','target','abilityId','key','duration','polarity','dispel','pierces','values','statusDeclarationId'])||spec.key!==d.key||spec.duration!==d.duration||spec.polarity!==d.polarity||spec.dispel!==d.dispel||spec.pierces!==d.pierces||canonical(spec.values)!==canonical(d.values))throw Error('Mismatched declared status source parameters');
 }
 else if(name==='schedule'&&(spec?.binding?.kind==='status'||hasId||implementation.statusDeclarations.some(d=>d.schedule?.handler===spec?.handler))){
  const d=selectedDeclaration(spec,implementation);
  const keys=['abilityId','owner','target','handler','delay','data','binding','delivery','statusDeclarationId'];
  if(!exact(spec,Object.hasOwn(spec,'token')?[...keys,'token']:keys)||!d.schedule||spec.binding?.kind!=='status'||spec.handler!==d.schedule.handler||spec.delivery!==d.schedule.delivery||spec.delay!==d.interval)throw Error('Mismatched declared status pulse program or cadence');
 }
}
