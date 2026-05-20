// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
function misionesderangod2TriggerShake(amp,dur){
  misionesderangod2ShakeAmp=Math.max(misionesderangod2ShakeAmp,amp);
  misionesderangod2ShakeDur=Math.max(misionesderangod2ShakeDur,dur);
}

function misionesderangod2SpawnSparks(x,y,n,color){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, spd=1.5+Math.random()*3.5;
    misionesderangod2Particles.push(new misionesderangod2Particle(x,y,Math.cos(a)*spd,Math.sin(a)*spd,color,18+Math.random()*10,2+Math.random()*1.5,'spark'));
  }
}

function misionesderangod2SpawnSmoke(x,y,count){
  const layers=[['#FFFFFF',.8],['#BBBBBB',.5],['#777777',.35]];
  for(let i=0;i<count;i++){
    const [col,spd]=layers[i%3];
    misionesderangod2Particles.push(new misionesderangod2Particle(
      x+(Math.random()-.5)*misionesderangod2NW,
      y+(Math.random()-.5)*misionesderangod2NH,
      (Math.random()-.5)*spd*2,
      -spd-.5-Math.random(),
      col,
      32+Math.random()*20,
      4+Math.random()*4+(i%3)*1.5,
      'smoke'
    ));
  }
}

function misionesderangod2ShowWinner(name){
  misionesderangod2WinName.textContent=name;
  misionesderangod2WinName.style.color=name==='UZUMAKI'?'#FFD700':'#CC88FF';
  misionesderangod2WinScreen.style.display='flex';
}
