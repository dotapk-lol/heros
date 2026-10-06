export type ActorId=0|1;
export type Slot=0|1|2|3;
export type Json=null|boolean|number|string|Json[]|{[key:string]:Json};
export type Handle=string;
export type Capability='damage'|'heal'|'mana'|'transfer-mana'|'self-damage'|'protect'|'status'|'control'|'target-route'|'motion-request'|'projectile-request'|'legacy-effect'|'schedule'|'action-token'|'deferred-hp'|'cue';
export interface ActorView {
 readonly id:ActorId;readonly heroId:number;readonly hp:number;readonly maxHp:number;
 readonly mp:number;readonly maxMp:number;readonly x:number;readonly y:number;
 readonly dir:-1|1;readonly alive:boolean;readonly invulnerable:boolean;
 readonly debuffImmune:boolean;readonly passivesEnabled:boolean;
 readonly guarding:boolean;readonly rooted:boolean;readonly silenced:boolean;
}
export interface CastCommitted {
 readonly owner:ActorId;readonly target:ActorId;readonly abilityId:string;
 readonly slot:Slot;readonly castId:Handle;readonly direction:-1|1;
 readonly aimX:number;readonly heldSeconds:number;readonly reflected:boolean;
}
export interface CastFacts extends Omit<CastCommitted,'castId'|'reflected'> {
 readonly actionReady:boolean;readonly manaAvailable:number;
 readonly cooldownRemaining:number;readonly chargesAvailable:number;
 /** Required only by an opted-in planCast implementation, in WU without contact margin. */
 readonly effectiveCastRange?:number;
}
export interface EffectiveRangeCastFacts extends CastFacts {readonly effectiveCastRange:number;}
export interface CastPlan {readonly accepted:boolean;readonly reason?:string;
 readonly manaCost:number;readonly cooldownSeconds:number;readonly chargeCost:number;
 readonly windupSeconds:number;readonly recoverySeconds:number;readonly action:'cast'|'toggle-off';}
export interface DamageRequest {readonly source:ActorId;readonly target:ActorId;
 readonly abilityId:string;readonly amount:number;readonly type:'physical'|'magical'|'pure';
 readonly blockable?:boolean;readonly stunSeconds?:number;readonly hitstunSeconds?:number;
 readonly basic?:boolean;readonly dot?:boolean;readonly passive?:boolean;readonly reflected?:boolean;
 readonly noReflect?:boolean;readonly noLifesteal?:boolean;readonly attackId?:number|null;}
export interface DamageReceipt {readonly accepted:boolean;readonly landed:boolean;
 readonly guarded:boolean;readonly raw:number;readonly actual:number;readonly deferred:number;
 readonly killedAtDebit:boolean;}
export interface StatusSpec {readonly owner:ActorId;readonly target:ActorId;
 readonly abilityId:string;readonly key:string;readonly duration:number;
 readonly polarity:'positive'|'negative';readonly dispel:'basic'|'strong'|'none';
 readonly pierces:boolean;readonly values:Readonly<Record<string,Json>>;
 /** Optional source cadence in seconds; finite and positive when present.
  * Existing statusDeclarations keep their exact request/schedule shape.
  * The owned validator/provider enforces cadence; this type installs no timer. */
 readonly intervalSeconds?:number;
 readonly statusDeclarationId?:string;}
/** Compatible query view: legacy providers may still return StatusSpec-only rows.
 * View metadata is not an additional status.apply request field. */
export interface StatusView extends StatusSpec {
 readonly handle?:Handle;readonly effective?:boolean;readonly remainingSeconds?:number;
 /** Optional legacy alias; strict providers/owned code must agree its effective meaning. */
 readonly enabled?:boolean;
}
/** Opt-in record view. Provider authenticates the handle/resource and supplies finite,
 * nonnegative remaining life and delivery-time effectiveness. Structural types alone
 * do not authenticate records or upgrade legacy query rows into strict records. */
