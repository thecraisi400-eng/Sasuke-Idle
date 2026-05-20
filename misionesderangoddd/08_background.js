// ─── Generación de fondo ─────────────────────────
function misionesderangod2GenBG(){
  misionesderangod2BgMountains=[];
  for(let x=0;x<=misionesderangod2W;x+=12){
    misionesderangod2BgMountains.push({
      x,
      y: 60+Math.sin(x*.012)*80+Math.sin(x*.038)*40+Math.cos(x*.022+0.8)*30+Math.sin(x*.007)*25,
      layer:0
    });
  }
  for(let x=0;x<=misionesderangod2W;x+=12){
    misionesderangod2BgMountains.push({
      x,
      y: 90+Math.sin(x*.016+1.2)*65+Math.sin(x*.044+0.5)*30+Math.cos(x*.028+2.1)*22,
      layer:1
    });
  }
  misionesderangod2BgTrees=[];
  for(let i=0;i<8;i++){
    const bx=15+i*(misionesderangod2W/8)+Math.random()*30-15;
    const bh=70+Math.random()*50;
    const bw=22+Math.random()*16;
    misionesderangod2BgTrees.push({x:bx, h:bh, w:bw, layer:0, trunkW:4+Math.random()*3});
  }
  const frontPositions=[18,55,380,420];
  for(let i=0;i<frontPositions.length;i++){
    const bh=110+Math.random()*60;
    const bw=34+Math.random()*20;
    misionesderangod2BgTrees.push({x:frontPositions[i], h:bh, w:bw, layer:1, trunkW:7+Math.random()*5});
  }
  for(let i=0;i<6;i++){
    const bx=40+Math.random()*(misionesderangod2W-80);
    const bh=80+Math.random()*45;
    const bw=26+Math.random()*18;
    misionesderangod2BgTrees.push({x:bx, h:bh, w:bw, layer:0.5, trunkW:5+Math.random()*4});
  }
  misionesderangod2BgStars=[];
  for(let i=0;i<50;i++){
    misionesderangod2BgStars.push({x:(i*97+13)%misionesderangod2W, y:(i*53+7)%(misionesderangod2H*.52), s:(Math.random()<.1)?1.5:1, ph:Math.random()*Math.PI*2});
  }
}

