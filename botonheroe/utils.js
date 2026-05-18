export function botonhero1GetCostForLevel(slot, lvl) {
  return Math.round(slot.baseCost * Math.pow(slot.multiplier, lvl - 1));
}

export function botonhero1GetStatValue(gain, level, key) {
  if (key === 'CRI') return Math.min(5.0, 0.0625 * level);
  return gain * level;
}

export function botonhero1GetRar(lvl) {
  if (lvl <= 5)  return { label:'Madera',     color:'#c8904a', glow:'rgba(139,94,60,.5)',    border:'#8b5e3c44', bg:'rgba(139,94,60,.14)'   };
  if (lvl <= 15) return { label:'Aprendiz',   color:'#2ecc71', glow:'rgba(46,204,113,.45)',  border:'#2ecc7144', bg:'rgba(46,204,113,.10)'  };
  if (lvl <= 30) return { label:'Chunin',     color:'#3498db', glow:'rgba(52,152,219,.45)',  border:'#3498db44', bg:'rgba(52,152,219,.11)'  };
  if (lvl <= 45) return { label:'Jonin',      color:'#f1c40f', glow:'rgba(241,196,15,.50)',  border:'#f1c40f44', bg:'rgba(241,196,15,.11)'  };
  if (lvl <= 60) return { label:'ANBU',       color:'#e74c3c', glow:'rgba(231,76,60,.50)',   border:'#e74c3c44', bg:'rgba(231,76,60,.12)'   };
  return { label:'Legendario', color:'#e74c3c', goldColor:'#ffc83c', glow:'rgba(231,76,60,.6)', border:'#e74c3c55', bg:'rgba(231,76,60,.15)', legendary:true };
}