export interface StatusRecordView extends StatusView {
 readonly handle:Handle;readonly effective:boolean;readonly remainingSeconds:number;
}
export interface SkillContext {
 readonly now:number;actor(id:ActorId):ActorView;random():number;
 readonly state:{read():Json;write(value:Json):void;remove():boolean};
 readonly target:{distance(a:ActorId,b:ActorId):number;route(spec:{owner:ActorId;target:ActorId;
  abilityId:string;range:number;
  /** Omission preserves delivery range checks; admission-only requires provider-authenticated prior admission. */
  readonly rangePolicy?:'admission-and-delivery'|'admission-only';
  reflectable:boolean;reflected:boolean}):{accepted:boolean;
  reason:string|null;owner:ActorId;target:ActorId;originalOwner:ActorId;reflected:boolean;noReflect:boolean;noLifesteal:boolean}};
 damage(spec:DamageRequest):DamageReceipt;
 heal(spec:{source:ActorId;target:ActorId;abilityId:string;amount:number}):{actual:number;deferred:number};
 mana(spec:{actor:ActorId;abilityId:string;delta:number}):number;
 transferMana(spec:{source:ActorId;target:ActorId;abilityId:string;requested:number}):number;
 selfDamage(spec:{actor:ActorId;abilityId:string;amount:number;nonlethal:boolean}):DamageReceipt;
 protect(spec:{actor:ActorId;abilityId:string;kind:'invulnerability'|'debuff-immunity';duration:number}):Handle|null;
 readonly status:{apply(spec:StatusSpec):Handle|null;remove(handle:Handle):boolean;
  query(target:ActorId,key:string):readonly Readonly<StatusView>[];
  cleanse(target:ActorId,tier:'basic'|'strong',abilityId:string):readonly Handle[]};
 readonly control:{apply(spec:{owner:ActorId;target:ActorId;abilityId:string;key:string;
  type:'stun'|'root'|'hex'|'fear'|'taunt';duration:number;pierces:boolean;
  dispel:'basic'|'strong'|'none'}):{handle:Handle;duration:number}|null;release(handle:Handle,reason:string):boolean};
 motion(spec:{actor:ActorId;abilityId:string;castId:Handle;kind:'blink'|'leap'|'dash'|'pull'|'ward-follow';
  destinationX:number;speed:number;duration:number}):Handle|null;
 projectile(spec:{owner:ActorId;abilityId:string;castId:Handle;direction:-1|1;speed:number;
  range:number;height:'ground'|'both';contactHandler:string;data:Json}):Handle;
 readonly legacyEffect:{spawn(spec:{owner:ActorId;abilityId:string;castId:Handle;
  kind:'ward'|'area'|'trap'|'wall'|'death-ward';x:number;radius:number;duration:number;data:Json}):Handle;
  view(handle:Handle):{alive:boolean;x:number;y:number}|null;
  end(handle:Handle,reason:'contact'|'expired'|'owner-dead'|'cancelled'):boolean};
 schedule(spec:ScheduleSpec):Handle;
 cancelJob(handle:Handle):boolean;
 readonly action:{token(actor:ActorId,reasons:readonly ('control'|'input-cancel'|'movement'|'action')[]):Json;valid(token:Json):boolean};
 readonly deferredHP:{begin(spec:{owner:ActorId;target:ActorId;abilityId:string;duration:number;
  damageFraction:number;deferHealing:boolean;healingMultiplier:number;repayDuration:number;
  nonlethal:boolean;priority:number}):Handle;
  settle(handle:Handle):{status:string;actualDamage:number;actualHeal:number}};
 cue(event:{kind:'cast'|'hit'|'heal'|'critical'|'effect-end'|'targeted-hit'|'blink'|'reflect';
  abilityId:string;actor:ActorId;target?:ActorId}):void;
}
/** Only declared capability members are exposed at runtime. */
export interface SkillImplementation {
 readonly behaviorId:string;readonly revision:string;readonly requires:readonly Capability[];
 readonly namespace?:string;
 readonly requiredCastFacts?:readonly ('effectiveCastRange')[];
 readonly statusDeclarations?:readonly StatusDeclaration[];
 readonly codeHash:string;readonly sourceFiles:readonly string[];
 readonly stateSchema:StateSchema;
 planCast?(ctx:SkillContext,facts:CastFacts):CastPlan;
 onCastCommitted?(ctx:SkillContext,event:CastCommitted):void;
 activate?(ctx:SkillContext,event:CastCommitted):Json|void;
 onContact?(ctx:SkillContext,event:Json):Json|void;
 onInterrupt?(ctx:SkillContext,event:Json):void;
 onDeath?(ctx:SkillContext,event:Json):void;
 projectAttack?(ctx:SkillContext,event:Json):Json;
 projectDamage?(ctx:SkillContext,event:Json):Json;
 projectHealing?(ctx:SkillContext,event:Json):Json;
 projectInterval?(ctx:SkillContext,event:Json):Json;
 onAttack?(ctx:SkillContext,event:Json):void;
 onDamage?(ctx:SkillContext,event:Json):void;
 onTargeted?(ctx:SkillContext,event:Json):void;
 onStage?(ctx:SkillContext,event:Json):Json|void;
 readonly scheduledBindings?:ScheduledBindingManifest;
 readonly scheduledHandlers?:Readonly<Record<string,(ctx:SkillContext,data:Json)=>Json|void>>;
}
export interface SkillDefinition {readonly id:string;readonly mvp:Readonly<Record<string,Json>>;}
export interface HeroDefinition {readonly id:string;readonly registryNumericId:number;
 readonly valveHeroId:number;readonly abilities:readonly SkillDefinition[];readonly [key:string]:unknown;}
