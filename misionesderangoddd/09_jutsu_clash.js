// ═══════════════════════════════════════════════════
//  JUTSU CLASH
// ═══════════════════════════════════════════════════
function misionesderangod2CheckJutsuClash(){
  for(let i=0;i<misionesderangod2Jutsus.length;i++){
    for(let j=i+1;j<misionesderangod2Jutsus.length;j++){
      const a=misionesderangod2Jutsus[i], b=misionesderangod2Jutsus[j];
      if(a.owner===b.owner||a.dead||b.dead) continue;
      if(Math.hypot(a.x-b.x,a.y-b.y)<a.size+b.size+6){
        const ex=(a.x+b.x)/2, ey=(a.y+b.y)/2;
        for(let k=0;k<22;k++){
          const ang=Math.random()*Math.PI*2, spd=3+Math.random()*5;
          misionesderangod2Particles.push(new misionesderangod2Particle(ex,ey,Math.cos(ang)*spd,Math.sin(ang)*spd-1,'#FFFFFF',22,3,'spark'));
          misionesderangod2Particles.push(new misionesderangod2Particle(ex,ey,Math.cos(ang)*spd*.5,Math.sin(ang)*spd*.5,'#FFD700',32,2.5,'spark'));
        }
        misionesderangod2CritFlash=2; misionesderangod2TriggerShake(6,18);
        a.dead=true; b.dead=true;
        for(const f of misionesderangod2Fighters){ f.vx+=(f.cx>ex?4.5:-4.5); }
      }
    }
  }
}
