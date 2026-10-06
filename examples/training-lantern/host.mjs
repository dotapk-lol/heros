// Original finite test recorder, not a production host or private engine.
export function createTrainingRecorder(sealed,{owner=0}={}) {
 if(owner!==0&&owner!==1) throw Error('Invalid owner');
 let time=0,serial=0;const trace=[],statuses=new Map(),jobs=[];
 const actors=[0,1].map(id=>({id,heroId:id===owner?1:5,hp:80,maxHp:100,mp:sealed.resources.maxMpByHero[id===owner?1:5],maxMp:sealed.resources.maxMpByHero[id===owner?1:5],x:id*20,y:0,dir:id===0?1:-1,alive:true,invulnerable:false,debuffImmune:false,passivesEnabled:true,guarding:false,rooted:false,silenced:false}));
 const clone=value=>structuredClone(value),handle=kind=>`training:${kind}:${++serial}`;
 function record(port,request,result) {trace.push({time,port,request:clone(request),result:clone(result)});return result;}
 function amount(value) {if(!Number.isFinite(value)||value<0) throw Error('Invalid request amount');}
 const ports={
  damage(spec) {amount(spec.amount);const a=actors[spec.target],landed=a.alive&&!a.invulnerable,actual=landed?Math.min(a.hp,spec.amount):0;a.hp-=actual;a.alive=a.hp>0;return record('damage',spec,{accepted:true,landed,guarded:false,raw:spec.amount,actual,deferred:0,killedAtDebit:landed&&!a.alive});},
  heal(spec) {amount(spec.amount);const a=actors[spec.target],actual=a.alive?Math.min(a.maxHp-a.hp,spec.amount):0;a.hp+=actual;return record('heal',spec,{actual,deferred:0});},
  protect(spec) {const ref=handle('protection');return record('protect',spec,ref);},
  status:{
   apply(spec) {const ref=handle('status');statuses.set(ref,{...clone(spec),expires:time+spec.duration,handle:ref});return record('status.apply',spec,ref);},
   remove(ref) {return record('status.remove',ref,statuses.delete(ref));},
   query(target,key) {const rows=[...statuses.values()].filter(row=>row.target===target&&row.key===key&&row.expires>=time).map(({expires,...spec})=>({...spec,effective:true,remainingSeconds:Math.max(0,expires-time)}));return record('status.query',{target,key},rows);},
   cleanse(target,tier,abilityId) {const removed=[];for(const [ref,row] of statuses) if(row.target===target&&row.polarity==='negative'&&(row.dispel==='basic'||tier==='strong'&&row.dispel==='strong')) {statuses.delete(ref);removed.push(ref);}return record('status.cleanse',{target,tier,abilityId},removed);}
  },
  schedule(spec) {const ref=handle('job');jobs.push({ref,due:time+spec.delay,spec:clone(spec),order:serial});return record('schedule',spec,ref);},
  cancelJob(ref) {const index=jobs.findIndex(job=>job.ref===ref);if(index>=0) jobs.splice(index,1);return record('cancelJob',ref,index>=0);}
 };
 const host={now:()=>time,actor:id=>actors[id],random:()=>.25,ports};
 function advance(session,to) {
  if(!Number.isFinite(to)||to<time) throw Error('Clock must advance');
  for(;;) {
   jobs.sort((a,b)=>a.due-b.due||a.order-b.order);const job=jobs[0];if(!job||job.due>to) break;jobs.shift();time=job.due;
   const bound=statuses.get(job.spec.binding.ref);
   if(!bound||bound.expires<time) continue; // illustrative inclusive terminal tick
   session.scheduled(actors[job.spec.owner].heroId,1,job.spec.handler,host,job.spec.data);
  }
  time=to;
 }
 return {host,actors,trace,advance,checkpoint:()=>clone({time,serial,actors,trace,statuses:[...statuses],jobs}),restore(checkpoint) {const next=clone(checkpoint);time=next.time;serial=next.serial;actors.splice(0,actors.length,...next.actors);trace.splice(0,trace.length,...next.trace);statuses.clear();for(const [key,row]of next.statuses) statuses.set(key,row);jobs.splice(0,jobs.length,...next.jobs);}};
}
