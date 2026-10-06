import {freeze} from './value.js';
// Declared maximum resources are a model ceiling, not a production-data constant.
// Variable resource modifiers must remain within that ceiling; unsupported facts
// are rejected before a private cast payment or checkpoint mutation.
export function buildResourceSchema(definitions){
 const maxMpByHero={};
 for(const h of definitions){const maximum=h.combatMana??h.mana??1200;if(!Number.isSafeInteger(h.registryNumericId)||!Number.isFinite(maximum)||maximum<=0||maximum>1e7||Object.hasOwn(maxMpByHero,h.registryNumericId))throw Error('Invalid declared mana resource ceiling');maxMpByHero[h.registryNumericId]=maximum;}
 return freeze({maxMpByHero,maxMp:Math.max(...Object.values(maxMpByHero))});
}
export function validManaFact(resources,fact){return !!fact&&Number.isFinite(fact.maxMp)&&fact.maxMp>0&&fact.maxMp<=(resources.maxMpByHero[fact.heroId]??-1)&&Number.isFinite(fact.mp)&&fact.mp>=0&&fact.mp<=fact.maxMp;}
