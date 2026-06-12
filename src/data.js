// ─── ENCOUNTER DEFINITIONS ───────────────────────────────────────────────────
export const ENCOUNTERS = {
  // ── Shaia-pack enemies (use Skeleton sprite) ──────────────────────────────
  undeadMinion: {
    id:'undeadMinion', label:'Undead Minion',
    spriteKey:null, animPrefix:'skeleton', useSkeleton:true,
    hp:45, maxHp:45, atk:9, def:2,
    corruptionOnDefeat:2, stripsOnDefeat:false,
    reward:{ gold:12, hp:5, sta:8, pressureDrop:8 },
    intents:['strike','strike','strike','feint','guard'],
    stripChance:0, arousalAttack:false, bindAttack:false,
    lore:'A former sanctum guard reanimated by dark compulsion. It moves without purpose.',
    scale:1.1,
  },
  possessedGuard: {
    id:'possessedGuard', label:'Possessed Guard',
    spriteKey:null, animPrefix:'skeleton', useSkeleton:true,
    hp:65, maxHp:65, atk:13, def:4,
    corruptionOnDefeat:4, stripsOnDefeat:true,
    reward:{ gold:20, hp:8, sta:12, pressureDrop:10 },
    intents:['strike','strike','guard','heavyStrike','strike','feint'],
    stripChance:0.22, arousalAttack:false, bindAttack:false,
    lore:'Steel and willpower both consumed. What remains obeys hunger.',
    scale:1.1,
  },

  // ── Real sprite sheet enemies ─────────────────────────────────────────────
  goblin: {
    id:'goblin', label:'Goblin Marauder',
    spriteKey:'en-goblin-idle', animPrefix:null,
    atkKey:'en-goblin-atk', hurtKey:'en-goblin-hurt',
    useSkeleton:false,
    hp:35, maxHp:35, atk:8, def:2,
    corruptionOnDefeat:2, stripsOnDefeat:false,
    reward:{ gold:14, hp:4, sta:6, pressureDrop:6 },
    intents:['feint','strike','feint','strike','guard','feint'],
    stripChance:0.1, arousalAttack:false, bindAttack:false,
    lore:'Quick, opportunistic, and numerous. First sign you\'ve gone too deep.',
    scale:1.3,
  },
  orc: {
    id:'orc', label:'Corrupted Orc',
    spriteKey:'en-orc-idle', animPrefix:null,
    atkKey:'en-orc-atk', hurtKey:'en-orc-hurt',
    useSkeleton:false,
    hp:78, maxHp:78, atk:18, def:8,
    corruptionOnDefeat:3, stripsOnDefeat:true,
    reward:{ gold:24, hp:12, sta:10, pressureDrop:12 },
    intents:['heavyStrike','heavyStrike','strike','guard','heavyStrip'],
    stripChance:0.32, arousalAttack:false, bindAttack:false,
    lore:'Brute force given dark purpose. It doesn\'t know why it fights. Just that it must.',
    scale:0.85,
  },
  minotaur: {
    id:'minotaur', label:'Corrupted Minotaur',
    spriteKey:'en-minotaur-idle', animPrefix:'minotaur',
    useSkeleton:false,
    hp:95, maxHp:95, atk:20, def:7,
    corruptionOnDefeat:5, stripsOnDefeat:true,
    reward:{ gold:36, hp:10, sta:15, pressureDrop:13 },
    intents:['heavyStrike','strike','heavyStrike','guard','heavyStrip','strike'],
    stripChance:0.36, arousalAttack:false, bindAttack:false,
    lore:'A creature of pure aggression. Its mind was the first thing corruption consumed.',
    scale:1.0,
  },
  vampire: {
    id:'vampire', label:'Vampire',
    spriteKey:'en-vampire-idle', animPrefix:'vampire',
    useSkeleton:false,
    hp:72, maxHp:72, atk:14, def:5,
    corruptionOnDefeat:8, stripsOnDefeat:true,
    reward:{ gold:28, hp:5, sta:8, wil:10, pressureDrop:8, item:'holyWater' },
    intents:['arouse','strike','arouse','heavyStrip','guard','bind','arouse'],
    stripChance:0.42, arousalAttack:true, bindAttack:true,
    lore:'An ancient predator sustained by desire as much as blood. Holy Water is a genuine threat to it.',
    scale:1.1,
  },
  cultistSeducer: {
    id:'cultistSeducer', label:'Cultist Seducer',
    spriteKey:'en-orc-idle', animPrefix:null,
    atkKey:'en-orc-atk', hurtKey:'en-orc-hurt',
    useSkeleton:false,
    hp:55, maxHp:55, atk:9, def:3,
    corruptionOnDefeat:7, stripsOnDefeat:true,
    reward:{ gold:24, hp:3, sta:5, wil:8, pressureDrop:5, item:'holyWater' },
    intents:['arouse','arouse','strike','bind','arouse','heavyStrip'],
    stripChance:0.38, arousalAttack:true, bindAttack:true,
    lore:'An acolyte who has weaponised desire — every touch spreads corruption.',
    scale:0.85,
  },
  shadowBeast: {
    id:'shadowBeast', label:'Shadow Beast',
    spriteKey:'enemy-shadow', animPrefix:null,
    useSkeleton:false,
    hp:80, maxHp:80, atk:17, def:6,
    corruptionOnDefeat:6, stripsOnDefeat:true,
    reward:{ gold:32, hp:10, sta:10, wil:5, pressureDrop:14 },
    intents:['heavyStrike','heavyStrike','heavyStrip','arouse','guard'],
    stripChance:0.46, arousalAttack:true, bindAttack:false,
    lore:'Predatory hunger condensed into flesh and shadow.',
    scale:1.0,
  },

  // ── BOSSES ────────────────────────────────────────────────────────────────
  golemBoss: {
    id:'golemBoss', label:'Gollux the Golem',
    spriteKey:'en-golem-idle', animPrefix:'golem',
    useSkeleton:false, isBoss:true,
    hp:260, maxHp:260, atk:26, def:15,
    corruptionOnDefeat:18, stripsOnDefeat:true,
    reward:{ gold:150, hp:25, sta:25, wil:25, pressureDrop:50, item:'holyWater', corruptionDrop:15 },
    intents:['heavyStrike','heavyStrike','heavyStrip','guard','voidPulse','heavyStrike','heavyStrip','guard'],
    stripChance:0.68, arousalAttack:false, bindAttack:false,
    lore:'Stone animated by crystallised corruption. It does not tire. It does not feel. It only breaks things.',
    scale:1.6,
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
    lore:'The architect of the sanctuary\'s fall. It does not hate you. It simply wants — your will, your flesh, your becoming.',
    scale:1.3,
  },
};

