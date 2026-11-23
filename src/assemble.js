const fs=require('fs');
const src=fs.readFileSync('game.src.html','utf8');const world=fs.readFileSync('world.json','utf8');
const out=src.replace('__WORLD__',()=>world);
fs.writeFileSync('../index.html',out);console.log('bytes',out.length);
