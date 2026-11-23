const fs=require('fs');const src=fs.readFileSync('game.src.html','utf8');
const code=src.slice(src.indexOf('/*SIM-START*/'),src.indexOf('/*SIM-END*/'));
const WORLD=JSON.parse(fs.readFileSync('world.json','utf8'));
const api=new Function('WORLD',code+';return {newGame,startAt,step,buy,TR,C,get S(){return S}};')(WORLD);
const idx=n=>api.C.findIndex(c=>c.name===n);
const spread=['liv1','cough','wat1','air1','ins1','heat1','drug1','sneeze','cold1','wat2','air2','heat2','drug2','cold2','ext','ins2','liv2','camo1','shuf1'];
const kill=['rash','fever','vomit','pneu','organ','insom','coma','hemo','total','shuf2','drug3','shuf3'];
function run(diff,start,mode){api.newGame('x',diff);api.startAt(idx(start));let rs=null,first=null;
 while(!api.S.over&&api.S.day<1500){const s=api.S;let I=0;for(const r of s.c)I+=r.I+r.D;
  const goKill=mode!=='spread'&&((I/7.6e9>0.6&&s.reachedN>=api.C.length-(mode==="patient"?0:3))||s.cure>(mode==="patient"?60:45));
  if(goKill&&first==null)first=s.day;
  const list=goKill?kill.concat(spread):spread;
  for(const id of list){if(!s.traits.has(id)){if(!api.buy(id)&&s.pts<api.TR[id].cost&&api.TR[id].req.every(q=>q.split('|').some(x=>s.traits.has(x))))break;}}
  api.step();if(s.research&&rs==null)rs=s.day;}
 const s=api.S;const left=s.c.map((r,i)=>[api.C[i].name,r.H+r.I]).filter(a=>a[1]>=1);
 return `${s.result}@${s.day} cure=${s.cure.toFixed(0)} rs=${rs} kill@${first} reached=${s.reachedN} left=${left.slice(0,4).map(a=>a[0]).join('/')}`;}
const t0=Date.now();
for(const d of ['casual','normal','hard'])for(const st of ['印度','美国','冰岛'])console.log(d,st,run(d,st,'kill'),' || patient:',run(d,st,'patient'));
console.log('spread-only normal',run('normal','中国','spread'));
console.log('ms',Date.now()-t0);
