// ═══════════════════════════════════════════════════
//  UPDATE
// ═══════════════════════════════════════════════════
function misionesderangod2Update(dt, dms){
  misionesderangod2FrameN++;
  if(misionesderangod2FrameN%50===0){
    misionesderangod2Particles.push(new misionesderangod2Particle(
      Math.random()*misionesderangod2W,-5,0,.4+Math.random()*.6,
      Math.random()<.5?'#2A4A1A':'#386020',
      180+Math.random()*100,2+Math.random()*1.5,'leaf'
    ));
  }
  if(misionesderangod2CritFlash>0) misionesderangod2CritFlash-=dt;
  if(misionesderangod2ShakeDur>0){
    misionesderangod2ShakeDur-=dt;
    const f=misionesderangod2ShakeDur/10;
    misionesderangod2ShakeX=(Math.random()-.5)*misionesderangod2ShakeAmp*f;
    misionesderangod2ShakeY=(Math.random()-.5)*misionesderangod2ShakeAmp*f;
    if(misionesderangod2ShakeDur<=0){ misionesderangod2ShakeX=0; misionesderangod2ShakeY=0; misionesderangod2ShakeAmp=0; }
  }
  if(misionesderangod2JutsuVeil>0){ misionesderangod2JutsuVeil-=dt; if(misionesderangod2JutsuVeil<=0){ misionesderangod2JutsuVeil=0; misionesderangod2Veil.style.background='rgba(0,0,0,0)'; } }
  if(misionesderangod2HitStop>0){
    misionesderangod2HitStop-=dt;
    misionesderangod2Particles.forEach(p=>p.update(dt));
    misionesderangod2Particles=misionesderangod2Particles.filter(p=>!p.isDead());
    misionesderangod2DamageNums.forEach(d=>d.update(dt));
    misionesderangod2DamageNums=misionesderangod2DamageNums.filter(d=>!d.isDead());
    return;
  }
  const [f0,f1]=misionesderangod2Fighters;
  f0.update(dt,dms,f1);
  f1.update(dt,dms,f0);
  for(const j of misionesderangod2Jutsus) j.update(dt);
  for(const j of misionesderangod2Jutsus){
    if(j.dead) continue;
    for(const f of misionesderangod2Fighters){
      if(f===j.owner||f.isDead||f.invincible) continue;
      if(Math.hypot(j.x-f.cx,j.y-f.cy)<j.size+misionesderangod2NW/2){
        const dmg=10+Math.random()*10;
        f.receiveHit(dmg,j.x,j.owner);
        for(let i=0;i<16;i++){
          const ang=Math.random()*Math.PI*2, spd=2+Math.random()*4;
          misionesderangod2Particles.push(new misionesderangod2Particle(j.x,j.y,Math.cos(ang)*spd,Math.sin(ang)*spd,j.color,20,3,'spark'));
        }
        j.dead=true;
      }
    }
  }
  misionesderangod2CheckJutsuClash();
  misionesderangod2Jutsus=misionesderangod2Jutsus.filter(j=>!j.dead);
  misionesderangod2Particles.forEach(p=>p.update(dt));
  misionesderangod2Particles=misionesderangod2Particles.filter(p=>!p.isDead());
  misionesderangod2DamageNums.forEach(d=>d.update(dt));
  misionesderangod2DamageNums=misionesderangod2DamageNums.filter(d=>!d.isDead());
}
