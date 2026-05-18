export const BOTONHERO1_MULTIPLIERS = [1.4, 1.6, 1.8, 2.25, 2.35, 2.45, 2.50, 2.60, 2.70, 2.80];

export const BOTONHERO1_SLOT_DEFS = [
  {
    id:'main', icon:'🗡️', name:'Mano Principal',
    stats: [
      { key:'STR',   gain:3,   unit:'',  fmt: v => Math.round(v) },
      { key:'C.DMG', gain:1.5, unit:'%', fmt: v => v.toFixed(1)+'%' },
    ]
  },
  {
    id:'head', icon:'🪖', name:'Cabeza',
    stats: [
      { key:'INT', gain:3, unit:'',  fmt: v => Math.round(v) },
      { key:'MP',  gain:8, unit:'',  fmt: v => Math.round(v) },
    ]
  },
  {
    id:'torso', icon:'🛡️', name:'Torso',
    stats: [
      { key:'HP',  gain:25, unit:'', fmt: v => Math.round(v) },
      { key:'DEF', gain:4,  unit:'', fmt: v => Math.round(v) },
    ]
  },
  {
    id:'legs', icon:'👖', name:'Piernas',
    stats: [
      { key:'AGI', gain:2,   unit:'',  fmt: v => Math.round(v) },
      { key:'LUK', gain:0.5, unit:'',  fmt: v => v.toFixed(1) },
    ]
  },
  {
    id:'feet', icon:'🥾', name:'Pies',
    stats: [
      { key:'AGI', gain:2,  unit:'', fmt: v => Math.round(v) },
      { key:'HP',  gain:20, unit:'', fmt: v => Math.round(v) },
    ]
  },
  {
    id:'neck', icon:'📿', name:'Cuello',
    stats: [
      { key:'RES', gain:0.2, unit:'%', fmt: v => v.toFixed(1)+'%' },
      { key:'MP',  gain:6,   unit:'',  fmt: v => Math.round(v) },
    ]
  },
];

export const BOTONHERO1_STATS_DEF = [
  { icon:'⚔️', key:'STR',   val:'284',  cls:''      },
  { icon:'💨', key:'AGI',   val:'197',  cls:'bh1-speed' },
  { icon:'🧠', key:'INT',   val:'156',  cls:''      },
  { icon:'✦',  key:'LUK',   val:'88',   cls:''      },
  { icon:'🛡️', key:'DEF',   val:'312',  cls:'bh1-good'  },
  { icon:'♾️',  key:'RES',   val:'241',  cls:''      },
  { icon:'◎',  key:'CRI',   val:'34%',  cls:'bh1-crit'  },
  { icon:'💥', key:'C.DMG', val:'218%', cls:'bh1-crit'  },
  { icon:'〇', key:'EVA',   val:'22%',  cls:'bh1-speed' },
  { icon:'♥️', key:'Rg HP', val:'+145', cls:'bh1-good'  },
];
