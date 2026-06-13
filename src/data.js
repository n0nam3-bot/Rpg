// ─── ENCOUNTERS ──────────────────────────────────────────────────────────────
export const ENCOUNTERS = {
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
  knight: {
    id:'knight', label:'Fallen Knight', zone:'final',
    spriteKey:'npc-knight-idle', animPrefix:'knight',
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
  mage: {
    id:'mage', label:'Sanctum Mage', zone:'final',
    spriteKey:'npc-mage-idle', animPrefix:'mage',
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
  patronBoss: {
    id:'patronBoss', label:'The Patron', zone:'final',
    spriteKey:'enemy-patron', animPrefix:null,
    useSkeleton:false, isBoss:true,
    hp:210, maxHp:210, atk:22, def:10,
    corruptionOnDefeat:15, stripsOnDefeat:true,
    reward:{ gold:120, hp:20, sta:20, wil:20, pressureDrop:40, item:'holyWater', corruptionDrop:12 },
    intents:['heavyStrike','arouse','heavyStrip','bind','voidPulse','heavyStrike','guard','voidPulse'],
    stripChance:0.62, arousalAttack:true, bindAttack:true,
    lore:'The architect of the sanctuary’s fall. It does not hate you. It simply wants.', scale:1.3,
  },
  possessedGuard: {
    id:'possessedGuard',
    label:'Possessed Guard',
    useSkeleton: true,
    animPrefix: 'sk',
    scale: 1.0
  }
};

// ─── HELPER DATA USED BY DIALOGUE ────────────────────────────────────────────
function adj(s,k,d){ if(s.npcs[k]) s.npcs[k].trust=Math.max(0,Math.min(100,(s.npcs[k].trust||50)+d)); }
function adjF(s,k,d){ if(s.factions[k]!==undefined) s.factions[k]=Math.max(0,Math.min(100,s.factions[k]+d)); }
function repairC(s){ ['outer','upper','lower','inner','shoes'].forEach(sl=>{s.clothing[sl].stripped=false;s.clothing[sl].dur=s.clothing[sl].max;}); }

export const DIALOGUES = {
  mage:[
    { id:'start', speaker:'Sanctum Mage', portrait:'npc-mage-idle',
      text(s){ if(!s.npcs.mage.met) return 'The wards still hold, but barely. If you keep going, keep your timing clean and your will sharper than the things hunting you.'; if((s.harassment?.knightAggression||0) >= 60) return 'The knight is on edge. The more trouble you cause in town, the faster it will answer.'; if(s.corruption>=50) return 'The corruption is speaking louder now. If you hear the knight first, that is not a good sign.'; return 'You are moving through a dangerous place. Stay light, stay sharp, and do not linger.'; },
      choices(s){ return [
        { text:'Tell me what lies ahead.', next:'mage_path' },
        { text:'How do I keep the knight from closing in?', next:'mage_knight', requires:()=> (s.harassment?.knightAggression||0) > 0 || s.questStage >= 1 },
        { text:'I will move carefully.', next:null, effect:st=>{st.npcs.mage.met=true;adj(st,'mage',4);} },
      ]; },
    },
    { id:'mage_path', speaker:'Sanctum Mage', portrait:'npc-mage-idle',
      text:'Goblins and orcs guard the outer routes. The goblin boss and minotaur bosses are stronger. If your corruption stays high, the knight will come for you. If you remain cleaner, the golem boss and my own order of restraint will be waiting further in.',
      choices:[
        { text:'Understood.', next:null, effect:st=>{st.npcs.mage.met=true;adj(st,'mage',5);} },
      ],
    },
    { id:'mage_knight', speaker:'Sanctum Mage', portrait:'npc-mage-idle',
      text:'The knight is maintaining order. When you disturb the townspeople, its aggression rises. Try not to feed the unrest — it does not forgive easily.',
      choices:[
        { text:'I’ll keep that in mind.', next:null, effect:st=>{st.npcs.mage.met=true;adj(st,'mage',4);} },
      ],
    },
  ],

  townGray:[
    { id:'start', speaker:'Townsperson', portrait:'npc-town-gray-idle',
      text(s){ return (s.harassment?.knightAggression||0) > 40 ? 'You keep the right pace and nobody bothers you. That knight gets mean when people make a scene.' : 'You look like you could use a little company. The town gets lonely after dark.'; },
      choices(s){ return [
        { text:'Keep walking.', next:null, effect:st=>{st.npcs.townGray.met=true;adj(st,'townGray',2);} },
        { text:'Smirk back.', next:'townGray_flirt',
          reaction:{
            prompt:'Break the grab pattern',
            pattern:['LEFT','RIGHT','UP'],
            success:{
              effect: st=>{ st.npcs.townGray.met=true; adj(st,'townGray',8); st.pressure=Math.max(0,st.pressure-3); },
              next:null
            },
            failure:{
              effect: st=>{ st.npcs.townGray.met=true; st.harassment.knightAggression = Math.min(100,(st.harassment.knightAggression||0)+6); st.pressure=Math.min(100, st.pressure+8); },
              next:null
            }
          }
        },
        { text:'Warn them off.', next:null, effect:st=>{st.npcs.townGray.met=true; st.harassment.knightAggression = Math.min(100,(st.harassment.knightAggression||0)+2); adj(st,'townGray',-4);} },
      ]; },
    },
  ],

  townRed:[
    { id:'start', speaker:'Townsperson', portrait:'npc-town-red-idle',
      text(s){ return (s.corruption>=50) ? 'The town notices when you are willing to bend. That makes people bold.' : 'You’re not from around here. The bold ones in town usually regret being bold.'; },
      choices(s){ return [
        { text:'Keep distance.', next:null, effect:st=>{st.npcs.townRed.met=true;adj(st,'townRed',2);} },
        { text:'Answer the flirt.', next:'townRed_flirt',
          reaction:{
            prompt:'Dodge the reach',
            pattern:['UP','LEFT','RIGHT'],
            success:{
              effect: st=>{ st.npcs.townRed.met=true; adj(st,'townRed',7); st.corruption=Math.min(100, st.corruption+1); },
              next:null
            },
            failure:{
              effect: st=>{ st.npcs.townRed.met=true; st.harassment.knightAggression = Math.min(100,(st.harassment.knightAggression||0)+8); st.pressure=Math.min(100, st.pressure+10); },
              next:null
            }
          }
        },
        { text:'Tell them off.', next:null, effect:st=>{st.npcs.townRed.met=true; st.harassment.knightAggression = Math.min(100,(st.harassment.knightAggression||0)+3); adj(st,'townRed',-5);} },
      ]; },
    },
  ],

  knight:[
    { id:'start', speaker:'Order Knight', portrait:'npc-knight-idle',
      text(s){ if((s.harassment?.knightAggression||0) >= 50) return 'The knight’s patience is thinning. It watches the town, and it watches you even more carefully now.'; if(s.corruption>=50) return 'Your corruption is loud enough for the knight to hear it from the gate.'; return 'Keep the town calm and the routes clear. That is all the knight wants from you.'; },
      choices(s){ return [
        { text:'Understood.', next:null, effect:st=>{st.npcs.knight.met=true; adj(st,'knight',2);} },
        { text:'Tell me what you know.', next:'knight_lore' },
      ]; },
    },
    { id:'knight_lore', speaker:'Order Knight', portrait:'npc-knight-idle',
      text:'The goblins are a nuisance, the orcs are pressure, the goblin boss is clever, the minotaur and its champion are brute force. Past them, corruption decides your final trial: me, or the mage and the golem behind it.',
      choices:[
        { text:'I’ll remember that.', next:null, effect:st=>{st.npcs.knight.met=true; adj(st,'knight',4);} },
      ],
    },
  ],

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
    { id:'start', speaker:'Merchant Ida', portrait:'npc-merchant-idle',
      text(s){ if(!s.npcs.merchant.met) return 'Oh! You\'re alive. I\'m Ida — trader, survivor, very motivated to leave once I\'ve cleared my stock.'; if(s.npcs.merchant.suspicious) return '*She glances at your state and says nothing for a moment.* Back again. Still standing?'; return 'Welcome back.'; },
      choices(s){ return [
        { text:'What are you selling?', next:'shop' },
        { text:'How did you end up here?', next:'story', requires:()=>!s.npcs.merchant.met },
        { text:'Take care, Ida.', next:null, effect:st=>{st.npcs.merchant.met=true;} },
      ].filter(o=>!o.requires||o.requires()); },
    },
    { id:'story', speaker:'Merchant Ida', portrait:'npc-merchant-idle',
      text:'Caravan got turned around in the fog. By the time I understood where we were, it was just me left. Elder Thane confirmed the wards hold, so here I am.',
      choices:[{text:'I\'m sorry.',next:null,effect:s=>{s.npcs.merchant.met=true;adj(s,'merchant',8);}},{text:'I\'ll keep this area safe.',next:null,effect:s=>{s.npcs.merchant.met=true;adj(s,'merchant',5);}}],
    },
    { id:'shop', speaker:'Merchant Ida', portrait:'npc-merchant-idle',
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
    { id:'start', speaker:'Captain Serrin', portrait:'npc-town-gray-idle',
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
    { id:'passage', speaker:'Captain Serrin', portrait:'npc-town-gray-idle', text:'The zones below are dangerous. The Elder vouches for you. Go. Come back changed and I will act accordingly.',
      choices:[{text:'Understood.',next:null,effect:s=>{s.npcs.guard.met=true;adj(s,'guard',5);adjF(s,'order',4);}}],
    },
    { id:'order', speaker:'Captain Serrin', portrait:'npc-town-gray-idle', text:'Thirty of us. Four left. I keep the ward charged and keep hoping.',
      choices:[{text:'I\'m going to end it.',next:null,effect:s=>{s.npcs.guard.met=true;adj(s,'guard',10);adjF(s,'order',6);}},{text:'I\'ll do what I can.',next:null,effect:s=>{s.npcs.guard.met=true;}}],
    },
    { id:'bribe', speaker:'Captain Serrin', portrait:'npc-town-gray-idle', text:'*He stares at the coin a long time.* The gate is open. I saw nothing.',
      choices:[{text:'Your secret is safe.',next:null,effect:s=>{s.gold-=30;s.npcs.guard.bribed=true;adj(s,'guard',-6);adjF(s,'order',-8);s.flags.sanctumOpen=true;}}],
    },
    { id:'secret', speaker:'Captain Serrin', portrait:'npc-town-gray-idle', text:'Passage behind the old altar in the ruins. Bypasses the main guarded corridor. I am trusting you.',
      choices:[{text:'I won\'t let you down.',next:null,effect:s=>{s.flags.secretRoute=true;adj(s,'guard',6);}}],
    },
  ],

  witch:[
    { id:'start', speaker:'Witch Moira', portrait:'npc-mage-idle',
      text(s){ if(s.npcs.witch.pact) return 'The Patron senses you. Are you ready?'; if(s.corruption>=50) return 'The shadow clings to you. Come closer — I have a proposition.'; if(!s.npcs.witch.met) return 'A visitor. I am Moira — witch, not cultist, and possessor of information you need.'; return 'Back again. Good instinct.'; },
      choices(s){ return [
        { text:'What do you know about the Patron?', next:'patron' },
        { text:'[Corruption 50+] Tell me about the pact.', next:'pact', requires:()=>s.corruption>=50&&!s.npcs.witch.pact },
        { text:'Can you repair my clothing?', next:'repair', requires:()=>Object.values(s.clothing).some(c=>c.stripped||c.dur<100) },
        { text:'I\'m leaving.', next:null, effect:st=>{st.npcs.witch.met=true;} },
      ].filter(o=>!o.requires||o.requires()); },
    },
    { id:'patron', speaker:'Witch Moira', portrait:'npc-mage-idle', text:'Old. Older than this building. It wants a vessel — someone already touched enough to carry its will. Holy Water disrupts its anchor. Strong, pure willpower can shatter it from within.',
      choices:[{text:'How do I stop it?', next:'stop'},{text:'What is a vessel?', next:'vessel'}],
    },
    { id:'stop', speaker:'Witch Moira', portrait:'npc-mage-idle', text:'Holy Water, willpower, and focus. Or — lean into the corruption rather than fighting it. That option requires a pact with me as witness and costs willpower permanently.',
      choices:[{text:'I\'ll prepare properly.',next:null,effect:s=>{s.npcs.witch.met=true;adj(s,'witch',5);}},{text:'Tell me about the other way.',next:'pact_hint',effect:s=>{adj(s,'witch',4);}}],
    },
    { id:'pact_hint', speaker:'Witch Moira', portrait:'npc-mage-idle', text:'Use the corruption as a weapon. Pact with me as anchor. Costs twenty maximum willpower. Permanently. In exchange — corruption skills deepen, and I\'ll teach you to redirect what would otherwise break you.',
      choices:[{text:'I\'ll consider it.',next:null,effect:s=>{adj(s,'witch',4);}},{text:'That sounds like a trap.',next:null,effect:s=>{adj(s,'witch',-3);}}],
    },
    { id:'vessel', speaker:'Witch Moira', portrait:'npc-mage-idle', text:'The person ceases to exist as a coherent self. Present in body. Entirely Other in mind. The quietest kind of death.',
      choices:[{text:'I will not allow that.',next:null,effect:s=>{s.npcs.witch.met=true;}},{text:'Unless the power justifies it.',next:null,effect:s=>{s.corruption=Math.min(100,s.corruption+5);adjF(s,'cult',6);}}],
    },
    { id:'pact', speaker:'Witch Moira', portrait:'npc-mage-idle', text:'The corruption in you can be shaped. My pact: −20 max willpower permanently. In return, dark skills unlock at lower thresholds and arousal becomes redirectable into power.',
      choices:[{text:'I accept.',next:'pact_seal'},{text:'Too costly.',next:null,effect:s=>{adj(s,'witch',-2);}}],
    },
    { id:'pact_seal', speaker:'Witch Moira', portrait:'npc-mage-idle', text:'*She traces a sigil on your palm.* Done. After the Patron is dealt with: the sealing stone from the sanctum\'s heart. For me. Good luck, apostate.',
      choices:[{text:'Deal.',next:null,effect:s=>{s.npcs.witch.pact=true;s.flags.witchPact=true;s.maxWil=Math.max(30,s.maxWil-20);s.wil=Math.min(s.maxWil,s.wil);adj(s,'witch',20);adjF(s,'cult',10);}}],
    },
    { id:'repair', speaker:'Witch Moira', portrait:'npc-mage-idle', text:'Twenty gold. Full restore, lightly reinforced.',
      choices(s){ return [
        { text:`Pay 20g [${s.gold}g]`, requires:()=>s.gold>=20, next:null, effect:st=>{st.gold-=20;repairC(st);} },
        { text:'Can\'t afford it.', next:null },
      ].filter(o=>!o.requires||o.requires()); },
    },
  ],
};

// ─── CORRIDOR EVENTS ─────────────────────────────────────────────────────────
export const CORRIDOR_EVENTS = [
  { chance:0.09, requires:s=>s.corruption>0, text:'A voice hisses: "Let go…"', effect:s=>{s.corruption=Math.min(100,s.corruption+2);} },
  { chance:0.07, requires:()=>true, text:'A faint warmth pulses from the stone.', effect:s=>{s.wil=Math.min(s.maxWil,s.wil+6);s.pressure=Math.max(0,s.pressure-5);} },
  { chance:0.11, requires:()=>true, text:'Scattered coins on the floor.', effect:s=>{s.gold+=5+Math.floor(Math.random()*10);} },
  { chance:0.06, requires:s=>s.corruption>=40, text:'The corruption flares — a warmth you wish you didn\'t notice.', effect:s=>{s.corruption=Math.min(100,s.corruption+3);s.sensitivity=Math.min(100,s.sensitivity+4);} },
  { chance:0.05, requires:s=>s.pressure>40, text:'Your hands are shaking. Focus.', effect:s=>{s.pressure=Math.max(0,s.pressure-8);} },
];

// ─── SKILLS ─────────────────────────────────────────────────────────────────
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

// ─── ITEMS ─────────────────────────────────────────────────────────────────
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
