// Mantiene la pantalla encendida mientras el juego está abierto.
(function(){
  'use strict';

  let wakeLock=null;
  let retryTimer=null;
  let fallbackVideo=null;

  async function requestWakeLock(){
    if(!('wakeLock' in navigator)||!document.hasFocus()||document.visibilityState!=='visible')return false;
    try{
      wakeLock=await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release',()=>{wakeLock=null;});
      return true;
    }catch(err){
      wakeLock=null;
      return false;
    }
  }

  function ensureFallbackVideo(){
    if(fallbackVideo)return;
    fallbackVideo=document.createElement('video');
    fallbackVideo.setAttribute('playsinline','');
    fallbackVideo.setAttribute('muted','');
    fallbackVideo.muted=true;
    fallbackVideo.loop=true;
    fallbackVideo.width=1;
    fallbackVideo.height=1;
    fallbackVideo.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-10px;top:-10px;';
    fallbackVideo.src='data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAGbW9vdg==';
    document.body.appendChild(fallbackVideo);
  }

  function startFallback(){
    ensureFallbackVideo();
    const play=fallbackVideo.play();
    if(play&&typeof play.catch==='function')play.catch(()=>{});
  }

  async function keepScreenOn(){
    if(document.visibilityState!=='visible')return;
    const locked=wakeLock||await requestWakeLock();
    if(!locked)startFallback();
    clearTimeout(retryTimer);
    retryTimer=setTimeout(keepScreenOn,30000);
  }

  ['DOMContentLoaded','click','touchstart','keydown','visibilitychange','focus'].forEach(ev=>{
    window.addEventListener(ev,keepScreenOn,{passive:true});
  });
  keepScreenOn();
})();
