// ─── BASE ENCOUNTERS ──────────────────────────────────────────────────────────
export const ENCOUNTERS = {
  // ── Zone 1: Goblin Territory ──────────────────────────────────────────────
  goblin: {
    id:'goblin', label:'Goblin Marauder', zone:'goblins',
    spriteKey:'en-goblin-idle', animPrefix:null,
    atkKey:'en-goblin-atk', hurtKey:'en-goblin-hurt',
    useSkeleton:false, hp:35, maxHp:35, atk:7, def:1,
    corruptionOnDefeat:1, stripsOnDefeat:false,
    reward:{ gold:14, hp:4, sta:6, pressureDrop:5 },
    intents:['strike','feint','strike','guard','feint'],
    stripChance:0.08, arousalAttack:false, bindAttack:false,
    lore:'Quick opportunists. First sign you have gone too deep.', scale:1.3,
  },
  goblinBoss: {
    id:'goblinBoss', label:'Goblin Chieftain', zone:'goblinBoss',
    spriteKey:'en-bgoblin-idle', animPrefix:null,
    atkKey:'en-bgoblin-atk', hurtKey:'en-bgoblin-idle',
    useSkeleton:false, isBoss:true,
    hp:120, maxHp:120, atk:15, def:5,
    corruptionOnDefeat:4, stripsOnDefeat:true,
    reward:{ gold:45, hp:10, sta:12, pressureDrop:14 },
    intents:['heavyStrike','strike','guard','heavyStrip','feint','heavyStrike'],
    stripChance:0.35, arousalAttack:false, bindAttack:false,
    lore:'Surprisingly cunning. Commands with fear and stolen gear.', scale:1.25,
  },
  // ── Zone 2: Orc Territory ─────────────────────────────────────────────────
  orc: {
    id:'orc', label:'Corrupted Orc', zone:'orcs',
    spriteKey:'en-orc-idle', animPrefix:null,
    atkKey:'en-orc-atk', hurtKey:'en-orc-hurt',
    useSkeleton:false, hp:78, maxHp:78, atk:18, def:8,
    corruptionOnDefeat:3, stripsOnDefeat:true,
    reward:{ gold:24, hp:12, sta:10, pressureDrop:12 },
    intents:['heavyStrike','heavyStrike','strike','guard','heavyStrip'],
    stripChance:0.3, arousalAttack:false, bindAttack:false,
    lore:'Brute force given dark purpose.', scale:0.85,
  },
  // ── Zone 3: Minotaur Territory ───────────────────────────────────────────
  minotaur: {
    id:'minotaur', label:'Corrupted Minotaur', zone:'minotaurs',
    spriteKey:'en-minotaur-idle', animPrefix:'minotaur',
    useSkeleton:false, hp:95, maxHp:95, atk:20, def:7,
    corruptionOnDefeat:5, stripsOnDefeat:true,
    reward:{ gold:36, hp:10, sta:15, pressureDrop:13 },
    intents:['heavyStrike','strike','heavyStrike','guard','heavyStrip'],
    stripChance:0.36, arousalAttack:false, bindAttack:false,
    lore:'Its mind was the first thing corruption consumed.', scale:1.0,
  },
  minotaurBoss: {
    id:'minotaurBoss', label:'Minotaur Champion', zone:'minotaurBoss',
    spriteKey:'en-boss-minotaur', animPrefix:'boss-minotaur',
    useSkeleton:false, isBoss:true,
    hp:200, maxHp:200, atk:24, def:10,
    corruptionOnDefeat:8, stripsOnDefeat:true,
    reward:{ gold:80, hp:18, sta:18, pressureDrop:22, item:'holyWater' },
    intents:['heavyStrike','heavyStrike','heavyStrip','guard','voidPulse','heavyStrike'],
    stripChance:0.48, arousalAttack:false, bindAttack:false,
    lore:'The original guardian of this place, twisted beyond recognition.', scale:1.5,
  },
  // ── Zone 4a: High-Corruption Path — Fallen Knight ────────────────────────
  knight: {
    id:'knight', label:'Fallen Knight', zone:'final',
    spriteKey:'npc-knight-idle', animPrefix:null,
    atkKey:'npc-knight-atk', hurtKey:'npc-knight-hurt',
    useSkeleton:false, isBoss:true,
    hp:260, maxHp:260, atk:26, def:14,
    corruptionOnDefeat:15, stripsOnDefeat:true,
    reward:{ gold:120, hp:20, sta:20, wil:20, pressureDrop:40, corruptionDrop:10 },
    intents:['heavyStrike','heavyStrike','heavyStrip','guard','heavyStrike','heavyStrike','voidPulse'],
    stripChance:0.55, arousalAttack:false, bindAttack:true,
    lore:'Once the finest of the Order. Now serves something far older. He has seen what you have become.',
    scale:1.0,
    isKnight:true,
  },
  // ── Zone 4b: Low-Corruption Path — Sanctum Mage ──────────────────────────
  mage: {
    id:'mage', label:'Sanctum Mage', zone:'final',
    spriteKey:'npc-witch-s', animPrefix:'witch',
    useSkeleton:false, hp:90, maxHp:90, atk:14, def:4,
    corruptionOnDefeat:6, stripsOnDefeat:true,
    reward:{ gold:40, hp:8, sta:8, wil:10, pressureDrop:10 },
    intents:['arouse','strike','arouse','heavyStrip','guard','bind'],
    stripChance:0.42, arousalAttack:true, bindAttack:true,
    lore:'She chose a different form of power. She is not wrong about all of it.', scale:1.0,
  },
  golemBoss: {
    id:'golemBoss', label:'Gollux the Golem', zone:'final',
    spriteKey:'en-golem-idle', animPrefix:'golem',
    useSkeleton:false, isBoss:true,
    hp:260, maxHp:260, atk:26, def:15,
    corruptionOnDefeat:18, stripsOnDefeat:true,
    reward:{ gold:150, hp:25, sta:25, wil:25, pressureDrop:50, item:'holyWater', corruptionDrop:15 },
    intents:['heavyStrike','heavyStrike','heavyStrip','guard','voidPulse','heavyStrike','heavyStrip'],
    stripChance:0.68, arousalAttack:false, bindAttack:false,
    lore:'Stone animated by crystallised corruption. It does not tire. It only breaks things.', scale:1.6,
  },
  // ── Already-used encounters retained ─────────────────────────────────────
  vampire: {
    id:'vampire', label:'Vampire',
    spriteKey:'en-vampire-idle', animPrefix:'vampire',
    useSkeleton:false, hp:72, maxHp:72, atk:14, def:5,
    corruptionOnDefeat:8, stripsOnDefeat:true,
    reward:{ gold:28, hp:5, sta:8, wil:10, pressureDrop:8, item:'holyWater' },
    intents:['arouse','strike','arouse','heavyStrip','guard','bind'],
    stripChance:0.42, arousalAttack:true, bindAttack:true,
    lore:'Sustained by desire as much as blood. Holy Water is genuinely effective.', scale:1.1,
  },
  undeadMinion: {
    id:'undeadMinion', label:'Undead Minion',
    spriteKey:null, animPrefix:'skeleton', useSkeleton:true,
    hp:45, maxHp:45, atk:9, def:2,
    corruptionOnDefeat:2, stripsOnDefeat:false,
    reward:{ gold:12, hp:5, sta:8, pressureDrop:8 },
    intents:['strike','strike','strike','feint','guard'],
    stripChance:0, arousalAttack:false, bindAttack:false,
    lore:'Reanimated. No purpose left but to obstruct.', scale:1.1,
  },
  patronBoss: {
    id:'patronBoss', label:'The Patron',
    spriteKey:'enemy-patron', animPrefix:null,
    useSkeleton:false, isBoss:true,
    hp:210, maxHp:210, atk:22, def:10,
    corruptionOnDefeat:15, stripsOnDefeat:true,
    reward:{ gold:120, hp:20, sta:20, wil:20, pressureDrop:40, item:'holyWater', corruptionDrop:12 },
    intents:['heavyStrike','arouse','heavyStrip','bind','voidPulse','heavyStrike','guard','voidPulse'],
    stripChance:0.62, arousalAttack:true, bindAttack:true,
    lore:'The architect of the sanctuary\'s fall. It does not hate you. It simply wants.', scale:1.3,
  },
  possessedGuard: {
    id: 'possessedGuard',
    label: 'Possessed Guard',
    useSkeleton: true,
    animPrefix: 'sk',
    scale: 1.0
  }
};

