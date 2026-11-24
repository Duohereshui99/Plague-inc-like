// Builds ../index.html (a complete page for GitHub Pages or opening locally) from game.src.html + world.json.
// `node assemble.js --fragment out.html` also writes the bare page body used for the Claude artifact.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'game.src.html'),'utf8');
const world=fs.readFileSync(path.join(__dirname,'world.json'),'utf8');
const page=src.replace('__WORLD__',()=>world);
const cut=page.indexOf('</style>')+'</style>'.length;
const doc='<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  +page.slice(0,cut)+'\n</head>\n<body>\n'+page.slice(cut).trim()+'\n</body>\n</html>\n';
fs.writeFileSync(path.join(__dirname,'..','index.html'),doc);
const k=process.argv.indexOf('--fragment');
if(k>0&&process.argv[k+1])fs.writeFileSync(process.argv[k+1],page);
console.log('index.html',doc.length,'bytes');