function misionesderangod2DrawBG(){
  const ctx=misionesderangod2Ctx;
  const W=misionesderangod2W, H=misionesderangod2H, GROUND=misionesderangod2GROUND;
  const sky=ctx.createLinearGradient(0,0,0,H*.65);
  sky.addColorStop(0,'#3A7FBF');
  sky.addColorStop(0.35,'#5AABDE');
  sky.addColorStop(0.7,'#82C8E8');
  sky.addColorStop(1,'#B8DFF0');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  ctx.save();
  ctx.globalAlpha=0.55;
  ctx.fillStyle='#FFFFFF';
  const clouds=[
    {x:40,  y:28, rx:38, ry:14},
    {x:150, y:18, rx:52, ry:16},
    {x:290, y:32, rx:44, ry:13},
    {x:400, y:22, rx:36, ry:12},
  ];
  for(const c of clouds){
    ctx.beginPath(); ctx.ellipse(c.x,c.y,c.rx,c.ry,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x-c.rx*.35,c.y+c.ry*.4,c.rx*.55,c.ry*.7,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(c.x+c.rx*.35,c.y+c.ry*.35,c.rx*.50,c.ry*.65,0,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
  ctx.save();
  const sunX=68, sunY=42;
  const sunHalo=ctx.createRadialGradient(sunX,sunY,12,sunX,sunY,38);
  sunHalo.addColorStop(0,'rgba(255,240,150,0.35)');
  sunHalo.addColorStop(1,'rgba(255,240,150,0)');
  ctx.fillStyle=sunHalo;
  ctx.beginPath(); ctx.arc(sunX,sunY,38,0,Math.PI*2); ctx.fill();
  ctx.shadowColor='#FFE060'; ctx.shadowBlur=22;
  ctx.fillStyle='#FFEE80';
  ctx.beginPath(); ctx.arc(sunX,sunY,14,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.restore();
  const mts0=misionesderangod2BgMountains.filter(p=>p.layer===0);
  ctx.fillStyle='#6B8FA8';
  ctx.beginPath(); ctx.moveTo(0,H);
  for(const p of mts0) ctx.lineTo(p.x,p.y);
  ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.55)';
  ctx.beginPath();
  let snowStarted=false;
  for(let i=0;i<mts0.length;i++){
    const p=mts0[i];
    if(p.y<90){
      if(!snowStarted){ ctx.moveTo(p.x,p.y); snowStarted=true; }
      else ctx.lineTo(p.x,p.y);
    } else if(snowStarted){
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); snowStarted=false;
    }
  }
  if(snowStarted){ ctx.closePath(); ctx.fill(); }
  const mts1=misionesderangod2BgMountains.filter(p=>p.layer===1);
  ctx.fillStyle='#4A7040';
  ctx.beginPath(); ctx.moveTo(0,H);
  for(const p of mts1) ctx.lineTo(p.x,p.y);
  ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  ctx.fillStyle='rgba(20,40,10,0.22)';
  ctx.beginPath(); ctx.moveTo(0,H);
  for(const p of mts1) ctx.lineTo(p.x+8,p.y+12);
  ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
  for(const t of misionesderangod2BgTrees.filter(t=>t.layer<=0.5).sort((a,b)=>a.layer-b.layer)){
    misionesderangod2DrawTree(t, t.layer===0 ? 0.52 : 0.72);
  }
  const groundGrad=ctx.createLinearGradient(0,GROUND-2,0,H);
  groundGrad.addColorStop(0,'#5A3A1A');
  groundGrad.addColorStop(0.08,'#4A2E10');
  groundGrad.addColorStop(0.3,'#3A2208');
  groundGrad.addColorStop(1,'#1E1004');
  ctx.fillStyle=groundGrad; ctx.fillRect(0,GROUND-2,W,H-GROUND+2);
  const grassGrad=ctx.createLinearGradient(0,GROUND-8,0,GROUND+6);
  grassGrad.addColorStop(0,'#4A7020');
  grassGrad.addColorStop(0.4,'#3A5818');
  grassGrad.addColorStop(1,'#2A3E0E');
  ctx.fillStyle=grassGrad; ctx.fillRect(0,GROUND-6,W,10);
  const dirtPatches=[
    {x:20,  y:GROUND+8,  rx:28, ry:5,  col:'rgba(80,50,20,0.4)'},
    {x:100, y:GROUND+14, rx:22, ry:4,  col:'rgba(60,35,10,0.35)'},
    {x:185, y:GROUND+10, rx:35, ry:6,  col:'rgba(90,55,22,0.3)'},
    {x:280, y:GROUND+16, rx:25, ry:5,  col:'rgba(55,30,8,0.38)'},
    {x:360, y:GROUND+9,  rx:30, ry:5,  col:'rgba(75,45,18,0.32)'},
    {x:435, y:GROUND+13, rx:20, ry:4,  col:'rgba(65,40,12,0.36)'},
  ];
  for(const p of dirtPatches){
    ctx.fillStyle=p.col;
    ctx.beginPath(); ctx.ellipse(p.x,p.y,p.rx,p.ry,0,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#2E1E0A';
  const rocks=[
    {x:50,  y:GROUND+5, rx:10, ry:3.5},
    {x:130, y:GROUND+7, rx:7,  ry:2.8},
    {x:200, y:GROUND+4, rx:13, ry:4  },
    {x:275, y:GROUND+6, rx:9,  ry:3  },
    {x:345, y:GROUND+5, rx:11, ry:3.5},
    {x:415, y:GROUND+7, rx:8,  ry:3  },
  ];
  for(const r of rocks){
    ctx.beginPath(); ctx.ellipse(r.x,r.y,r.rx,r.ry,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(80,55,25,0.5)';
    ctx.beginPath(); ctx.ellipse(r.x-2,r.y-1,r.rx*.6,r.ry*.5,-.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#2E1E0A';
  }
  ctx.strokeStyle='#3A6018';
  ctx.lineWidth=1.2;
  const grassBlades=[30,72,115,158,210,252,298,335,378,420,448];
  for(const gx of grassBlades){
    for(let k=0;k<3;k++){
      const ox=(k-1)*4+Math.sin(gx+k)*2;
      const gh=4+Math.sin(gx*k)*2;
      ctx.beginPath();
      ctx.moveTo(gx+ox, GROUND-4);
      ctx.quadraticCurveTo(gx+ox+Math.sin(gx*.1+k)*3, GROUND-4-gh, gx+ox+1, GROUND-4-gh-2);
      ctx.stroke();
    }
  }
  const mist=ctx.createLinearGradient(0,GROUND-12,0,GROUND+8);
  mist.addColorStop(0,'rgba(180,220,140,0)');
  mist.addColorStop(1,'rgba(80,120,40,0.18)');
  ctx.fillStyle=mist; ctx.fillRect(0,GROUND-12,W,20);
  for(const t of misionesderangod2BgTrees.filter(t=>t.layer===1)){
    misionesderangod2DrawTree(t, 0.88);
  }
}

function misionesderangod2DrawTree(t, alpha){
  const ctx=misionesderangod2Ctx;
  const GROUND=misionesderangod2GROUND;
  ctx.save();
  ctx.globalAlpha=alpha;
  const baseY=GROUND-2;
  const trunkH=t.h*.45;
  const trunkX=t.x-t.trunkW/2;
  ctx.globalAlpha=alpha*.25;
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.ellipse(t.x+6, baseY+3, t.w*.55, 4, 0.15, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha=alpha;
  const trunkGrad=ctx.createLinearGradient(trunkX,0,trunkX+t.trunkW,0);
  trunkGrad.addColorStop(0,'#2A1A08');
  trunkGrad.addColorStop(0.35,'#4A2E10');
  trunkGrad.addColorStop(0.65,'#3A2208');
  trunkGrad.addColorStop(1,'#1E1004');
  ctx.fillStyle=trunkGrad;
  ctx.beginPath();
  ctx.moveTo(trunkX - t.trunkW*.15, baseY);
  ctx.lineTo(trunkX + t.trunkW + t.trunkW*.15, baseY);
  ctx.lineTo(trunkX + t.trunkW, baseY-trunkH);
  ctx.lineTo(trunkX, baseY-trunkH);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.2)';
  ctx.lineWidth=0.6;
  for(let k=1;k<3;k++){
    const lx=trunkX+t.trunkW*(k/3);
    ctx.beginPath();
    ctx.moveTo(lx, baseY-trunkH*.1);
    ctx.lineTo(lx+Math.sin(k)*1.5, baseY-trunkH*.85);
    ctx.stroke();
  }
  const topY=baseY-trunkH;
  ctx.fillStyle='#1A3A0A';
  ctx.beginPath(); ctx.arc(t.x+t.w*.12, topY-t.h*.18, t.w*.48, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x-t.w*.15, topY-t.h*.12, t.w*.42, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#2A5A10';
  ctx.beginPath(); ctx.arc(t.x, topY-t.h*.30, t.w*.52, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x+t.w*.22, topY-t.h*.22, t.w*.44, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x-t.w*.22, topY-t.h*.20, t.w*.45, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#3A7018';
  ctx.beginPath(); ctx.arc(t.x, topY-t.h*.42, t.w*.46, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x+t.w*.18, topY-t.h*.36, t.w*.38, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x-t.w*.18, topY-t.h*.32, t.w*.40, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='#4A8820';
  ctx.beginPath(); ctx.arc(t.x-t.w*.05, topY-t.h*.54, t.w*.32, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(200,255,100,0.12)';
  ctx.beginPath(); ctx.arc(t.x-t.w*.12, topY-t.h*.50, t.w*.22, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}