// ── TOWN TROUBLE ENCOUNTERS (morality/escalation chain) ───────────────────
// Framing: aggressive drunks/thugs attempting robbery + intimidation
// Uses grab/strip mechanics because they're trying to take your gear/gold
export const TOWN_TROUBLE = {
  // Brawlers use physical combat only — no strip/arouse/bind mechanics
  drunkBrawler: {
    id:'drunkBrawler', label:'Drunk Brawler', type:'trouble',
    spriteKey:'npc-town-gray-idle', animPrefix:'guard',
    useSkeleton:false, isTrouble:true,
    hp:24, maxHp:24, atk:6, def:0,
    corruptionOnDefeat:0, stripsOnDefeat:false,
    reward:{ gold:0, pressureDrop:0 },
    intents:['strike','feint','strike','guard','heavyStrike','feint'],
    stripChance:0, arousalAttack:false, bindAttack:false,
    lore:'Emboldened by drink and the absence of consequences.',
    canRepel:true, tellsFriendChance:0.65, scale:0.9,
  },
  aggressivePatron: {
    id:'aggressivePatron', label:'Aggressive Patron', type:'trouble',
    spriteKey:'npc-town-red-idle', animPrefix:'cult',
    useSkeleton:false, isTrouble:true,
    hp:35, maxHp:35, atk:9, def:1,
    corruptionOnDefeat:0, stripsOnDefeat:false,
    reward:{ gold:0, pressureDrop:0 },
    intents:['heavyStrike','strike','feint','guard','heavyStrike','strike'],
    stripChance:0, arousalAttack:false, bindAttack:false,
    lore:'Word has spread. This one came looking for a fight specifically.',
    canRepel:true, tellsFriendChance:0.5, scale:0.9,
  },
  chainThug: {
    id:'chainThug', label:'Organised Thug', type:'trouble',
    spriteKey:'npc-knight-idle', animPrefix:null,
    atkKey:'npc-knight-atk', hurtKey:'npc-knight-hurt',
    useSkeleton:false, isTrouble:true,
    hp:50, maxHp:50, atk:12, def:3,
    corruptionOnDefeat:1, stripsOnDefeat:false,
    reward:{ gold:0, pressureDrop:0 },
    intents:['heavyStrike','feint','heavyStrike','guard','heavyStrike','strike'],
    stripChance:0, arousalAttack:false, bindAttack:false,
    lore:'The word spread further than you wanted. This one is organised and sober.',
    canRepel:false, tellsFriendChance:0.3, scale:1.0,
  },
};

