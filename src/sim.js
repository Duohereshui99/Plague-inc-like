// Headless balance check: plays many games with simple strategies and prints outcomes.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'game.src.html'),'utf8');
const code=src.slice(src.indexOf('/*SIM-START*/'),src.indexOf('/*SIM-END*/'));
const WORLD=JSON.parse(fs.readFileSync(path.join(__dirname,'world.json'),'utf8'));
const api=new Function('WORLD',code+';return {newGame,startAt,step,buy,unlocked,TR,TRAITS,C,get S(){return S}};')(WORLD);
const SPREAD=['air','water','insect','live','contact','rich','sea','airx','leak','bird','harden'];
const spreadScore=t=>{const f=t.fx;let s=f.inf||0;for(const k of SPREAD)s+=2.5*(f[k]||0);s+=3*((f.heat||0)+(f.cold||0)+(f.drug||0));if(f.mut)s+=10;if(f.camo||f.latent)s+=3;if(f.shuf)s+=api.S.research?6:0;s-=0.8*(f.sev||0);return s/t.cost;};
const killScore=t=>{const f=t.fx;return ((f.leth||0)*2+(f.shuf||0)*6+(f.inf||0)*0.3)/t.cost;};
function shop(kill){
  const s=api.S;
  for(let g=0;g<12;g++){
    const cand=api.TRAITS.filter(t=>!s.traits.has(t.id)&&api.unlocked(t)&&(kill||!(t.fx.leth>0)));
    if(!cand.length)return;
    const sc=kill?killScore:spreadScore;cand.sort((a,b)=>sc(b)-sc(a));
    if(sc(cand[0])<=0||!api.buy(cand[0].id))return;
  }
}
const idx=n=>api.C.findIndex(c=>c.name===n);
function run(diff,start,mode){
  api.newGame('x',diff);api.startAt(idx(start));let killDay=null;
  while(!api.S.over&&api.S.day<1500){
    const s=api.S;let I=0;for(const r of s.c)I+=r.I+r.D;
    const allIn=s.reachedN>=api.C.length-(mode==='patient'?0:3);
    const kill=mode!=='spread'&&((I/7.6e9>0.6&&allIn)||s.cure>(mode==='patient'?60:45));
    if(kill&&killDay==null)killDay=s.day;
    shop(kill);api.step();
  }
  const s=api.S;return {res:s.result,day:s.day,cure:Math.round(s.cure),rs:s.researchDay,kill:killDay,owned:s.traits.size};
}
const fmt=r=>`${r.res}@${r.day} cure=${r.cure} rs=${r.rs} kill@${r.kill} owned=${r.owned}`;
for(const d of ['casual','normal','hard'])for(const st of ['印度','美国','冰岛'])
  console.log(d.padEnd(6),st,'| patient:',[1,2].map(()=>fmt(run(d,st,'patient'))).join(' ; '),'| eager:',fmt(run(d,st,'eager')));
console.log('spread-only normal',fmt(run('normal','中国','spread')));
