import {event,actor,handle,direction,num,flag,projectile,hit,program,status} from './remaining-common.js';
const IDS=['pudge_hook','sniper_assassinate','phantom_assassin_dagger','drow_ranger_gust','lina_slave','lion_spike'];
export function buildProjectile(config){const id=config.definition.id;if(!IDS.includes(id))return null;const features=['legacy-hit-v1','legacy-linear-v1'];
 const focus=config.definitions.find(h=>h.registryNumericId===6).abilities[3].mvp;
 return {features,requires:[],activate(ctx,e){event(config,e,features,['direction']);return program(config,[projectile(config,ctx,e,'onContact')]);},
 onContact(ctx,e){event(config,e,features,['source','projectileHandle','direction','travel','reflected']);actor(e.source);if(e.target!==1-e.source)throw Error('Invalid reflected target');handle(e.projectileHandle);direction(e.direction);num(e.travel,'travel');flag(e.reflected,'reflected');
  // Ownership/reflection is consumed by the private collision profile. The old
  // projectile hit does not set hit-info.reflected after swapping its source.
  return program(config,[hit(config,e.source,e.target)],{postHit:id==='phantom_assassin_dagger'?'onAttack':null});},
 ...(id==='phantom_assassin_dagger'?{onAttack(ctx,e){event(config,e,features,['source','projectileHandle','phase','landed']);actor(e.source);handle(e.projectileHandle);flag(e.landed,'landed');if(e.phase!=='projectile-hit-return'||e.target!==1-e.source)throw Error('Wrong dagger receipt stage');return program(config,e.landed&&ctx.random()<focus.daggerFocusChance?[status(e.source,'deadlyFocus',focus.slow_duration_s,{})]:[]);}}:{})};
}
