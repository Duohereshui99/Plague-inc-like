import fs from 'fs';
import * as d3 from 'd3-geo';
import {topology} from 'topojson-server';
import {feature,neighbors} from 'topojson-client';
import {presimplify,simplify,quantile} from 'topojson-simplify';
const src=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const feats=src.features.filter(f=>f.properties.POP_EST>0&&!['Antarctica','Siachen Glacier'].includes(f.properties.NAME_EN));
const RN={'中华人民共和国':'中国','中华民国':'台湾','朝鲜民主主义人民共和国':'朝鲜','大韩民国':'韩国','阿拉伯联合酋长国':'阿联酋','刚果民主共和国':'刚果（金）','刚果共和国':'刚果（布）','北塞浦路斯土耳其共和国':'北塞浦路斯','澳屬印度洋領地':'澳属印度洋领地','波斯尼亚和黑塞哥维那':'波黑','密克罗尼西亚联邦':'密克罗尼西亚','南乔治亚和南桑威奇群岛':'南乔治亚岛'};
let topo=topology({c:{type:'FeatureCollection',features:feats}},1e5);
topo=presimplify(topo);
topo=simplify(topo,quantile(topo,+process.argv[3]||0.12));
const geoms=topo.objects.c.geometries;
const nb=neighbors(geoms);
// arc usage count -> coastline detection
const use=new Map();
const arcsOf=g=>g.type==='Polygon'?g.arcs.flat():g.type==='MultiPolygon'?g.arcs.flat(2):[];
geoms.forEach(g=>new Set(arcsOf(g).map(a=>a<0?~a:a)).forEach(a=>use.set(a,(use.get(a)||0)+1)));
const fc=feature(topo,topo.objects.c);
const proj=d3.geoNaturalEarth1().fitWidth(1000,fc);
const path=d3.geoPath(proj).digits(1);
const [[x0,y0],[x1,y1]]=path.bounds(fc);
proj.translate([proj.translate()[0]-x0+4,proj.translate()[1]-y0+4]);
const H=Math.ceil(y1-y0+8);
const inc={'1. High income: OECD':.95,'2. High income: nonOECD':.85,'3. Upper middle income':.6,'4. Lower middle income':.4,'5. Low income':.2};
const out=fc.features.map((f,i)=>{
  const p=f.properties,g=geoms[i];
  let main=f;
  if(f.geometry.type==='MultiPolygon'){let best=-1;for(const poly of f.geometry.coordinates){const ff={type:'Feature',geometry:{type:'Polygon',coordinates:poly}};const a=d3.geoArea(ff);if(a>best){best=a;main=ff;}}}
  const [cx,cy]=path.centroid(main);
  const lat=d3.geoCentroid(main)[1];
  const coast=arcsOf(g).some(a=>use.get(a<0?~a:a)===1);
  const al=Math.abs(lat);
  return {n:RN[p.NAME_ZH]||p.NAME_ZH||p.NAME,p:Math.round(p.POP_EST),w:inc[p.INCOME_GRP]??.4,cl:al<26?'hot':al>48?'cold':'mild',
    x:+cx.toFixed(1),y:+cy.toFixed(1),a:Math.round(path.area(f)),d:path(f)||'',nb:nb[i],c:coast?1:0};
});
const grat=path(d3.geoGraticule10()),sph=path({type:'Sphere'});
fs.writeFileSync('world.json',JSON.stringify({w:1008,h:H,g:grat,o:sph,c:out}));
console.log('countries',out.length,'H',H,'bytes',fs.statSync('world.json').size,'nopath',out.filter(o=>!o.d).map(o=>o.n).join(','));
console.log('tiny(<6px²)',out.filter(o=>o.a<6).length,'landlocked',out.filter(o=>!o.c).map(o=>o.n).join(' '));
console.log('no-neighbors',out.filter(o=>!o.nb.length).length);
const byN=Object.fromEntries(out.map((o,i)=>[o.n,i]));
for(const k of ['中国','法国','俄罗斯','美国','巴西']) {const o=out[byN[k]];console.log(k,o&&o.cl,o&&o.w,o&&o.nb.map(j=>out[j].n).join(' '));}
