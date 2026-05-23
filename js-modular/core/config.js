// Upgrade definitions moved to mejorarhacha.js
const AXE_UPGRADES = window.AXE_UPGRADES;


const ATTR_UPGRADES = [
  { id:'at1', name:'Fuerza I',      desc:'+10% Oro/seg',        cost:100,  costCurrency:'gold',    pct:0.10, owned:false },
  { id:'at2', name:'Fuerza II',     desc:'+25% Oro/seg',        cost:500,  costCurrency:'gold',    pct:0.25, owned:false },
  { id:'at3', name:'Resistencia I', desc:'+15% Oro/click',      cost:300,  costCurrency:'gold',    pct:0.15, owned:false },
  { id:'at4', name:'Agilidad',      desc:'+0.5 Oro/seg base',   cost:30,   costCurrency:'crystal', flat:0.5, owned:false },
  { id:'at5', name:'Maestría',      desc:'+50% todo el oro',    cost:100,  costCurrency:'crystal', pct:0.50, all:true, owned:false },
];

const MISSIONS = [
  { id:'m1', name:'Primer Golpe',    desc:'Haz tu primer click en el leñador.',   goal:1,    stat:'totalClicks',     reward:10,   rewardType:'gold' },
  { id:'m2', name:'Leñador Novato',  desc:'Acumula 100 clics totales.',           goal:100,  stat:'totalClicks',     reward:100,  rewardType:'gold' },
  { id:'m3', name:'Trabajador',      desc:'Acumula 1,000 clics totales.',         goal:1000, stat:'totalClicks',     reward:500,  rewardType:'gold' },
  { id:'m4', name:'Riqueza Inicial', desc:'Gana 1,000 Oro total.',               goal:1000, stat:'totalGoldEarned', reward:5,    rewardType:'crystal' },
  { id:'m5', name:'Millonario',      desc:'Gana 100,000 Oro total.',             goal:100000,stat:'totalGoldEarned',reward:20,   rewardType:'crystal' },
  { id:'m6', name:'Renacido',        desc:'Realiza 1 Prestigio.',                goal:1,    stat:'totalPrestige',   reward:50,   rewardType:'crystal' },
];
const missionClaimed = {};

const SHOP_ITEMS = [
  { id:'sh1', name:'Bolsa de Cristales',   desc:'Obtén 10 Cristales al instante.',    cost:500,  costCurrency:'gold',    crystals:10 },
  { id:'sh2', name:'Caja de Cristales',    desc:'Obtén 50 Cristales al instante.',    cost:2000, costCurrency:'gold',    crystals:50 },
  { id:'sh3', name:'Cofre de Cristales',   desc:'Obtén 200 Cristales al instante.',   cost:8000, costCurrency:'gold',    crystals:200 },
  { id:'sh4', name:'Poción de Oro',        desc:'+5,000 Oro instantáneo.',            cost:20,   costCurrency:'crystal', gold:5000 },
  { id:'sh5', name:'Elixir del Bosque',    desc:'+20,000 Oro instantáneo.',           cost:50,   costCurrency:'crystal', gold:20000 },
];

const SKILLS_TREE = [
  { id:'str', name:'Fuerza Bruta', desc:'+20% Oro/click por nivel', stat:'strength', maxLvl:5, costPer:1 },
  { id:'spd', name:'Velocidad',    desc:'+15% Oro/seg por nivel',   stat:'speed',    maxLvl:5, costPer:1 },
  { id:'lck', name:'Suerte',       desc:'+10% chance crítico x2',   stat:'luck',     maxLvl:3, costPer:2 },
  { id:'end', name:'Resistencia',  desc:'+25% bonificación pasiva',  stat:'endurance',maxLvl:3, costPer:2 },
];
