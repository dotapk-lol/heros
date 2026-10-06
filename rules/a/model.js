const caches=new WeakMap();
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
/** Validate the owned expression AST during factory creation, before any cast cost. */
export function validateExpression(expr,definition){
 if(expr==null)return;
 if(typeof expr==='number'){if(!Number.isFinite(expr))throw Error('A_INVALID_COEFFICIENT');return;}
 if(typeof expr==='string'){if(!Number.isFinite(definition.mvp.params?.[expr]))throw Error('A_SOURCE_COEFFICIENT:'+definition.id+'.'+expr);return;}
 if(!expr||typeof expr!=='object'||Array.isArray(expr)||Object.keys(expr).some(k=>!['stat','who','mul','add','div','min','max'].includes(k)))throw Error('A_INVALID_EXPRESSION');
 if(expr.stat){if(!['hp','maxHp','mp','maxMp','x','y','missingHp','attack','baseAttack','str','agi','int'].includes(expr.stat)||expr.who!==undefined&&!['self','target'].includes(expr.who)||Object.keys(expr).some(k=>!['stat','who'].includes(k)))throw Error('A_INVALID_STAT_EXPRESSION');return;}
 const keys=Object.keys(expr);if(keys.length!==1||!['mul','add','div','min','max'].includes(keys[0]))throw Error('A_INVALID_EXPRESSION');
 const items=expr[keys[0]];if(!Array.isArray(items)||!items.length||keys[0]==='div'&&items.length!==2)throw Error('A_INVALID_EXPRESSION');items.forEach(x=>validateExpression(x,definition));
 if(keys[0]==='div'&&(items[1]===0||typeof items[1]==='string'&&definition.mvp.params[items[1]]===0))throw Error('A_ZERO_DIVISOR');
}
/** Bound consumed nonnegative expressions against this registry's native actor maxima. */
export function expressionBound(expr,definition,definitions){
 if(expr==null)return 0;if(typeof expr==='number'||typeof expr==='string'){const n=typeof expr==='number'?expr:definition.mvp.params?.[expr];if(!Number.isFinite(n)||n<0)throw Error('A_NEGATIVE_OR_INVALID_EFFECT_COEFFICIENT');return n;}
 if(expr.stat){
  if(['hp','maxHp','missingHp'].includes(expr.stat))return Math.max(...definitions.map(h=>h.combatHp??h.hp*2.8));
  if(['mp','maxMp'].includes(expr.stat))return Math.max(...definitions.map(h=>h.combatMana??1200));
  if(['attack','baseAttack'].includes(expr.stat))return Math.max(...definitions.map(h=>h.attack));
  if(['str','agi','int'].includes(expr.stat))return Math.max(...definitions.map(h=>h.arenaStats?.[expr.stat]??h.attributes18?.[expr.stat]??0));
  throw Error('A_EFFECT_STAT_BOUND_REQUIRED:'+expr.stat);
 }
 const b=x=>expressionBound(x,definition,definitions);
 if(expr.mul)return expr.mul.reduce((n,x)=>n*b(x),1);if(expr.add)return expr.add.reduce((n,x)=>n+b(x),0);
 if(expr.div){if(expr.div[1]?.stat||expr.div[1]&&typeof expr.div[1]==='object')throw Error('A_DYNAMIC_DIVISOR_BOUND_REQUIRED');const d=b(expr.div[1]);if(d<=0)throw Error('A_ZERO_DIVISOR');return b(expr.div[0])/d;}
 if(expr.min)return Math.min(...expr.min.map(b));if(expr.max)return Math.max(...expr.max.map(b));throw Error('A_INVALID_EXPRESSION');
}
export function model(config){
 let result=caches.get(config.definitions);
 if(!result){result={heroes:new Map(config.definitions.map(h=>[h.registryNumericId,h])),programs:new Map()};
  function collect(id,node,path='recipe'){
   if(Array.isArray(node)){if(node.every(x=>x&&typeof x.op==='string'))result.programs.set(id+':'+path,node);node.forEach((x,i)=>collect(id,x,path+'.'+i));}
   else if(node&&typeof node==='object')for(const [k,v] of Object.entries(node))collect(id,v,path+'.'+k);
  }
  for(const h of config.definitions)for(const a of h.abilities)collect(a.id,a.recipe);
  caches.set(config.definitions,result);
 }
 return result;
}
export function coefficient(expr,ctx,c,definition,lookup){
 if(expr==null)return 0;
 if(typeof expr==='number')return expr;
 if(typeof expr==='string'){const n=definition.mvp.params?.[expr];if(!Number.isFinite(n))throw Error('A_SOURCE_COEFFICIENT:'+definition.id+'.'+expr);return n;}
 if(expr.stat){const f=ctx.actor(expr.who==='target'?c.target:c.owner),h=lookup.heroes.get(f.heroId);
  if(expr.stat==='missingHp')return f.maxHp-f.hp;
  if(['attack','baseAttack'].includes(expr.stat))return h.attack;
  if(['str','agi','int'].includes(expr.stat))return h.arenaStats?.[expr.stat]??h.attributes18?.[expr.stat]??0;
  const n=f[expr.stat];if(!Number.isFinite(n))throw Error('A_ACTOR_FACT_REQUIRED:'+expr.stat);return n;
 }
 const r=x=>coefficient(x,ctx,c,definition,lookup);
 if(expr.mul)return expr.mul.reduce((n,x)=>n*r(x),1);
 if(expr.add)return expr.add.reduce((n,x)=>n+r(x),0);
 if(expr.div){const d=r(expr.div[1]);if(!d)throw Error('A_ZERO_DIVISOR');return r(expr.div[0])/d;}
 if(expr.min)return Math.min(...expr.min.map(r));
 if(expr.max)return Math.max(...expr.max.map(r));
 throw Error('A_UNKNOWN_EXPRESSION');
}
/** V8 mobility formula; needs a new named host projection, never a public loop. */
export function thirstMultiplier(params,enemy){return params.bonus_movement_speed/100*clamp((params.min_bonus_pct/100-enemy.hp/enemy.maxHp)/((params.min_bonus_pct-params.max_bonus_pct)/100),0,1);}
export function spiritContactDamage(params){return params.average_damage;}
export function spiritExpiryHealing(params,actual){return actual*params.heal_percent/100;}
export function dragonProfile(params){return {attackRangeBonus:params.bonus_attack_range*.55,abilityRangeBonus:params.bonus_ability_cast_range*.55,moveFlat:params.bonus_movement_speed,duration:params.duration};}
export function swapPositions(owner,target){return {ownerX:clamp(target.x,45,1155),targetX:clamp(owner.x,45,1155),interruptTarget:true};}
export function ruptureDamage(params,fromX,toX){const distance=Math.abs(toX-fromX)/.55;return distance<=params.damage_cap_amount?distance*params.movement_damage_pct/100:0;}