export interface RuleFactory {readonly abiVersion:'heros-effects-2';readonly parameters?:Json;
 create(config:{readonly hero:HeroDefinition;readonly definition:SkillDefinition;
  readonly definitions:readonly HeroDefinition[];readonly resources:ResourceSchema;readonly parameters:Json}):SkillImplementation;}
export interface RuleSnapshot {readonly abiVersion:'heros-effects-2';readonly rulesHash:string;
 readonly version:1;readonly namespaces:readonly {readonly namespace:string;readonly state:Json}[];}

export interface StateSchema {
 readonly id:string;readonly version:string;readonly schema:Json;
 readonly schemaHash:string;readonly parameters:Json;
 readonly refinement:null|{readonly id:string;readonly codeHash:string;readonly sourceFiles:readonly string[]};
 validate(value:Json):boolean;
}
export declare function codeIdentity(sourceFiles:readonly string[]):{readonly codeHash:string;readonly sourceFiles:readonly string[]};
export declare function defineStateSchema(config:{id:string;version?:string;schema:Json;parameters?:Json;refinement?:null|{id:string;codeHash:string;sourceFiles:readonly string[];validate(value:Json,parameters:Json):boolean}}):StateSchema;
export declare const EMPTY_STATE_SCHEMA:StateSchema;

export interface ResourceSchema {readonly maxMp:number;readonly maxMpByHero:Readonly<Record<number,number>>;}

/** Accepted opaque handle includes host generation; never invent it from a key. */
export type JobBinding=
 |{readonly kind:'source-job'}|{readonly kind:'passive'}
 |{readonly kind:'status';readonly ref:Handle}
 |{readonly kind:'entity';readonly mode:'area'|'link';readonly ref:Handle}
 |{readonly kind:'channel';readonly ref:Handle}
 |{readonly kind:'swarm';readonly ref:Handle};
export type DeliveryPhase='actor.status-pre-advance'|'actor.status-advance'
 |'actor.passive'|'actor.swarm'|'pack.job-due'|'pack.entity';
export type BindingKind='source-job'|'status'|'entity-area'|'entity-link'|'channel'|'swarm'|'passive';
export type ScheduledBindingManifest=Readonly<Record<string,readonly Readonly<{binding:BindingKind;delivery:DeliveryPhase}>[]>>;
export type ScheduleSpec={readonly abilityId:string;readonly owner:ActorId;
 readonly handler:string;readonly delay:number;readonly token?:Json;readonly data:Json;readonly statusDeclarationId?:string}
 &({readonly target?:ActorId;readonly binding?:never;readonly delivery?:never}
 |{readonly target:ActorId|null;readonly binding:JobBinding;readonly delivery:DeliveryPhase});

/** ID and recipient are explicit declaration identity, never inferred from values/data.
 * recipient is relative to StatusSpec.owner, the effective routed actor. Native key is unchanged. */
export interface StatusDeclaration {
 readonly id:string;readonly key:string;readonly recipient:'self'|'enemy';
 readonly duration:number;readonly interval:number;readonly programId:string|null;
 readonly schedule:null|{readonly handler:string;readonly binding:'status';readonly delivery:'actor.status-pre-advance'|'actor.status-advance'};
 readonly polarity:'positive'|'negative';readonly dispel:'basic'|'strong'|'none';
 readonly pierces:boolean;readonly values:Readonly<Record<string,Json>>;
}
