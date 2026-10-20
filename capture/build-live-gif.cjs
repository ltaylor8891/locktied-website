'use strict';
// Render the existing code-native stroke artwork as two phone illustrations.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const output = path.join(__dirname, 'gif-frames');

function pathLength(d) {
  const tokens = d.match(/[a-z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi);
  let i=0, command='', x=0, y=0, sx=0, sy=0, total=0;
  const number=()=>Number(tokens[i++]);
  while(i<tokens.length) {
    if(/^[a-z]$/i.test(tokens[i])) command=tokens[i++];
    const relative=command===command.toLowerCase(), kind=command.toUpperCase();
    if(kind==='Z') { total+=Math.hypot(x-sx,y-sy);x=sx;y=sy;command='';continue; }
    const start={x,y};
    if(kind==='M'||kind==='L') {
      const nx=number()+(relative?x:0),ny=number()+(relative?y:0);
      if(kind==='L') total+=Math.hypot(nx-x,ny-y);
      x=nx;y=ny;if(kind==='M'){sx=x;sy=y;command=relative?'l':'L';}
    } else if(kind==='Q'||kind==='C') {
      const count=kind==='Q'?2:3, points=[start];
      for(let j=0;j<count;j++) points.push({x:number()+(relative?x:0),y:number()+(relative?y:0)});
      let previous=start;
      for(let j=1;j<=100;j++) {
        const t=j/100,u=1-t;
        const next=kind==='Q'?{x:u*u*points[0].x+2*u*t*points[1].x+t*t*points[2].x,y:u*u*points[0].y+2*u*t*points[1].y+t*t*points[2].y}:{x:u*u*u*points[0].x+3*u*u*t*points[1].x+3*u*t*t*points[2].x+t*t*t*points[3].x,y:u*u*u*points[0].y+3*u*u*t*points[1].y+3*u*t*t*points[2].y+t*t*t*points[3].y};
        total+=Math.hypot(next.x-previous.x,next.y-previous.y);previous=next;
      }
      x=points[count].x;y=points[count].y;
    } else throw new Error('Unsupported stroke command '+command);
  }
  return total;
}

(async()=>{
  await fs.mkdir(output,{recursive:true});
  const strokes=JSON.parse(await fs.readFile(path.join(__dirname,'live-game-strokes.json'),'utf8')).map(stroke=>({...stroke,length:pathLength(stroke.d)}));
  const dog=(await sharp(path.join(root,'dist/images/beach-dog.webp')).png().toBuffer()).toString('base64');
  const coffee=(await sharp(path.join(root,'dist/images/coffee-date.webp')).png().toBuffer()).toString('base64');
  function phone(x,photo,label,id) {
    return `<defs><clipPath id="screen-${id}"><rect x="${x+9}" y="64" width="312" height="697" rx="32"/></clipPath></defs>
      <text x="${x+165}" y="31" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#674963">${label}</text>
      <rect x="${x+3}" y="63" width="330" height="715" rx="42" fill="#352a38" opacity=".12"/>
      <rect x="${x}" y="55" width="330" height="715" rx="42" fill="#433843"/>
      <g clip-path="url(#screen-${id})"><image href="data:image/png;base64,${photo}" x="${x+9}" y="64" width="312" height="697" preserveAspectRatio="xMidYMid slice"/>
      <rect x="${x+9}" y="64" width="312" height="697" fill="#352a38" opacity=".18"/></g>
      <circle cx="${x+165}" cy="78" r="4" fill="#2f2832"/>
      <rect x="${x+79}" y="101" width="172" height="31" rx="16" fill="#fffaf0" opacity=".94"/>
      <circle cx="${x+95}" cy="117" r="3" fill="#4c735c"/>
      <text x="${x+173}" y="121" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#674963">Drawing together</text>
      <rect x="${x+125}" y="742" width="80" height="4" rx="2" fill="#ffffff" opacity=".8"/>`;
  }
  const baseSvg=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="850" viewBox="0 0 800 850"><rect width="800" height="850" fill="#eee5df"/>${phone(45,dog,'Your screen','you')}${phone(425,coffee,'Their screen','them')}<circle cx="221" cy="804" r="5" fill="#674963"/><text x="236" y="810" font-family="Arial,sans-serif" font-size="17" fill="#674963">Your crosses</text><circle cx="432" cy="804" r="5" fill="#cf7189"/><text x="447" y="810" font-family="Arial,sans-serif" font-size="17" fill="#674963">Their noughts</text><text x="400" y="839" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="17" fill="#756b76">One little game. Both screens.</text></svg>`;
  const base=await sharp(Buffer.from(baseSvg)).png().toBuffer();
  function overlay(time) {
    const paths=strokes.map(stroke=>{
      const progress=Math.max(0,Math.min(1,(time-stroke.start)/stroke.duration));
      if(!progress)return '';
      const dash=`stroke-dasharray="${stroke.length} ${stroke.length}" stroke-dashoffset="${stroke.length*(1-progress)}"`;
      const halo=stroke.grid?'#433843':'#fff7ed';
      return `<path d="${stroke.d}" stroke="${halo}" stroke-width="${stroke.grid?8:9}" opacity="${stroke.grid?.25:.94}" ${dash}/><path d="${stroke.d}" stroke="${stroke.colour}" stroke-width="${stroke.grid?3.5:5}" ${dash}/>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="850"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(63 223) scale(.92)">${paths}</g><g transform="translate(443 223) scale(.92)">${paths}</g></g></svg>`;
  }
  for(let frame=0;frame<=90;frame++) {
    const filename=path.join(output,String(frame).padStart(3,'0')+'.png');
    await sharp(base).composite([{input:Buffer.from(overlay(frame*100))}]).png().toFile(filename);
  }
  await sharp(path.join(output,'090.png')).webp({quality:93}).toFile(path.join(root,'dist/images/live-doodle-two-phones-still.webp'));
  console.log('Rendered 91 frames at 800 x 850.');
})();