// ─── SKILLS ──────────────────────────────────────────────────────────────────
export const SKILLS = [
  {
    id:'darkVeil', label:'Dark Veil', minCorruption:25, staCost:12,
    desc:'Shroud yourself — next hit glances (−80% dmg).',
    effect(state, battle) {
      battle.pbuff.veil = true;
      return 'Dark Veil raised — the next blow will glance harmlessly.';
    },
  },
  {
    id:'soulDrain', label:'Soul Drain', minCorruption:50, staCost:20,
    desc:'Steal 20 HP; enemy strikes −25% next turn.',
    effect(state, battle) {
      const drain = 20;
      battle.enemy.hp = Math.max(0, battle.enemy.hp - drain);
      state.hp = Math.min(state.maxHp, state.hp + drain);
      battle.enemy.weakened = 2;
      return `Soul Drain — stole ${drain} HP from ${battle.encounter.label}.`;
    },
  },
  {
    id:'voidBurst', label:'Void Burst', minCorruption:75, staCost:30,
    desc:'Raw corruption eruption — massive damage, deepens your own.',
    effect(state, battle) {
      const dmg = 52 + Math.floor(state.corruption / 4);
      battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg);
      state.corruption = Math.min(100, state.corruption + 9);
      return `Void Burst erupts for ${dmg} damage — corruption deepens.`;
    },
  },
];

