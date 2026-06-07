// Sistema centralizado de guardado automático de Wrestling Legends Idle.
(function(){
  'use strict';

  const SAVE_KEY='wli_guardarpartida_v1';
  const SAVE_VERSION=1;
  let pending=false;

  function clonePlain(value){
    return JSON.parse(JSON.stringify(value));
  }

  function mergeObject(target,source){
    if(!source||typeof source!=='object')return;
    Object.keys(source).forEach(key=>{
      const value=source[key];
      if(Array.isArray(value))target[key]=value.slice();
      else if(value&&typeof value==='object'){
        if(!target[key]||typeof target[key]!=='object'||Array.isArray(target[key]))target[key]={};
        mergeObject(target[key],value);
      }else target[key]=value;
    });
  }

  function fighterSnapshot(f){
    if(!f)return null;
    return clonePlain(f);
  }

  function fightSnapshot(F){
    return{
      on:!!F.on,
      round:Number(F.round)||1,
      timer:Number(F.timer)||30,
      p1:fighterSnapshot(F.p1),
      p2:fighterSnapshot(F.p2),
      roundWins:Array.isArray(F.roundWins)?F.roundWins.slice(0,2):[0,0],
      paused:!!F.paused,
      countdown:Number(F.countdown)||0,
      searching:!!F.searching,
      vsReady:!!F.vsReady,
      pendingEnemy:F.pendingEnemy?clonePlain(F.pendingEnemy):null,
      currentEnemyPow:F.currentEnemyPow,
      currentPlayerPow:F.currentPlayerPow,
      enemyName:F.enemyName||'RIVAL',
      resultSettled:!!F.resultSettled,
      roundIntroT:Number(F.roundIntroT)||0,
      roundIntroText:F.roundIntroText||'',
      roundEnding:!!F.roundEnding
    };
  }

  function buildSave(ST,F){
    return{
      version:SAVE_VERSION,
      savedAt:Date.now(),
      state:clonePlain(ST),
      fight:fightSnapshot(F)
    };
  }

  function writeSave(ST,F){
    try{
      localStorage.setItem(SAVE_KEY,JSON.stringify(buildSave(ST,F)));
    }catch(err){
      // Si el navegador bloquea localStorage, el juego continúa sin interrumpirse.
    }
  }

  function save(ST,F){
    if(!ST||!F)return;
    if(pending)return;
    pending=true;
    setTimeout(()=>{
      pending=false;
      writeSave(ST,F);
    },0);
  }

  function load(ST,F){
    let raw=null;
    try{raw=localStorage.getItem(SAVE_KEY);}catch(err){return false;}
    if(!raw)return false;
    try{
      const data=JSON.parse(raw);
      if(!data||data.version!==SAVE_VERSION)return false;
      mergeObject(ST,data.state);
      if(data.fight){
        const savedFight=data.fight;
        ['on','round','timer','p1','p2','roundWins','paused','countdown','searching','vsReady','pendingEnemy','currentEnemyPow','currentPlayerPow','enemyName','resultSettled','roundIntroT','roundIntroText','roundEnding'].forEach(key=>{
          if(Object.prototype.hasOwnProperty.call(savedFight,key))F[key]=clonePlain(savedFight[key]);
        });
        F.fx=[];
        F.shake=0;
        F.vsTimer=null;
        F.resTimer=null;
        if(!F.roundWins)F.roundWins=[0,0];
        if(F.p1)F.p1.name='TÚ';
        if(F.p2)F.p2.name='CPU';
      }
      return true;
    }catch(err){
      return false;
    }
  }

  window.GuardarPartida={save,load,saveNow:writeSave,storageKey:SAVE_KEY};
  window.addEventListener('beforeunload',()=>{
    if(window.ST&&window.F)writeSave(window.ST,window.F);
  });
})();