// ─── ZONE PROGRESSION ORDER ───────────────────────────────────────────────
export const ZONE_ORDER = [
  {
    id: 'goblins', label: 'Goblin Caves', color: 0x88aa44,
    x1:1900, x2:3200,
    enemies: [
      { x:2100, enc:'goblin' },
      { x:2550, enc:'goblin' },
      { x:2950, enc:'goblin' },
    ],
  },
  {
    id: 'orcs', label: 'Orc Ruins', color: 0xaa6622,
    x1:3200, x2:4400,
    enemies: [
      { x:3500, enc:'orc' },
      { x:3900, enc:'orc' },
    ],
  },
  {
    id: 'goblinBoss', label: 'Boss Chamber', color: 0xcc4422,
    x1:4400, x2:5000, isBossZone:true,
    enemies: [{ x:4700, enc:'goblinBoss' }],
  },
  {
    id: 'minotaurs', label: 'Ancient Ruins', color: 0x8844aa,
    x1:5000, x2:5800,
    enemies: [
      { x:5200, enc:'minotaur' },
      { x:5600, enc:'minotaur' },
    ],
  },
  {
    id: 'minotaurBoss', label: "Minotaur's Den", color: 0xcc2244,
    x1:5800, x2:6400, isBossZone:true,
    enemies: [{ x:6100, enc:'minotaurBoss' }],
  },
  {
    id: 'final', label: 'Inner Sanctum', color: 0xaa00cc,
    x1:6400, x2:7200, isFinal:true,
    // enemies resolved at runtime based on corruption + knight aggression
  },
];

// ─── SKILLS ──────────────────────────────────────────────────────────────────
export const SKILLS = [
  {
    id:'darkVeil', label:'Dark Veil', minCorruption:25, staCost:12,
    desc:'Shroud self — next hit glances (−80%).',
    effect(state, battle){ battle.pbuff.veil=true; return 'Dark Veil raised.'; },
  },
  {
    id:'soulDrain', label:'Soul Drain', minCorruption:50, staCost:20,
    desc:'Steal 20 HP; they strike −25% next turn.',
    effect(state, battle){
      const d=20; battle.enemy.hp=Math.max(0,battle.enemy.hp-d);
      state.hp=Math.min(state.maxHp,state.hp+d); battle.enemy.weakened=2;
      return `Soul Drain stole ${d} HP.`;
    },
  },
  {
    id:'voidBurst', label:'Void Burst', minCorruption:75, staCost:30,
    desc:'Corruption explosion — massive dmg, deepens your own.',
    effect(state, battle){
      const d=52+Math.floor(state.corruption/4);
      battle.enemy.hp=Math.max(0,battle.enemy.hp-d);
      state.corruption=Math.min(100,state.corruption+9);
      return `Void Burst for ${d} damage.`;
    },
  },
];

// ─── ITEMS ───────────────────────────────────────────────────────────────────
export const ITEMS = {
  healingPotion:{
    label:'Healing Potion', desc:'+35 HP, +10 STA.', usableInBattle:true,
    effect(s){ s.hp=Math.min(s.maxHp,s.hp+35); s.sta=Math.min(s.maxSta,s.sta+10); return '+35 HP, +10 STA.'; },
  },
  flashFlask:{
    label:'Flash Flask', desc:'Stun enemy 1T, −30 Arousal.', usableInBattle:true,
    effect(s,b){ if(b) b.enemy.stunned=Math.max((b.enemy.stunned||0)+1,1); s.arousal=Math.max(0,s.arousal-30); return 'Enemy stunned. Arousal −30.'; },
  },
  holyWater:{
    label:'Holy Water', desc:'Corruption −10, WIL +12.', usableInBattle:false,
    effect(s){ s.corruption=Math.max(0,s.corruption-10); s.wil=Math.min(s.maxWil,s.wil+12); return 'Corruption −10, WIL +12.'; },
  },
};