// ─── ITEMS ───────────────────────────────────────────────────────────────────
export const ITEMS = {
  healingPotion:{
    label:'Healing Potion', desc:'Restore 35 HP and 10 STA.', usableInBattle:true,
    effect(s){ s.hp=Math.min(s.maxHp,s.hp+35); s.sta=Math.min(s.maxSta,s.sta+10); return '+35 HP, +10 STA.'; },
  },
  flashFlask:{
    label:'Flash Flask', desc:'Stun enemy 1 turn, −30 Arousal.', usableInBattle:true,
    effect(s, battle){
      if (battle) battle.enemy.stunned=Math.max((battle.enemy.stunned||0)+1,1);
      s.arousal=Math.max(0,s.arousal-30);
      return 'Flash Flask! Enemy stunned. Arousal −30.';
    },
  },
  holyWater:{
    label:'Holy Water', desc:'Corruption −10, WIL +12.', usableInBattle:false,
    effect(s){ s.corruption=Math.max(0,s.corruption-10); s.wil=Math.min(s.maxWil,s.wil+12); return 'Holy Water: Corruption −10, WIL +12.'; },
  },
};

// ─── DIALOGUE TREES ──────────────────────────────────────────────────────────
function adj(s,k,d){ if(s.npcs[k]) s.npcs[k].trust=Math.max(0,Math.min(100,(s.npcs[k].trust||50)+d)); }
function adjF(s,k,d){ if(s.factions[k]!==undefined) s.factions[k]=Math.max(0,Math.min(100,s.factions[k]+d)); }
function repairC(s){ ['outer','upper','lower','inner','shoes'].forEach(sl=>{ s.clothing[sl].stripped=false; s.clothing[sl].dur=s.clothing[sl].max; }); }

