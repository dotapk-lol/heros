import {defineStateSchema} from '../../contract/state-schema.js';
import {codeIdentity} from '../../contract/code-identity.js';
const exact=(value,keys)=>!!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).sort().join(',')===keys.slice().sort().join(',');
const number=(v,max=1e9)=>Number.isFinite(v)&&v>=0&&v<=max;
const actor=id=>id===0||id===1;
const handle=v=>typeof v==='string'&&v.length>0&&v.length<=160;

export const defaultOwner=()=>({revision:0,channel:null,windup:null,stampede:null,barriers:[],charges:[],luminosity:0,gunslinger:true,deathSeen:false,dead:false,effects:[],jobs:[],statuses:[]});
const modes=['flare','remnant','storm','pit','gate','aether','hammer_burn','calling'];
const freezeLists=value=>Object.freeze(Object.fromEntries(Object.entries(value).map(([k,v])=>[k,Object.freeze(v)])));
export const JOB_OPS=freezeLists({centaur_hoof_stomp:['stomp'],ember_spirit_sleight_of_fist:['sleight'],ember_spirit_fire_remnant:['remnant'],abyssal_underlord_dark_portal:['gate'],void_spirit_dissimilate:['phase'],dawnbreaker_fire_wreath:['star'],dawnbreaker_celestial_hammer:['hammer_out','hammer_return'],dawnbreaker_solar_guardian:['solar_pulse','solar_fly','solar_land'],muerta_dead_shot:['deadshot'],muerta_pierce_the_veil:['veil']});
const ops=Object.values(JOB_OPS).flat();
const FIELD_MODES=Object.freeze({skywrath_mage_mystic_flare:['flare'],ember_spirit_fire_remnant:['remnant'],abyssal_underlord_firestorm:['storm'],abyssal_underlord_pit_of_malice:['pit'],abyssal_underlord_dark_portal:['gate'],void_spirit_aether_remnant:['aether'],dawnbreaker_celestial_hammer:['hammer_burn'],muerta_the_calling:['calling']});
const statusKeys=new Set(['seal','concussive_slow','stampede_slow',...['x_chains','x_flame','x_fireburn','x_atrophy_gain','x_pulse','x_voidmark','x_shortslow','x_hammer_slow','x_deadslow','x_call_slow','x_call_silence','x_veil'].flatMap(k=>[k+'_0',k+'_1'])]);
export function validateState(value){
 if(value===null)return true;
 if(!exact(value,['version','owners'])||value.version!==1||!Array.isArray(value.owners)||value.owners.length!==2)return false;
 return value.owners.every(s=>exact(s,Object.keys(defaultOwner()))&&Number.isSafeInteger(s.revision)&&s.revision>=0&&s.revision<1e9&&Number.isInteger(s.luminosity)&&s.luminosity>=0&&s.luminosity<4&&['gunslinger','deathSeen','dead'].every(k=>typeof s[k]==='boolean')&&
  (s.channel===null||exact(s.channel,['kind','startX','until','flight','revision'])&&['sleight','gate','phase','star','solar'].includes(s.channel.kind)&&Number.isFinite(s.channel.startX)&&number(s.channel.until)&&typeof s.channel.flight==='boolean'&&Number.isInteger(s.channel.revision)&&s.channel.revision<=s.revision)&&
  (s.windup===null||exact(s.windup,['until'])&&number(s.windup.until))&&
  (s.stampede===null||exact(s.stampede,['until','hit'])&&number(s.stampede.until)&&Array.isArray(s.stampede.hit)&&s.stampede.hit.length<=1&&s.stampede.hit.every(actor))&&
  Array.isArray(s.barriers)&&s.barriers.length<=64&&s.barriers.every(b=>exact(b,['amount','until'])&&number(b.amount,13.5)&&number(b.until))&&
  Array.isArray(s.charges)&&s.charges.length<=4&&s.charges.every(c=>exact(c,['abilityId','count','max','restore','pending'])&&handle(c.abilityId)&&Number.isInteger(c.count)&&Number.isInteger(c.max)&&c.count>=0&&c.max>0&&c.count<=c.max&&c.max<=16&&number(c.restore)&&c.restore>0&&Array.isArray(c.pending)&&c.pending.length<=c.max&&c.pending.every((n,i)=>number(n)&&(!i||n>=c.pending[i-1])))&&
  Array.isArray(s.effects)&&s.effects.length<=16&&new Set(s.effects.map(x=>x.handle)).size===s.effects.length&&s.effects.every(f=>exact(f,['handle','abilityId','mode','x','from','face','startedAt'])&&handle(f.handle)&&handle(f.abilityId)&&FIELD_MODES[f.abilityId]?.includes(f.mode)&&Number.isFinite(f.x)&&Number.isFinite(f.from)&&[1,-1].includes(f.face)&&number(f.startedAt))&&
  Array.isArray(s.jobs)&&s.jobs.length<=128&&new Set(s.jobs.map(x=>x.handle)).size===s.jobs.length&&s.jobs.every(j=>exact(j,['handle','abilityId','op'])&&handle(j.handle)&&handle(j.abilityId)&&JOB_OPS[j.abilityId]?.includes(j.op))&&
  Array.isArray(s.statuses)&&s.statuses.length<=128&&s.statuses.every(t=>exact(t,['handle','key','target','source'])&&handle(t.handle)&&statusKeys.has(t.key)&&actor(t.target)&&actor(t.source)));
}

const object=properties=>({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
const num={type:'number',minimum:0,maximum:1e9},coord={type:'number',minimum:45,maximum:1155},str={type:'string',minLength:1,maxLength:160},id={type:'integer',minimum:0,maximum:1},bool={type:'boolean'},nullable=s=>({anyOf:[{type:'null'},s]}),array=(items,maxItems,minItems=0)=>({type:'array',items,minItems,maxItems});
const ownerSchema=object({revision:{type:'integer',minimum:0,maximum:999999999},
 channel:nullable(object({kind:{enum:['sleight','gate','phase','star','solar']},startX:coord,until:num,flight:bool,revision:{type:'integer',minimum:0,maximum:999999999}})),windup:nullable(object({until:num})),stampede:nullable(object({until:num,hit:array(id,1)})),
 barriers:array(object({amount:{type:'number',minimum:0,maximum:13.5},until:num}),64),
 charges:array(object({abilityId:str,count:{type:'integer',minimum:0,maximum:16},max:{type:'integer',minimum:1,maximum:16},restore:{type:'number',minimum:.000001,maximum:1e6},pending:array(num,16)}),4),
 luminosity:{type:'integer',minimum:0,maximum:3},gunslinger:bool,deathSeen:bool,dead:bool,
 effects:array(object({handle:str,abilityId:str,mode:{enum:['flare','remnant','storm','pit','gate','aether','hammer_burn','calling']},x:coord,from:coord,face:{enum:[-1,1]},startedAt:num}),16),
 jobs:array(object({handle:str,abilityId:str,op:{enum:ops}}),128),statuses:array(object({handle:str,key:{enum:[...statusKeys]},target:id,source:id}),128)
});
export function createCStateSchema(){return defineStateSchema({id:'heros/c/v6-state',version:'1.0.0',schema:nullable(object({version:{const:1},owners:array(ownerSchema,2,2)})),parameters:{roster:[94,99,104,106,117,121,124],poolCap:64,scionPool:13.5,effectRefCap:16,jobRefCap:128,statusRefCap:128},refinement:{id:'c-v6-correlations',...codeIdentity(['rules/c/state.js']),validate:validateState}});}
