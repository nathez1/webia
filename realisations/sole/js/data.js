/* ============================================================
   SOLE — données + générateur de sneaker SVG paramétrique
   ============================================================ */

/* Sneaker profil latéral stylisé, colorisé par paire.
   c = { body, accent, sole, lace } */
function sneakerSVG(c){
  const body = c.body || '#15171c';
  const accent = c.accent || '#c8ff00';
  const sole = c.sole || '#ffffff';
  const lace = c.lace || '#ffffff';
  const dark = shade(body,-18);
  return `
<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="sneaker">
  <defs>
    <linearGradient id="bg-${uid()}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${shade(body,14)}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <ellipse cx="160" cy="200" rx="120" ry="11" fill="#0a0b0d" opacity=".10"/>
  <!-- sole -->
  <path d="M28 178 Q24 196 44 196 L286 196 Q300 196 298 182 L296 168 Q200 176 60 170 Q40 168 28 178 Z" fill="${sole}" stroke="#0a0b0d" stroke-width="3"/>
  <path d="M30 180 L296 172" stroke="${accent}" stroke-width="4"/>
  <!-- midsole shade -->
  <path d="M30 172 Q150 178 296 166 L296 170 Q150 176 30 178 Z" fill="#0a0b0d" opacity=".12"/>
  <!-- upper -->
  <path d="M40 170 Q34 120 70 104 Q104 90 132 92 L150 70 Q176 58 210 66 L232 104 Q272 112 286 140 Q294 156 286 168 Q200 176 60 170 Q48 170 40 170 Z"
        fill="url(#bg-${uid()})" stroke="#0a0b0d" stroke-width="3.5"/>
  <!-- toe cap -->
  <path d="M40 170 Q34 130 64 116 Q92 104 108 120 Q116 150 112 168 Q70 170 40 170 Z" fill="${dark}" stroke="#0a0b0d" stroke-width="2.5"/>
  <!-- accent swoosh -->
  <path d="M120 158 Q170 120 250 96 Q262 92 256 108 Q190 130 140 162 Q128 168 120 158 Z" fill="${accent}" stroke="#0a0b0d" stroke-width="2.5"/>
  <!-- collar / ankle -->
  <path d="M210 66 Q236 70 244 96 Q236 104 222 100 Q212 84 200 80 Z" fill="${accent}" stroke="#0a0b0d" stroke-width="2.5"/>
  <!-- tongue -->
  <path d="M150 70 Q160 60 176 64 L172 96 Q158 96 150 92 Z" fill="${dark}" stroke="#0a0b0d" stroke-width="2.5"/>
  <!-- laces -->
  <g stroke="${lace}" stroke-width="5" stroke-linecap="round">
    <line x1="132" y1="98" x2="158" y2="92"/>
    <line x1="138" y1="112" x2="166" y2="106"/>
    <line x1="146" y1="126" x2="174" y2="120"/>
    <line x1="154" y1="140" x2="182" y2="134"/>
  </g>
  <!-- eyelets -->
  <g fill="${sole}" stroke="#0a0b0d" stroke-width="1.5">
    <circle cx="132" cy="98" r="3"/><circle cx="138" cy="112" r="3"/>
    <circle cx="146" cy="126" r="3"/><circle cx="154" cy="140" r="3"/>
  </g>
  <!-- heel tab -->
  <path d="M232 104 Q248 108 250 120 L240 122 Q236 110 228 110 Z" fill="${sole}" stroke="#0a0b0d" stroke-width="2"/>
</svg>`;
}

let _uid = 0;
function uid(){ return (_uid++).toString(36); }

