(function(){
  'use strict';
  const md2 = window.misionesderango2 || (window.misionesderango2 = {});
let misionesderango2CurrentScreen   = 'main';
  let misionesderango2BattleActive    = false;
  let misionesderango2PlayerStats     = { hp: 200, maxHp: 200, mp: 100, maxMp: 100, atk: 25, def: 18, lvl: 1 };
  let misionesderango2CurrentEnemy    = null;
  let misionesderango2CurrentMissions = [];
  let misionesderango2EnemyIndex      = 0;
  let misionesderango2CurrentRank     = 'D';
  let misionesderango2IsJutsuActive   = false;
  let misionesderango2IsHeroAtk       = false;
  let misionesderango2IsEnemyAtk      = false;
  let misionesderango2HeroTimer       = 0;
  let misionesderango2EnemyTimer      = 0;
  let misionesderango2LastTs          = 0;
  let misionesderango2Container       = null;   // #misionesderango2-container

  /* ============================================================
     HELPERS DOM  (buscan dentro del contenedor)
  ============================================================ */

function md2$(id) { return document.getElementById(id); }

  function md2Screen(id)     { return md2$(id); }
  function md2Show(el)       { el.classList.remove('misionesderango2-hidden'); }
  function md2Hide(el)       { el.classList.add('misionesderango2-hidden'); }

  /* ============================================================
     PANTALLAS
  ============================================================ */

  Object.assign(md2,{
    md2$,md2Screen,md2Show,md2Hide,
    getState:()=>({
      misionesderango2CurrentScreen,misionesderango2BattleActive,misionesderango2PlayerStats,misionesderango2CurrentEnemy,misionesderango2CurrentMissions,misionesderango2EnemyIndex,misionesderango2CurrentRank,misionesderango2IsJutsuActive,misionesderango2IsHeroAtk,misionesderango2IsEnemyAtk,misionesderango2HeroTimer,misionesderango2EnemyTimer,misionesderango2LastTs,misionesderango2Container
    }),
    setState:(patch)=>{
      if('misionesderango2CurrentScreen' in patch) misionesderango2CurrentScreen=patch.misionesderango2CurrentScreen;
      if('misionesderango2BattleActive' in patch) misionesderango2BattleActive=patch.misionesderango2BattleActive;
      if('misionesderango2PlayerStats' in patch) misionesderango2PlayerStats=patch.misionesderango2PlayerStats;
      if('misionesderango2CurrentEnemy' in patch) misionesderango2CurrentEnemy=patch.misionesderango2CurrentEnemy;
      if('misionesderango2CurrentMissions' in patch) misionesderango2CurrentMissions=patch.misionesderango2CurrentMissions;
      if('misionesderango2EnemyIndex' in patch) misionesderango2EnemyIndex=patch.misionesderango2EnemyIndex;
      if('misionesderango2CurrentRank' in patch) misionesderango2CurrentRank=patch.misionesderango2CurrentRank;
      if('misionesderango2IsJutsuActive' in patch) misionesderango2IsJutsuActive=patch.misionesderango2IsJutsuActive;
      if('misionesderango2IsHeroAtk' in patch) misionesderango2IsHeroAtk=patch.misionesderango2IsHeroAtk;
      if('misionesderango2IsEnemyAtk' in patch) misionesderango2IsEnemyAtk=patch.misionesderango2IsEnemyAtk;
      if('misionesderango2HeroTimer' in patch) misionesderango2HeroTimer=patch.misionesderango2HeroTimer;
      if('misionesderango2EnemyTimer' in patch) misionesderango2EnemyTimer=patch.misionesderango2EnemyTimer;
      if('misionesderango2LastTs' in patch) misionesderango2LastTs=patch.misionesderango2LastTs;
      if('misionesderango2Container' in patch) misionesderango2Container=patch.misionesderango2Container;
    }
  });

})();
