// ═══════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════
function misionesderangod2StartGame(){
  misionesderangod2Particles=[]; misionesderangod2DamageNums=[]; misionesderangod2Jutsus=[];
  misionesderangod2HitStop=0; misionesderangod2SlowMo=1; misionesderangod2FrameN=0; misionesderangod2GameOver=false;
  misionesderangod2ShakeX=0; misionesderangod2ShakeY=0; misionesderangod2ShakeDur=0; misionesderangod2ShakeAmp=0; misionesderangod2CritFlash=0;
  misionesderangod2JutsuVeil=0; misionesderangod2Veil.style.background='rgba(0,0,0,0)';
  misionesderangod2WinScreen.style.display='none';
  misionesderangod2Fighters=[new misionesderangod2Fighter(70,0), new misionesderangod2Fighter(360,1)];
  misionesderangod2Fighters[0].tX=120+Math.random()*80;
  misionesderangod2Fighters[1].tX=250+Math.random()*80;
}

// ═══════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════
let misionesderangod2LastTs=0;
function misionesderangod2Loop(ts){
  const rawDt=Math.min((ts-misionesderangod2LastTs)/16.667,3);
  misionesderangod2LastTs=ts;
  const dt=rawDt*misionesderangod2SlowMo;
  const dms=rawDt*16.667*misionesderangod2SlowMo;
  misionesderangod2Update(dt,dms);
  misionesderangod2Render();
  requestAnimationFrame(misionesderangod2Loop);
}

let misionesderangod2LoopStarted = false;

window.misionesderangodddMount = function(targetElement){
  if (!targetElement) return null;
  targetElement.innerHTML = '';
  targetElement.appendChild(misionesderangod2Container);

  misionesderangod2Canvas = document.getElementById('misionesderangod2Canvas');
  misionesderangod2Ctx = misionesderangod2Canvas.getContext('2d');
  misionesderangod2Veil = document.getElementById('misionesderangod2Veil');
  misionesderangod2WinScreen = document.getElementById('misionesderangod2WinnerScreen');
  misionesderangod2WinName = document.getElementById('misionesderangod2WinName');

  document.getElementById('misionesderangod2BtnRestart').onclick = misionesderangod2StartGame;

  misionesderangod2GenBG();
  misionesderangod2StartGame();

  if (!misionesderangod2LoopStarted) {
    misionesderangod2LoopStarted = true;
    requestAnimationFrame(ts=>{ misionesderangod2LastTs=ts; requestAnimationFrame(misionesderangod2Loop); });
  }

  return {
    destroy(){
      if (misionesderangod2Container.parentNode) {
        misionesderangod2Container.parentNode.removeChild(misionesderangod2Container);
      }
    }
  };
};

})(); // fin del IIFE