function shade(hex,p){
  const n=parseInt(hex.replace('#',''),16);
  let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=Math.min(255,Math.max(0,Math.round(r+255*p/100)));
  g=Math.min(255,Math.max(0,Math.round(g+255*p/100)));
  b=Math.min(255,Math.max(0,Math.round(b+255*p/100)));
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

const BRANDS = ['Nike','Jordan','Adidas','Yeezy','New Balance','Asics','Salomon','Puma','Vans','Converse'];
const SIZES  = ['38','39','40','41','42','43','44','45','46'];
const CONDS  = ['Neuf','Comme neuf','Très bon','Bon','Usé'];

const SEED = [
  {brand:'Jordan',     model:'Air Jordan 4 "Bred"',      color:{body:'#15171c',accent:'#d4302f',sole:'#e9e9e9',lace:'#e9e9e9'}, size:'43', cond:'Comme neuf', price:289, original:340, seller:'@kobeflex',   city:'Paris',     likes:412, hot:true, img:'img/shoes/s1.jpg'},
  {brand:'Nike',       model:'Dunk Low "Panda"',         color:{body:'#15171c',accent:'#ffffff',sole:'#ffffff',lace:'#ffffff'}, size:'42', cond:'Neuf',       price:139, original:120, seller:'@solesister',  city:'Lyon',      likes:298, hot:true, img:'img/shoes/s5.jpg'},
  {brand:'Yeezy',      model:'Boost 350 V2 "Zebra"',     color:{body:'#f3f3f3',accent:'#c8302f',sole:'#fafafa',lace:'#1c1c1c'}, size:'44', cond:'Très bon',   price:215, original:230, seller:'@yeezygod',    city:'Marseille', likes:187, img:'img/shoes/s6.jpg'},
  {brand:'New Balance',model:'990v5 "Grey"',             color:{body:'#7d8893',accent:'#3a4350',sole:'#d8dde3',lace:'#cfd4da'}, size:'41', cond:'Bon',        price:165, original:200, seller:'@dadshoes',    city:'Lille',     likes:142, img:'img/shoes/s10.jpg'},
  {brand:'Nike',       model:'Air Max 1 "Volt"',         color:{body:'#e9edf2',accent:'#c8ff00',sole:'#ffffff',lace:'#1c1c1c'}, size:'40', cond:'Comme neuf', price:159, original:150, seller:'@maxhead',     city:'Toulouse',  likes:233, hot:true, img:'img/shoes/s3.jpg'},
  {brand:'Adidas',     model:'Samba OG "Black"',         color:{body:'#15171c',accent:'#ffffff',sole:'#d8c39a',lace:'#ffffff'}, size:'42', cond:'Neuf',       price:119, original:110, seller:'@terrace',     city:'Paris',     likes:356, hot:true, img:'img/shoes/s8.jpg'},
  {brand:'Salomon',    model:'XT-6 "Phantom"',           color:{body:'#23262c',accent:'#00d6c2',sole:'#3a3f47',lace:'#00d6c2'}, size:'43', cond:'Très bon',   price:179, original:210, seller:'@trailgod',    city:'Grenoble',  likes:121, img:'img/shoes/s11.jpg'},
  {brand:'Asics',      model:'Gel-1130 "Cream"',         color:{body:'#e7e0d2',accent:'#9aa7b4',sole:'#f2eee4',lace:'#cdc6b6'}, size:'44', cond:'Bon',        price:95,  original:130, seller:'@y2kicks',     city:'Nantes',    likes:98, img:'img/shoes/s4.jpg'},
  {brand:'Jordan',     model:'Air Jordan 1 "Chicago"',   color:{body:'#d4302f',accent:'#15171c',sole:'#ffffff',lace:'#15171c'}, size:'45', cond:'Comme neuf', price:399, original:420, seller:'@hoopdreams', city:'Paris',     likes:524, hot:true, img:'img/shoes/s12.jpg'},
  {brand:'Vans',       model:'Knu Skool "Black"',        color:{body:'#15171c',accent:'#ffffff',sole:'#f0f0f0',lace:'#ffffff'}, size:'39', cond:'Neuf',       price:89,  original:95,  seller:'@skatecore',   city:'Bordeaux',  likes:76, img:'img/shoes/s7.jpg'},
  {brand:'Puma',       model:'Speedcat "Red"',           color:{body:'#c8302f',accent:'#15171c',sole:'#15171c',lace:'#15171c'}, size:'40', cond:'Très bon',   price:99,  original:120, seller:'@f1fit',       city:'Lyon',      likes:88, img:'img/shoes/s9.jpg'},
  {brand:'Converse',   model:'Chuck 70 Hi "Parchment"',  color:{body:'#ece6d8',accent:'#15171c',sole:'#f5f1e8',lace:'#15171c'}, size:'41', cond:'Bon',        price:69,  original:90,  seller:'@vintagevibe', city:'Rennes',    likes:64, img:'img/shoes/s2.jpg'},
];

/* Visuel d'une paire : photo réelle si disponible, sinon SVG paramétrique (fallback pour les annonces créées par l'utilisateur) */
function sneakerVisual(l){
  if(l && l.img){
    const alt = ((l.brand||'')+' '+(l.model||'sneaker')).trim();
    return `<img class="shoe-img" src="${l.img}" alt="${alt}" loading="lazy" decoding="async">`;
  }
  return sneakerSVG((l && l.color) ? l.color : {});
}