// ─── DIALOGUE TREES ──────────────────────────────────────────────────────────
function adj(s,k,d){ if(s.npcs[k]) s.npcs[k].trust=Math.max(0,Math.min(100,(s.npcs[k].trust||50)+d)); }
function adjF(s,k,d){ if(s.factions[k]!==undefined) s.factions[k]=Math.max(0,Math.min(100,s.factions[k]+d)); }
function repairC(s){ ['outer','upper','lower','inner','shoes'].forEach(sl=>{s.clothing[sl].stripped=false;s.clothing[sl].dur=s.clothing[sl].max;}); }

export const DIALOGUES = {
  elder:[
    { id:'start', speaker:'Elder Thane', portrait:'npc-elder',
      text(s){ if(!s.npcs.elder.met) return 'Another soul drawn into the darkness. I am Elder Thane. The corruption here will try to claim you. Let me help you resist it.'; if(s.corruption>=50) return 'The shadow has taken deep root, Verity. Come closer — we still have time, but you must choose soon.'; if(s.harassment?.knightAggression>=50) return '*His expression is complicated.* The Order is restless. Word of deaths in the sanctuary has reached the captain. Be careful.'; return 'Still standing. Good. The deeper zones grow more restless each hour.'; },
      choices(s){ return [
        { text:'What is this corruption?', next:'elder_corrupt', requires:()=>!s.npcs.elder.met },
        { text:'I need guidance for what\'s below.', next:'elder_guidance' },
        { text:'Tell me about the Patron.', next:'elder_patron', requires:()=>s.questStage>=1||s.npcs.elder.stage>=1 },
        { text:'[Trust 65+] What are you not telling me?', next:'elder_secret', requires:()=>s.npcs.elder.trust>=65 },
        { text:'Stay safe, Elder.', next:null, effect:st=>{adj(st,'elder',2);st.npcs.elder.met=true;} },
      ].filter(o=>!o.requires||o.requires()); },
    },
    { id:'elder_corrupt', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Corruption is the Patron\'s essence spreading outward. It erodes willpower and heightens vulnerability. Keep your clothing intact — every layer lost opens you further to its influence.',
      choices:[{text:'How do I cleanse it?', next:'elder_cleanse', effect:s=>{s.npcs.elder.stage=Math.max(s.npcs.elder.stage,1);}},{text:'Understood.',next:null,effect:s=>{adj(s,'elder',5);s.npcs.elder.met=true;}}],
    },
    { id:'elder_cleanse', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Holy Water is the surest remedy. Resting here slows its spread. Take this to start.',
      choices:[{text:'Thank you.',next:null,effect:s=>{s.items.healingPotion=(s.items.healingPotion||0)+1;adj(s,'elder',5);s.npcs.elder.met=true;}}],
    },
    { id:'elder_guidance', speaker:'Elder Thane', portrait:'npc-elder',
      text:'The zones below follow a clear progression — goblins, then orcs, then the minotaurs. Do not attempt the deeper areas before you are ready. And the state of the sanctuary matters too. The Order watches who survives and who does not.',
      choices:[{text:'Understood.',next:null,effect:s=>{adj(s,'elder',3);}}],
    },
    { id:'elder_patron', speaker:'Elder Thane', portrait:'npc-elder',
      text:'The Patron is sealed in the deepest sanctum. Strong willpower and low corruption are your best weapons. Holy Water disrupts its form. I made a mistake that widened its influence — I am trying to give you the tools to correct it.',
      choices:[{text:'I will face it.',next:null,effect:s=>{s.flags.elderReveal=true;adj(s,'elder',5);}},{text:'[Trust 65+] Tell me the whole truth.',next:'elder_secret',requires:s=>s.npcs.elder.trust>=65}],
    },
    { id:'elder_secret', speaker:'Elder Thane', portrait:'npc-elder',
      text:'*Long silence.* I left a conduit in the original seal — to monitor its state, I told myself. That conduit is what it has been widening. The current situation is my fault. I am trying to give you the tools to correct my mistake.',
      choices:[{text:'I don\'t blame you.',next:null,effect:s=>{adj(s,'elder',12);s.flags.elderReveal=true;}},{text:'Your mistake could cost everything.',next:null,effect:s=>{adj(s,'elder',-5);s.flags.elderReveal=true;}}],
    },
  ],
  merchant:[
    { id:'start', speaker:'Merchant Ida', portrait:'npc-merchant',
      text(s){ if(!s.npcs.merchant.met) return 'Oh! You\'re alive. I\'m Ida — trader, survivor, very motivated to leave once I\'ve cleared my stock.'; if(s.npcs.merchant.suspicious) return '*She glances at your state and says nothing for a moment.* Back again. Still standing?'; return 'Welcome back.'; },
      choices(s){ return [
        { text:'What are you selling?', next:'shop' },
        { text:'How did you end up here?', next:'story', requires:()=>!s.npcs.merchant.met },
        { text:'Take care, Ida.', next:null, effect:st=>{st.npcs.merchant.met=true;} },
      ].filter(o=>!o.requires||o.requires()); },
    },
    { id:'story', speaker:'Merchant Ida', portrait:'npc-merchant',
      text:'Caravan got turned around in the fog. By the time I understood where we were, it was just me left. Elder Thane confirmed the wards hold, so here I am.',
      choices:[{text:'I\'m sorry.',next:null,effect:s=>{s.npcs.merchant.met=true;adj(s,'merchant',8);}},{text:'I\'ll keep this area safe.',next:null,effect:s=>{s.npcs.merchant.met=true;adj(s,'merchant',5);}}],
    },
    { id:'shop', speaker:'Merchant Ida', portrait:'npc-merchant',
      text:'Healing Potions: 15g. Flash Flasks: 20g. Holy Water: 30g.',
      choices(s){ return [
        { text:`Buy Healing Potion (15g) [${s.gold}g]`, requires:()=>s.gold>=15, next:null, effect:st=>{st.gold-=15;st.items.healingPotion=(st.items.healingPotion||0)+1;} },
        { text:'Buy Flash Flask (20g)', requires:()=>s.gold>=20, next:null, effect:st=>{st.gold-=20;st.items.flashFlask=(st.items.flashFlask||0)+1;} },
        { text:'Buy Holy Water (30g)', requires:()=>s.gold>=30&&!s.flags.boughtHW, next:null, effect:st=>{st.gold-=30;st.items.holyWater=(st.items.holyWater||0)+1;st.flags.boughtHW=true;} },
        { text:'Nothing right now.', next:null },
      ].filter(o=>!o.requires||o.requires()); },
    },
  ],
  guard:[
    { id:'start', speaker:'Captain Serrin', portrait:'npc-guard',
      text(s){
        if(s.npcs.guard.hostile) return '*Hand on sword hilt.* We have nothing to discuss.';
        const agg = s.harassment?.knightAggression||0;
        if(agg>=60) return `*His expression is cold.* There have been civilian deaths in this sanctuary. You understand that I cannot ignore that. We are watching.`;
        if(agg>=30) return `*He watches you carefully.* The Order has received reports of... incidents. People roughed up badly. I am not accusing. But I am watching.`;
        if(!s.npcs.guard.met) return 'Halt. Captain Serrin — what remains of the Order\'s garrison. State your purpose.';
        if(s.npcs.guard.bribed) return '*A curt nod.* The passage is open.';
        return 'Back again. What do you need?';
      },
      choices(s){ return [
        { text:'I need passage to the deeper zones.', next:'passage', requires:()=>!s.npcs.guard.hostile },
        { text:'What happened to the Order here?', next:'order', requires:()=>!s.npcs.guard.met },
        { text:`[30g] I can compensate for your supply shortage.`, next:'bribe', requires:()=>s.gold>=30&&!s.npcs.guard.bribed&&!s.npcs.guard.hostile },
        { text:'[Trust 68+] Is there another route inside?', next:'secret', requires:()=>s.npcs.guard.trust>=68 },
        { text:'Never mind.', next:null, effect:st=>{st.npcs.guard.met=true;} },
      ].filter(o=>!o.requires||o.requires()); },
    },
    { id:'passage', speaker:'Captain Serrin', portrait:'npc-guard', text:'The zones below are dangerous. The Elder vouches for you. Go. Come back changed and I will act accordingly.',
      choices:[{text:'Understood.',next:null,effect:s=>{s.npcs.guard.met=true;adj(s,'guard',5);adjF(s,'order',4);}}],
    },
    { id:'order', speaker:'Captain Serrin', portrait:'npc-guard', text:'Thirty of us. Four left. I keep the ward charged and keep hoping.',
      choices:[{text:'I\'m going to end it.',next:null,effect:s=>{s.npcs.guard.met=true;adj(s,'guard',10);adjF(s,'order',6);}},{text:'I\'ll do what I can.',next:null,effect:s=>{s.npcs.guard.met=true;}}],
    },
    { id:'bribe', speaker:'Captain Serrin', portrait:'npc-guard', text:'*He stares at the coin a long time.* The gate is open. I saw nothing.',
      choices:[{text:'Your secret is safe.',next:null,effect:s=>{s.gold-=30;s.npcs.guard.bribed=true;adj(s,'guard',-6);adjF(s,'order',-8);s.flags.sanctumOpen=true;}}],
    },
    { id:'secret', speaker:'Captain Serrin', portrait:'npc-guard', text:'Passage behind the old altar in the ruins. Bypasses the main guarded corridor. I am trusting you.',
      choices:[{text:'I won\'t let you down.',next:null,effect:s=>{s.flags.secretRoute=true;adj(s,'guard',6);}}],
    },
  ],
  witch:[
    { id:'start', speaker:'Witch Moira', portrait:'npc-witch',
      text(s){ if(s.npcs.witch.pact) return 'The Patron senses you. Are you ready?'; if(s.corruption>=50) return 'The shadow clings to you. Come closer — I have a proposition.'; if(!s.npcs.witch.met) return 'A visitor. I am Moira — witch, not cultist, and possessor of information you need.'; return 'Back again. Good instinct.'; },
      choices(s){ return [
        { text:'What do you know about the Patron?', next:'patron' },
        { text:'[Corruption 50+] Tell me about the pact.', next:'pact', requires:()=>s.corruption>=50&&!s.npcs.witch.pact },
        { text:'Can you repair my clothing?', next:'repair', requires:()=>Object.values(s.clothing).some(c=>c.stripped||c.dur<100) },
        { text:'I\'m leaving.', next:null, effect:st=>{st.npcs.witch.met=true;} },
      ].filter(o=>!o.requires||o.requires()); },
    },
    { id:'patron', speaker:'Witch Moira', portrait:'npc-witch', text:'Old. Older than this building. It wants a vessel — someone already touched enough to carry its will. Holy Water disrupts its anchor. Strong, pure willpower can shatter it from within.',
      choices:[{text:'How do I stop it?', next:'stop'},{text:'What is a vessel?', next:'vessel'}],
    },
    { id:'stop', speaker:'Witch Moira', portrait:'npc-witch', text:'Holy Water, willpower, and focus. Or — lean into the corruption rather than fighting it. That option requires a pact with me as witness and costs willpower permanently.',
      choices:[{text:'I\'ll prepare properly.',next:null,effect:s=>{s.npcs.witch.met=true;adj(s,'witch',5);}},{text:'Tell me about the other way.',next:'pact_hint',effect:s=>{adj(s,'witch',4);}}],
    },
    { id:'pact_hint', speaker:'Witch Moira', portrait:'npc-witch', text:'Use the corruption as a weapon. Pact with me as anchor. Costs twenty maximum willpower. Permanently. In exchange — corruption skills deepen, and I\'ll teach you to redirect what would otherwise break you.',
      choices:[{text:'I\'ll consider it.',next:null,effect:s=>{adj(s,'witch',4);}},{text:'That sounds like a trap.',next:null,effect:s=>{adj(s,'witch',-3);}}],
    },
    { id:'vessel', speaker:'Witch Moira', portrait:'npc-witch', text:'The person ceases to exist as a coherent self. Present in body. Entirely Other in mind. The quietest kind of death.',
      choices:[{text:'I will not allow that.',next:null,effect:s=>{s.npcs.witch.met=true;}},{text:'Unless the power justifies it.',next:null,effect:s=>{s.corruption=Math.min(100,s.corruption+5);adjF(s,'cult',6);}}],
    },
    { id:'pact', speaker:'Witch Moira', portrait:'npc-witch', text:'The corruption in you can be shaped. My pact: −20 max willpower permanently. In return, dark skills unlock at lower thresholds and arousal becomes redirectable into power.',
      choices:[{text:'I accept.',next:'pact_seal'},{text:'Too costly.',next:null,effect:s=>{adj(s,'witch',-2);}}],
    },
    { id:'pact_seal', speaker:'Witch Moira', portrait:'npc-witch', text:'*She traces a sigil on your palm.* Done. After the Patron is dealt with: the sealing stone from the sanctum\'s heart. For me. Good luck, apostate.',
      choices:[{text:'Deal.',next:null,effect:s=>{s.npcs.witch.pact=true;s.flags.witchPact=true;s.maxWil=Math.max(30,s.maxWil-20);s.wil=Math.min(s.maxWil,s.wil);adj(s,'witch',20);adjF(s,'cult',10);}}],
    },
    { id:'repair', speaker:'Witch Moira', portrait:'npc-witch', text:'Twenty gold. Full restore, lightly reinforced.',
      choices(s){ return [
        { text:`Pay 20g [${s.gold}g]`, requires:()=>s.gold>=20, next:null, effect:st=>{st.gold-=20;repairC(st);} },
        { text:'Can\'t afford it.', next:null },
      ].filter(o=>!o.requires||o.requires()); },
    },
  ],
};


  mage:[
    { id:'start', speaker:'Sanctum Mage', portrait:'npc-mage',
      text(s){
        if (s.corruption >= 65) return 'The sanctum smells your corruption already. If you keep going, the knight will come for you himself.';
        if (s.corruption < 35) return 'Your will is still clean. That means the golem boss can be routed before the knight notices you.';
        return 'Balanced — dangerous. One branch leads to the knight, the other to the golem boss. Choose carefully.';
      },
      choices(s){ return [
        { text:'Tell me the low-corruption route.', next:'low_route' },
        { text:'Tell me about the knight.', next:'knight_route' },
        { text:'What do you want?', next:'mage_want' },
        { text:'Leave.', next:null, effect:st=>{st.npcs.mage.met=true;adj(st,'mage',2);} },
      ]; },
    },
    { id:'low_route', speaker:'Sanctum Mage', portrait:'npc-mage',
      text:'Low corruption draws the golem boss first. Defeat me and the route opens deeper. After that, the golem waits where the sanctum bends inward.',
      choices:[
        { text:'Understood.', next:null, effect:s=>{s.npcs.mage.met=true;adj(s,'mage',6);s.flags.mageRouteHint=true;} },
      ],
    },
    { id:'knight_route', speaker:'Sanctum Mage', portrait:'npc-mage',
      text:'High corruption changes the air. The knight steps in as the final authority — stronger than the golem boss. He keeps order when the town stops obeying.',
      choices:[
        { text:'And if I resist?', next:'resist' },
        { text:'I’ll keep my corruption low.', next:null, effect:s=>{adj(s,'mage',4);s.npcs.mage.met=true;} },
      ],
    },
    { id:'resist', speaker:'Sanctum Mage', portrait:'npc-mage',
      text:'Then the town becomes dangerous in a different way. People flirt first. They escalate. You must react quickly or they will grab, pin, and force the issue.',
      choices:[
        { text:'So I need to watch the movement patterns.', next:null, effect:s=>{adj(s,'mage',5);s.npcs.mage.met=true;} },
      ],
    },
    { id:'mage_want', speaker:'Sanctum Mage', portrait:'npc-mage',
      text:'I want the sanctum’s order restored. The knight keeps the town stable. The golem keeps the depth sealed. If either falls too early, the corruption gets worse.',
      choices:[
        { text:'I’ll work the correct path.', next:null, effect:s=>{adj(s,'mage',5);s.npcs.mage.met=true;} },
      ],
    },
  ],
  townGray:[
    { id:'start', speaker:'Townsperson', portrait:'npc-town-gray',
      text(s){
        if (s.harassment?.knightAggression >= 60) return 'The knight’s watch is tighter lately. People are nervous. You should be careful what you say.';
        return 'Oh. A stranger. You are definitely more interesting than the rest of this hall.';
      },
      choices(s){ return [
        { text:'Smile back.', next:'flirt1', reaction:{ seq:['LEFT','RIGHT','UP'], prompt:'Step with the rhythm and keep distance.', timeout:2600, next:'soften', failEffect:st=>{st.pressure=Math.min(100,(st.pressure||0)+4);st.harassment.knightAggression=Math.min(100,(st.harassment.knightAggression||0)+4);}, failNext:'misstep' } },
        { text:'Back off.', next:'backoff', reaction:{ seq:['DOWN','DOWN','LEFT'], prompt:'Break the advance cleanly.', timeout:2500, next:'retreat', failEffect:st=>{st.corruption=Math.min(100,(st.corruption||0)+2);st.harassment.knightAggression=Math.min(100,(st.harassment.knightAggression||0)+6);}, failNext:'grab' } },
        { text:'Ask about the knight.', next:'knight' },
      ]; },
    },
    { id:'soften', speaker:'Townsperson', portrait:'npc-town-gray',
      text:'Cute. You’re quick. I like that. Maybe we talk somewhere a little quieter?',
      choices:[
        { text:'Not today.', next:null, effect:s=>{s.harassment.knightAggression=Math.max(0,(s.harassment.knightAggression||0)-1);adj(s,'townGray',3);} },
      ],
    },
    { id:'retreat', speaker:'Townsperson', portrait:'npc-town-gray',
      text:'Ah — so you are the cautious type. Fine. I’ll just remember the look on your face when you moved just so.',
      choices:[
        { text:'Leave.', next:null, effect:s=>{adj(s,'townGray',2);} },
      ],
    },
    { id:'misstep', speaker:'Townsperson', portrait:'npc-town-gray',
      text:'You hesitate. That hesitation is the problem.',
      choices:[
        { text:'Step away.', next:null, effect:s=>{s.pressure=Math.min(100,(s.pressure||0)+2);adj(s,'townGray',-2);} },
      ],
    },
    { id:'grab', speaker:'Townsperson', portrait:'npc-town-gray',
      text:'Too slow. They get hands on you and the whole exchange turns ugly.',
      choices:[
        { text:'Struggle free.', next:null, effect:s=>{s.harassment.knightAggression=Math.min(100,(s.harassment.knightAggression||0)+8);s.corruption=Math.min(100,(s.corruption||0)+3);} },
      ],
    },
    { id:'knight', speaker:'Townsperson', portrait:'npc-town-gray',
      text:'The knight keeps order. If people keep dying, he gets harsher. He’s not kind, but he is predictable.',
      choices:[
        { text:'That matters.', next:null, effect:s=>{adj(s,'townGray',4);} },
      ],
    },
  ],
  townRed:[
    { id:'start', speaker:'Townsperson', portrait:'npc-town-red',
      text(s){
        if (s.corruption >= 60) return 'You look like someone who’s already halfway to giving in. The knight would call that a problem.';
        return 'You’re walking like you want attention. That’s either brave or foolish.';
      },
      choices(s){ return [
        { text:'Play along.', next:'tease', reaction:{ seq:['RIGHT','LEFT','RIGHT'], prompt:'Keep the pace and don’t let them close in.', timeout:2600, next:'edge', failEffect:st=>{st.corruption=Math.min(100,(st.corruption||0)+2);st.harassment.knightAggression=Math.min(100,(st.harassment.knightAggression||0)+5);}, failNext:'pin' } },
        { text:'Tell them to back off.', next:'warn', reaction:{ seq:['UP','DOWN','UP'], prompt:'Hold your space and reset the line.', timeout:2400, next:'reset', failEffect:st=>{st.pressure=Math.min(100,(st.pressure||0)+6);st.harassment.knightAggression=Math.min(100,(st.harassment.knightAggression||0)+4);}, failNext:'knockdown' } },
        { text:'Mention the knight.', next:'knight' },
      ]; },
    },
    { id:'edge', speaker:'Townsperson', portrait:'npc-town-red',
      text:'There you are. That’s the look I wanted. See? Much better when you don’t resist.',
      choices:[
        { text:'Enough.', next:null, effect:s=>{adj(s,'townRed',3);} },
      ],
    },
    { id:'reset', speaker:'Townsperson', portrait:'npc-town-red',
      text:'A little sharp, are we? Fine. I’ll remember that too.',
      choices:[
        { text:'Good.', next:null, effect:s=>{adj(s,'townRed',2);} },
      ],
    },
    { id:'pin', speaker:'Townsperson', portrait:'npc-town-red',
      text:'Too slow. They crowd you and force the issue.',
      choices:[
        { text:'Break free.', next:null, effect:s=>{s.corruption=Math.min(100,(s.corruption||0)+4);s.harassment.knightAggression=Math.min(100,(s.harassment.knightAggression||0)+6);} },
      ],
    },
    { id:'knockdown', speaker:'Townsperson', portrait:'npc-town-red',
      text:'They catch your balance and laugh when you stumble.',
      choices:[
        { text:'Get up.', next:null, effect:s=>{s.pressure=Math.min(100,(s.pressure||0)+3);adj(s,'townRed',-1);} },
      ],
    },
    { id:'knight', speaker:'Townsperson', portrait:'npc-town-red',
      text:'If the knight sees enough mess, he starts clearing everyone away. That’s why people keep their hands to themselves — usually.',
      choices:[
        { text:'And if they don’t?', next:null, effect:s=>{adj(s,'townRed',4);s.harassment.knightAggression=Math.min(100,(s.harassment.knightAggression||0)+2);} },
      ],
    },
  ],
  knight:[
    { id:'start', speaker:'Fallen Knight', portrait:'npc-knight',
      text(s){
        const agg = s.harassment?.knightAggression||0;
        if (agg >= 60) return 'Enough. The town has bled too often. I will not tolerate any more deaths here.';
        if (s.corruption >= 65) return 'Your corruption has climbed high enough to draw my blade personally.';
        if (s.corruption < 35) return 'You still have a chance to walk away. The golem waits for the low-corruption path. Stay disciplined.';
        return 'The sanctum wavers. I keep the line between order and ruin.';
      },
      choices(s){ return [
        { text:'What happens if I kill the town people?', next:'aggro' },
        { text:'What do you want from me?', next:'purpose' },
        { text:'Leave.', next:null, effect:st=>{st.npcs.knight.met=true;} },
      ]; },
    },
    { id:'aggro', speaker:'Fallen Knight', portrait:'npc-knight',
      text:'Kill enough civilians and my aggression rises. I become harder, less patient, more direct. Order is my oath.',
      choices:[
        { text:'Understood.', next:null, effect:s=>{s.harassment.knightAggression=Math.min(100,(s.harassment.knightAggression||0)+3);adj(s,'knight',5);} },
      ],
    },
    { id:'purpose', speaker:'Fallen Knight', portrait:'npc-knight',
      text:'Keep the sanctuary stable. If corruption stays low, you earn the mage and the golem. If it rises, I become the final obstacle.',
      choices:[
        { text:'Then I’ll choose carefully.', next:null, effect:s=>{adj(s,'knight',4);} },
      ],
    },
  ],

export const CORRIDOR_EVENTS = [
  { chance:0.09, requires:s=>s.corruption>0, text:'A voice hisses: "Let go…"', effect:s=>{s.corruption=Math.min(100,s.corruption+2);} },
  { chance:0.07, requires:()=>true, text:'A faint warmth pulses from the stone.', effect:s=>{s.wil=Math.min(s.maxWil,s.wil+6);s.pressure=Math.max(0,s.pressure-5);} },
  { chance:0.11, requires:()=>true, text:'Scattered coins on the floor.', effect:s=>{s.gold+=5+Math.floor(Math.random()*10);} },
  { chance:0.06, requires:s=>s.corruption>=40, text:'The corruption flares — a warmth you wish you didn\'t notice.', effect:s=>{s.corruption=Math.min(100,s.corruption+3);s.sensitivity=Math.min(100,s.sensitivity+4);} },
  { chance:0.05, requires:s=>s.pressure>40, text:'Your hands are shaking. Focus.', effect:s=>{s.pressure=Math.max(0,s.pressure-8);} },
];