export const DIALOGUES = {
  elder:[
    {
      id:'start', speaker:'Elder Thane', portrait:'npc-elder',
      text(s){
        if(!s.npcs.elder.met) return 'Another soul drawn into the darkness. I am Elder Thane — keeper of what little light remains. The corruption here will try to claim you. Let me help you resist it.';
        if(s.corruption>=50) return '*He looks at you with deep sorrow.* The shadow has taken root, Verity. Come closer — we still have time, but you must choose soon.';
        if(s.corruption>=25) return 'I can see the taint. Holy Water, willpower, and rest will slow it. The witch knows remedies — at a cost. Come back when you need guidance.';
        return 'Still standing. Good. The catacombs grow more restless each hour.';
      },
      choices(s){
        return [
          { text:'What is this corruption?', next:'elder_corrupt', requires:()=>!s.npcs.elder.met },
          { text:'I need guidance for the catacombs.', next:'elder_guidance' },
          { text:'Tell me about the Patron.', next:'elder_patron', requires:()=>s.questStage>=1||s.npcs.elder.stage>=1 },
          { text:'[Corruption 50+] Tell me about the cult path.', next:'elder_cult', requires:()=>s.corruption>=50 },
          { text:'[Trust 65+] What are you not telling me?', next:'elder_secret', requires:()=>s.npcs.elder.trust>=65 },
          { text:'Stay safe, Elder.', next:null, effect:st=>{ adj(st,'elder',2); st.npcs.elder.met=true; } },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    { id:'elder_corrupt', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Corruption is the Patron\'s essence spreading outward. It erodes willpower, heightens physical vulnerability, and makes the Patron\'s call feel welcoming. Keep your mind fortified and your clothing intact — every layer stripped away opens you further.',
      choices:[
        { text:'How do I cleanse it?', next:'elder_cleanse', effect:s=>{ s.npcs.elder.stage=Math.max(s.npcs.elder.stage,1); } },
        { text:'Understood.', next:null, effect:s=>{ adj(s,'elder',5); s.npcs.elder.met=true; } },
      ],
    },
    { id:'elder_cleanse', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Holy Water is the surest remedy. Resting here slows its spread. And victory over the cult diminishes their influence. Here — take this to start.',
      choices:[{ text:'Thank you.', next:null, effect:s=>{ s.items.healingPotion=(s.items.healingPotion||0)+1; adj(s,'elder',5); s.npcs.elder.met=true; } }],
    },
    { id:'elder_guidance', speaker:'Elder Thane', portrait:'npc-elder',
      text:'The merchant has potions. Chests hold flasks. Guard your clothing — the cultists and vampires down there use arousal as a weapon. Use Focus to redirect rather than suppress it.',
      choices:[{ text:'Understood.', next:null, effect:s=>{ adj(s,'elder',3); } }],
    },
    { id:'elder_patron', speaker:'Elder Thane', portrait:'npc-elder',
      text:'The Patron is sealed in the Inner Sanctum — older than this building, sealed by a compromise I made that I now regret. Strong willpower, low corruption, holy water. Those are your weapons.',
      choices:[
        { text:'Can it simply be destroyed?', next:'elder_destroy' },
        { text:'[Trust 65+] Is there another way?', next:'elder_bargain', requires:s=>s.npcs.elder.trust>=65 },
        { text:'I\'ll be ready.', next:null },
      ],
    },
    { id:'elder_destroy', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Yes. Holy Water weakens its form. Focused willpower — genuine, unconditional — can shatter its anchor. High corruption makes this nearly impossible. You become too compatible with what you\'re trying to destroy.',
      choices:[{ text:'I\'ll prepare carefully.', next:null, effect:s=>{ s.flags.elderReveal=true; adj(s,'elder',5); } }],
    },
    { id:'elder_bargain', speaker:'Elder Thane', portrait:'npc-elder',
      text:'*He is quiet a long time.* If your corruption is deep enough, the Patron may offer to make you its vessel. Power beyond measure. Complete loss of self. Three people accepted. None of them came back as themselves.',
      choices:[
        { text:'I won\'t let that happen.', next:null, effect:s=>{ adj(s,'elder',8); } },
        { text:'Power like that sounds... significant.', next:null, effect:s=>{ adj(s,'elder',-12); s.corruption=Math.min(100,s.corruption+3); adjF(s,'cult',5); } },
      ],
    },
    { id:'elder_cult', speaker:'Elder Thane', portrait:'npc-elder',
      text:'*Pain in his eyes.* The cult will tell you corruption is a gift. They aren\'t entirely wrong about the power. Every initiate I\'ve watched has eventually stopped being who they were.',
      choices:[
        { text:'I\'m not joining them.', next:null, effect:s=>{ adj(s,'elder',6); } },
        { text:'What if I infiltrated them?', next:'elder_infiltrate' },
        { text:'Maybe they\'re not wrong.', next:null, effect:s=>{ adj(s,'elder',-15); adjF(s,'cult',8); s.corruption=Math.min(100,s.corruption+4); } },
      ],
    },
    { id:'elder_infiltrate', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Dangerous. Their rites increase corruption even if you\'re only pretending. But the intelligence you could gather... Come back before you go in too deep.',
      choices:[{ text:'I\'ll be careful.', next:null, effect:s=>{ adj(s,'elder',5); s.flags.elderReveal=true; } }],
    },
    { id:'elder_secret', speaker:'Elder Thane', portrait:'npc-elder',
      text:'*Long silence.* I performed the original sealing. I left a small conduit in the seal — I thought I could monitor the Patron\'s state through it. That conduit is what it has been widening. The current situation is my fault. I am trying to give you the tools to correct my mistake.',
      choices:[
        { text:'I don\'t blame you for trying.', next:null, effect:s=>{ adj(s,'elder',12); s.flags.elderReveal=true; } },
        { text:'Your mistake could destroy everything.', next:null, effect:s=>{ adj(s,'elder',-5); s.flags.elderReveal=true; } },
      ],
    },
  ],

  merchant:[
    {
      id:'start', speaker:'Merchant Ida', portrait:'npc-merchant',
      text(s){
        if(!s.npcs.merchant.met) return 'Oh! You\'re alive. I was beginning to think I\'d be talking to the walls forever. I\'m Ida — trader, survivor, and very motivated to leave once I\'ve cleared my stock.';
        if(s.npcs.merchant.suspicious) return '*She glances at your torn clothing and says nothing for a moment.* ...Back again. I won\'t ask. Just browsing?';
        return 'Welcome back. Still breathing — ahead of most who\'ve come through.';
      },
      choices(s){
        return [
          { text:'What are you selling?', next:'shop' },
          { text:'How did you end up here?', next:'merchant_story', requires:()=>!s.npcs.merchant.met },
          { text:'[Corruption 50+] Do you have anything... unusual?', next:'merchant_dark', requires:()=>s.corruption>=50&&!s.npcs.merchant.suspicious },
          { text:'Take care, Ida.', next:null, effect:st=>{ st.npcs.merchant.met=true; } },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    { id:'merchant_story', speaker:'Merchant Ida', portrait:'npc-merchant',
      text:'Caravan got turned around in the fog. By the time I understood where we were, it was just me left. Elder Thane confirmed the sanctuary wards hold, so I set up here. Selling hope by the flask.',
      choices:[
        { text:'I\'m sorry about your people.', next:null, effect:s=>{ s.npcs.merchant.met=true; adj(s,'merchant',9); } },
        { text:'I\'ll keep this area safe.', next:null, effect:s=>{ s.npcs.merchant.met=true; adj(s,'merchant',5); } },
      ],
    },
    {
      id:'shop', speaker:'Merchant Ida', portrait:'npc-merchant',
      text:'Healing Potions: 15g. Flash Flasks: 20g. Holy Water: 30g — one left. What\'ll it be?',
      choices(s){
        return [
          { text:`Buy Healing Potion (15g) [Have: ${s.gold}g]`, requires:()=>s.gold>=15, next:null, effect:st=>{ st.gold-=15; st.items.healingPotion=(st.items.healingPotion||0)+1; } },
          { text:'Buy Flash Flask (20g)', requires:()=>s.gold>=20, next:null, effect:st=>{ st.gold-=20; st.items.flashFlask=(st.items.flashFlask||0)+1; } },
          { text:'Buy Holy Water (30g)', requires:()=>s.gold>=30&&!s.flags.boughtHW, next:null, effect:st=>{ st.gold-=30; st.items.holyWater=(st.items.holyWater||0)+1; st.flags.boughtHW=true; } },
          { text:'Nothing right now.', next:null },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    { id:'merchant_dark', speaker:'Merchant Ida', portrait:'npc-merchant',
      text:'*She hesitates.* A cultist attacked me two days ago. I took this off him — some kind of vial. Smells wrong but clearly valuable to them. Take it. Free. I don\'t want it near me.',
      choices:[
        { text:'Take the vial.', next:null, effect:s=>{ s.items.holyWater=(s.items.holyWater||0)+1; s.npcs.merchant.suspicious=true; adj(s,'merchant',-5); } },
        { text:'I\'ll leave it.', next:null, effect:s=>{ adj(s,'merchant',5); } },
      ],
    },
  ],

  guard:[
    {
      id:'start', speaker:'Captain Serrin', portrait:'npc-guard',
      text(s){
        if(s.npcs.guard.hostile) return '*Hand on sword hilt.* We have nothing to discuss.';
        if(!s.npcs.guard.met) return 'Halt. Captain Serrin — what remains of the Order\'s garrison. The catacombs are restricted. State your purpose.';
        if(s.npcs.guard.bribed) return '*A curt nod.* The passage is open. Don\'t make me regret this.';
        if(s.corruption>=50) return '*He watches you with open unease.* I can see it on you. Going deeper will only accelerate it.';
        return 'Back again. What do you need?';
      },
      choices(s){
        return [
          { text:'I need passage to the catacombs.', next:'guard_passage', requires:()=>!s.npcs.guard.hostile },
          { text:'What happened to the Order here?', next:'guard_order', requires:()=>!s.npcs.guard.met },
          { text:'[30g] I can compensate for your supply shortage.', next:'guard_bribe', requires:()=>s.gold>=30&&!s.npcs.guard.bribed&&!s.npcs.guard.hostile },
          { text:'[Trust 68+] Is there another route inside?', next:'guard_secret', requires:()=>s.npcs.guard.trust>=68 },
          { text:'Never mind.', next:null, effect:st=>{ st.npcs.guard.met=true; } },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    { id:'guard_passage', speaker:'Captain Serrin', portrait:'npc-guard',
      text:'The catacombs aren\'t safe — half my garrison are what guards them now. But the Elder vouches for you. Go. If you come back changed, I will act accordingly.',
      choices:[
        { text:'Understood.', next:null, effect:s=>{ s.npcs.guard.met=true; s.flags.dungeonOpen=true; adj(s,'guard',5); adjF(s,'order',4); } },
      ],
    },
    { id:'guard_order', speaker:'Captain Serrin', portrait:'npc-guard',
      text:'Thirty of us. Six fled. Fourteen turned. Nine died fighting what they became. Four left in this hall. I keep the ward charged and keep hoping someone comes with a real solution.',
      choices:[
        { text:'I\'m going to end it.', next:null, effect:s=>{ s.npcs.guard.met=true; adj(s,'guard',10); adjF(s,'order',6); } },
        { text:'I\'ll do what I can.', next:null, effect:s=>{ s.npcs.guard.met=true; } },
      ],
    },
    { id:'guard_bribe', speaker:'Captain Serrin', portrait:'npc-guard',
      text:'*He stares at the coin for several seconds.* ...That covers two weeks of supplies. The inner gate is open. I saw nothing. *He pockets it with a look that will cost him sleep.*',
      choices:[{ text:'Your secret is safe.', next:null, effect:s=>{ s.gold-=30; s.npcs.guard.bribed=true; adj(s,'guard',-6); adjF(s,'order',-8); s.flags.sanctumOpen=true; } }],
    },
    { id:'guard_secret', speaker:'Captain Serrin', portrait:'npc-guard',
      text:'There\'s a passage behind the old altar in the catacombs. Bypasses the main guarded corridor entirely. I\'m trusting you with this.',
      choices:[{ text:'I won\'t let you down.', next:null, effect:s=>{ s.flags.secretRoute=true; adj(s,'guard',6); } }],
    },
  ],

  witch:[
    {
      id:'start', speaker:'Witch Moira', portrait:'npc-witch',
      text(s){
        if(s.npcs.witch.pact) return '*She smiles as if she expected you.* The Patron senses your approach. Its appetite sharpens. Are you ready for what you\'ll find?';
        if(s.corruption>=50) return 'Mmm. The shadow clings to you beautifully. I have a proposition that suits your current condition precisely.';
        if(!s.npcs.witch.met) return 'A visitor. How extraordinary. I am Moira — witch, not cultist, and possessor of information you need. I am not your enemy.';
        return 'Back again. Good instinct.';
      },
      choices(s){
        return [
          { text:'What do you know about the Patron?', next:'witch_patron' },
          { text:'[Corruption 50+] Tell me about the pact.', next:'witch_pact', requires:()=>s.corruption>=50&&!s.npcs.witch.pact },
          { text:'Can you repair my clothing?', next:'witch_repair', requires:()=>Object.values(s.clothing).some(c=>c.stripped||c.dur<100) },
          { text:'[Trust 40+] Teach me about redirecting corruption.', next:'witch_teach', requires:()=>s.npcs.witch.trust>=40 },
          { text:'I\'m leaving.', next:null, effect:st=>{ st.npcs.witch.met=true; } },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    { id:'witch_patron', speaker:'Witch Moira', portrait:'npc-witch',
      text:'Old. Older than this building. It wants a vessel — someone touched enough to carry its will without physical destruction. That\'s why the cultists spread corruption rather than simply killing. They\'re preparing candidates.',
      choices:[
        { text:'How do I stop it?', next:'witch_stop' },
        { text:'What does becoming a vessel mean?', next:'witch_vessel' },
      ],
    },
    { id:'witch_stop', speaker:'Witch Moira', portrait:'npc-witch',
      text:'Holy Water disrupts its physical anchor. Strong willpower — genuine and unconditional — can strike the seal\'s core and shatter it. You\'d need low corruption and high will. Or... there is another way.',
      choices:[
        { text:'Tell me the other way.', next:'witch_other', effect:s=>{ adj(s,'witch',4); } },
        { text:'I\'ll prepare properly.', next:null, effect:s=>{ s.npcs.witch.met=true; adj(s,'witch',5); } },
      ],
    },
    { id:'witch_other', speaker:'Witch Moira', portrait:'npc-witch',
      text:'Lean into the corruption rather than fighting it. Use it as a weapon. It requires a formal pact — I act as anchor and witness — and costs willpower permanently. But you\'d wield the corruption rather than being wielded by it.',
      choices:[
        { text:'I\'ll consider it.', next:null, effect:s=>{ adj(s,'witch',5); } },
        { text:'That sounds like a trap.', next:null, effect:s=>{ adj(s,'witch',-3); } },
      ],
    },
    { id:'witch_vessel', speaker:'Witch Moira', portrait:'npc-witch',
      text:'The person ceases to exist as a coherent self and becomes an expression of the Patron\'s desire. Present in body. Entirely alien in mind. The cultists call it ascension. I call it the quietest kind of death.',
      choices:[
        { text:'I will not allow that.', next:null, effect:s=>{ s.npcs.witch.met=true; } },
        { text:'Unless the power justifies it.', next:null, effect:s=>{ s.corruption=Math.min(100,s.corruption+5); adjF(s,'cult',6); } },
      ],
    },
    { id:'witch_pact', speaker:'Witch Moira', portrait:'npc-witch',
      text:'The corruption in you can be shaped rather than simply spreading. My pact will permanently reduce your maximum willpower by 20. In return, corruption skills unlock at lower thresholds, and I\'ll teach you to redirect arousal into power. Interested?',
      choices:[
        { text:'I accept the pact.', next:'witch_pact_seal' },
        { text:'The cost is too steep.', next:null, effect:s=>{ adj(s,'witch',-2); } },
      ],
    },
    { id:'witch_pact_seal', speaker:'Witch Moira', portrait:'npc-witch',
      text:'*She traces a sigil on your palm — it burns cold, then settles.* Done. After the Patron is dealt with, bring me the sealing stone from the sanctum\'s heart. It has no power left against the Patron. For other purposes — invaluable. Good luck, apostate.',
      choices:[{ text:'We have a deal.', next:null, effect:s=>{
        s.npcs.witch.pact=true; s.flags.witchPact=true;
        s.maxWil=Math.max(30,s.maxWil-20); s.wil=Math.min(s.maxWil,s.wil);
        adj(s,'witch',20); adjF(s,'cult',10);
      } }],
    },
    { id:'witch_repair', speaker:'Witch Moira', portrait:'npc-witch',
      text:'Clothing? My enchantments are thorough — not just repaired, slightly reinforced. Twenty gold for a full restore. Worth it, given what strips it down here.',
      choices(s){
        return [
          { text:`Pay 20g to repair all clothing [${s.gold}g]`, requires:()=>s.gold>=20, next:null, effect:st=>{ st.gold-=20; repairC(st); } },
          { text:'I can\'t afford it.', next:null },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    { id:'witch_teach', speaker:'Witch Moira', portrait:'npc-witch',
      text:'When arousal builds, the instinct is to suppress it — that wastes the energy and leaves you vulnerable. Use Focus instead. You\'re redirecting stimulation into clarity. The enemies use arousal as a weapon because most victims fight it. You don\'t have to.',
      choices:[{ text:'That\'s genuinely useful.', next:null, effect:s=>{ s.sensitivity=Math.max(0,s.sensitivity-10); adj(s,'witch',6); } }],
    },
  ],
};

// ─── CORRIDOR EVENTS ─────────────────────────────────────────────────────────
export const CORRIDOR_EVENTS = [
  { chance:0.09, requires:s=>s.corruption>0,  text:'A voice hisses from the dark: "Let go…"',       effect:s=>{ s.corruption=Math.min(100,s.corruption+2); } },
  { chance:0.07, requires:()=>true,           text:'A faint warmth pulses from the stone.',            effect:s=>{ s.wil=Math.min(s.maxWil,s.wil+6); s.pressure=Math.max(0,s.pressure-5); } },
  { chance:0.11, requires:()=>true,           text:'Scattered coins glint on the floor.',              effect:s=>{ s.gold+=5+Math.floor(Math.random()*10); } },
  { chance:0.06, requires:s=>s.corruption>=40,text:'The corruption flares — a warmth you wish you didn\'t notice.', effect:s=>{ s.corruption=Math.min(100,s.corruption+3); s.sensitivity=Math.min(100,s.sensitivity+4); } },
  { chance:0.05, requires:s=>s.pressure>40,  text:'Your hands are shaking. Focus.',                   effect:s=>{ s.pressure=Math.max(0,s.pressure-8); } },
  { chance:0.04, requires:s=>s.defeats>0,    text:'You remember the last time you fell. It steadies you somehow.', effect:s=>{ s.wil=Math.min(s.maxWil,s.wil+8); } },
];
