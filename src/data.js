// ─── ENCOUNTERS ──────────────────────────────────────────────────────────────
export const ENCOUNTERS = {
  undeadMinion: {
    id:'undeadMinion', label:'Undead Minion',
    spriteKey:'sk-idle', useSkeleton:true, spriteFamily:null,
    hp:45, maxHp:45, atk:9, def:2,
    corruptionOnDefeat:2, stripsOnDefeat:false,
    reward:{ gold:12, hp:5, sta:8, pressureDrop:8 },
    intents:['strike','strike','strike','feint','guard'],
    stripChance:0, arousalAttack:false, bindAttack:false,
    lore:'A former sanctum guard, reanimated and driven by dark compulsion.',
  },
  possessedGuard: {
    id:'possessedGuard', label:'Possessed Guard',
    spriteKey:'enemy-guard', useSkeleton:true, spriteFamily:null,
    hp:65, maxHp:65, atk:13, def:4,
    corruptionOnDefeat:4, stripsOnDefeat:true,
    reward:{ gold:20, hp:8, sta:12, pressureDrop:10 },
    intents:['strike','strike','guard','heavyStrike','strike','feint'],
    stripChance:0.22, arousalAttack:false, bindAttack:false,
    lore:'Steel and willpower alike consumed by the Patron\'s hunger.',
  },
  cultistSeducer: {
    id:'cultistSeducer', label:'Cultist Seducer',
    spriteKey:'enemy-cultist', useSkeleton:false, spriteFamily:null,
    hp:55, maxHp:55, atk:9, def:3,
    corruptionOnDefeat:7, stripsOnDefeat:true,
    reward:{ gold:24, hp:3, sta:5, wil:8, pressureDrop:5, item:'holyWater' },
    intents:['arouse','arouse','strike','bind','arouse','heavyStrip','arouse'],
    stripChance:0.38, arousalAttack:true, bindAttack:true,
    lore:'An acolyte who has weaponised desire — every touch seeps corruption.',
  },
  shadowBeast: {
    id:'shadowBeast', label:'Shadow Beast',
    spriteKey:'enemy-shadow', useSkeleton:false, spriteFamily:null,
    hp:80, maxHp:80, atk:17, def:6,
    corruptionOnDefeat:6, stripsOnDefeat:true,
    reward:{ gold:32, hp:10, sta:10, wil:5, pressureDrop:14 },
    intents:['heavyStrike','heavyStrike','heavyStrip','arouse','guard','heavyStrike'],
    stripChance:0.46, arousalAttack:true, bindAttack:false,
    lore:'Predatory hunger condensed into flesh and shadow.',
  },
  patronBoss: {
    id:'patronBoss', label:'The Patron',
    spriteKey:'enemy-patron', useSkeleton:false, spriteFamily:null,
    hp:200, maxHp:200, atk:22, def:10, isBoss:true,
    corruptionOnDefeat:15, stripsOnDefeat:true,
    reward:{ gold:120, hp:20, sta:20, wil:20, pressureDrop:40, item:'holyWater', corruptionDrop:12 },
    intents:['heavyStrike','arouse','heavyStrip','bind','voidPulse','heavyStrike','guard','voidPulse'],
    stripChance:0.62, arousalAttack:true, bindAttack:true,
    lore:'The architect of the sanctuary\'s fall. It does not hate you. It simply wants — your will, your flesh, your becoming.',
  },
};

// ─── SKILLS ──────────────────────────────────────────────────────────────────
export const SKILLS = [
  {
    id:'darkVeil', label:'Dark Veil', minCorruption:25, staCost:12,
    desc:'Wrap in corruption energy — next hit glances (−80% dmg).',
    effect(state, battle) {
      battle.pbuff.veil = true;
      return 'Dark Veil raised — the next blow will glance harmlessly.';
    },
  },
  {
    id:'soulDrain', label:'Soul Drain', minCorruption:50, staCost:20,
    desc:'Steal 20 HP from target; they strike −25% next turn.',
    effect(state, battle) {
      const drain = 20;
      battle.enemy.hp = Math.max(0, battle.enemy.hp - drain);
      state.hp = Math.min(state.maxHp, state.hp + drain);
      battle.enemy.weakened = 2;
      return `Soul Drain steals ${drain} HP from ${battle.encounter.label}.`;
    },
  },
  {
    id:'voidBurst', label:'Void Burst', minCorruption:75, staCost:30,
    desc:'Unleash raw corruption — massive damage but deepens your own.',
    effect(state, battle) {
      const dmg = 50 + Math.floor(state.corruption / 4);
      battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg);
      state.corruption = Math.min(100, state.corruption + 9);
      return `Void Burst erupts for ${dmg} damage — corruption deepens.`;
    },
  },
];

// ─── ITEMS ───────────────────────────────────────────────────────────────────
export const ITEMS = {
  healingPotion: {
    label:'Healing Potion', desc:'Restore 35 HP and 10 STA.', usableInBattle:true,
    effect(state) { state.hp=Math.min(state.maxHp,state.hp+35); state.sta=Math.min(state.maxSta,state.sta+10); return '+35 HP, +10 STA.'; },
  },
  flashFlask: {
    label:'Flash Flask', desc:'Stun enemy 1 turn, −30 Arousal.', usableInBattle:true,
    effect(state, battle) {
      if (battle) battle.enemy.stunned = Math.max((battle.enemy.stunned||0)+1, 1);
      state.arousal = Math.max(0, state.arousal - 30);
      return 'Flash Flask! Enemy stunned. Arousal −30.';
    },
  },
  holyWater: {
    label:'Holy Water', desc:'Corruption −10, WIL +12.', usableInBattle:false,
    effect(state) { state.corruption=Math.max(0,state.corruption-10); state.wil=Math.min(state.maxWil,state.wil+12); return 'Holy Water: Corruption −10, WIL +12.'; },
  },
};

// ─── DIALOGUE TREES ──────────────────────────────────────────────────────────
function adjTrust(state, key, d) { if(state.npcs[key]) state.npcs[key].trust=Math.max(0,Math.min(100,(state.npcs[key].trust||50)+d)); }
function adjFaction(state, key, d) { if(state.factions[key]!==undefined) state.factions[key]=Math.max(0,Math.min(100,state.factions[key]+d)); }
function repairCloth(state) { ['outer','upper','lower','inner','shoes'].forEach(s=>{ state.clothing[s].stripped=false; state.clothing[s].dur=state.clothing[s].max; }); }

export const DIALOGUES = {
  elder: [
    {
      id:'start', speaker:'Elder Thane', portrait:'npc-elder',
      text(s) {
        if (!s.npcs.elder.met)    return 'Another soul drawn into the darkness. I am Elder Thane — keeper of what little light remains. The corruption here will try to claim you. Let me help you resist it.';
        if (s.corruption >= 50)   return '*His eyes are heavy with sorrow.* The shadow has taken deep root in you, Verity. Come closer — we still have time, but you must choose soon.';
        if (s.corruption >= 25)   return 'I see the taint growing. Holy Water, willpower, and rest will slow it. The witch below knows remedies — costly ones. Come back if you need guidance.';
        return 'Still standing. Good. The catacombs grow more restless each hour.';
      },
      choices(s) {
        return [
          { text:'What is this corruption?', next:'elder_corrupt', requires:()=>!s.npcs.elder.met },
          { text:'I need guidance for the catacombs.', next:'elder_guidance' },
          { text:'Tell me about the Patron.', next:'elder_patron', requires:()=>s.questStage>=1||s.npcs.elder.stage>=1 },
          { text:'[Corruption 50+] Tell me about the cult path.', next:'elder_cult', requires:()=>s.corruption>=50 },
          { text:'[Trust 65+] What are you not telling me?', next:'elder_secret', requires:()=>s.npcs.elder.trust>=65 },
          { text:'Stay safe, Elder.', next:null, effect:st=>{ adjTrust(st,'elder',2); st.npcs.elder.met=true; } },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    {
      id:'elder_corrupt', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Corruption is the Patron\'s essence — it spreads through defeat, despair, and certain enemies\' touch. It erodes willpower and heightens vulnerability to further harm. Most dangerously: it makes the Patron\'s call feel... welcoming. Keep your mind fortified and your clothing intact.',
      choices:[
        { text:'How do I cleanse it?', next:'elder_cleanse', effect:s=>{ s.npcs.elder.stage=Math.max(s.npcs.elder.stage,1); } },
        { text:'I understand. I\'ll be careful.', next:null, effect:s=>{ adjTrust(s,'elder',5); s.npcs.elder.met=true; } },
      ],
    },
    {
      id:'elder_cleanse', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Holy Water is the surest remedy — find it in chests or buy from the merchant. Resting in this hall slows its spread. And victory over the cult diminishes their influence. Here — take this to start.',
      choices:[
        { text:'Thank you, Elder.', next:null, effect:s=>{ s.items.healingPotion=(s.items.healingPotion||0)+1; adjTrust(s,'elder',5); s.npcs.elder.met=true; } },
      ],
    },
    {
      id:'elder_guidance', speaker:'Elder Thane', portrait:'npc-elder',
      text:'The merchant has potions. Chests hold flasks. Guard your clothing — each layer stripped leaves you more susceptible to what hunts below. The cultists use arousal as a weapon; redirect it with Focus rather than fighting it directly.',
      choices:[
        { text:'Understood. I\'ll be careful.', next:null, effect:s=>{ adjTrust(s,'elder',3); } },
      ],
    },
    {
      id:'elder_patron', speaker:'Elder Thane', portrait:'npc-elder',
      text:'The Patron is sealed in the Inner Sanctum — an entity of pure corruption, older than this building. Something has been weakening the seal. When you face it, you must be prepared: strong willpower, low corruption, holy water if you can spare it.',
      choices:[
        { text:'Can it be destroyed outright?', next:'elder_destroy' },
        { text:'[Trust 65+] Is there another way?', next:'elder_bargain', requires:s=>s.npcs.elder.trust>=65 },
        { text:'I\'ll be ready.', next:null },
      ],
    },
    {
      id:'elder_destroy', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Yes. Holy Water weakens its physical form significantly. A focused act of pure intent — willpower channelled as force — can shatter its anchor to this world. High corruption makes this nearly impossible; you become too compatible with what you\'re trying to destroy.',
      choices:[{ text:'I\'ll stockpile holy water.', next:null, effect:s=>{ s.flags.elderReveal=true; adjTrust(s,'elder',5); } }],
    },
    {
      id:'elder_bargain', speaker:'Elder Thane', portrait:'npc-elder',
      text:'*He pauses a long moment.* I should not speak of this. If your corruption is already deep, the Patron may offer you power in exchange for... becoming its vessel. You would gain tremendous ability. You would also cease to be yourself in any meaningful sense. I have watched three people accept. None returned.',
      choices:[
        { text:'I won\'t make that choice.', next:null, effect:s=>{ adjTrust(s,'elder',8); } },
        { text:'Power sounds... interesting.', next:null, effect:s=>{ adjTrust(s,'elder',-12); s.corruption=Math.min(100,s.corruption+3); adjFaction(s,'cult',5); } },
      ],
    },
    {
      id:'elder_cult', speaker:'Elder Thane', portrait:'npc-elder',
      text:'*He looks at you with deep pain.* You can feel the pull already. The cult will tell you corruption is a gift — they are not entirely wrong about the power. But every initiate I\'ve seen has eventually stopped being who they were. The Patron consumes, Verity. It does not share.',
      choices:[
        { text:'I\'m not joining them.', next:null, effect:s=>{ adjTrust(s,'elder',6); } },
        { text:'What if I used them for information?', next:'elder_infiltrate' },
        { text:'Maybe the cult isn\'t wrong.', next:null, effect:s=>{ adjTrust(s,'elder',-15); adjFaction(s,'cult',8); s.corruption=Math.min(100,s.corruption+4); } },
      ],
    },
    {
      id:'elder_infiltrate', speaker:'Elder Thane', portrait:'npc-elder',
      text:'Dangerous, but not without merit. Their rites will increase your corruption even if you\'re only pretending — the ritual does not care about intent. But the information you could gather... Come back to me before you go in too deep.',
      choices:[{ text:'I\'ll be careful.', next:null, effect:s=>{ adjTrust(s,'elder',5); s.flags.elderReveal=true; } }],
    },
    {
      id:'elder_secret', speaker:'Elder Thane', portrait:'npc-elder',
      text:'*A long silence.* I was the one who performed the original sealing. I made a compromise — I left a small conduit in the seal, thinking I could monitor the Patron\'s state. That conduit is what it has been widening. The current situation is my fault. I am trying to give you the tools to correct my mistake.',
      choices:[
        { text:'I don\'t blame you for trying.', next:null, effect:s=>{ adjTrust(s,'elder',12); s.flags.elderReveal=true; } },
        { text:'Your mistake could destroy everything.', next:null, effect:s=>{ adjTrust(s,'elder',-5); s.flags.elderReveal=true; } },
      ],
    },
  ],

  merchant: [
    {
      id:'start', speaker:'Merchant Ida', portrait:'npc-merchant',
      text(s) {
        if (!s.npcs.merchant.met) return 'Oh! You\'re alive. I was beginning to think I\'d be talking to the walls forever. I\'m Ida — trader, survivor, and desperately trying to leave this place once I\'ve unloaded my stock.';
        if (s.npcs.merchant.suspicious) return '*She glances at your torn clothing and says nothing for a moment.* ...Back again. I\'m not asking questions. Just browsing?';
        return 'Welcome back. Still breathing — that puts you ahead of most who\'ve come through.';
      },
      choices(s) {
        return [
          { text:'What are you selling?', next:'merchant_shop' },
          { text:'How did you end up here?', next:'merchant_story', requires:()=>!s.npcs.merchant.met },
          { text:'[Corruption 50+] Do you have anything... unusual?', next:'merchant_dark', requires:()=>s.corruption>=50&&!s.npcs.merchant.suspicious },
          { text:'Take care, Ida.', next:null, effect:st=>{ st.npcs.merchant.met=true; } },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    {
      id:'merchant_story', speaker:'Merchant Ida', portrait:'npc-merchant',
      text:'Caravan got turned around in the dark three nights ago. By the time I understood where we were, it was just me left. The others... *she stops.* Elder Thane confirmed the sanctuary wards still hold, so I set up here. Selling comfort by the flask.',
      choices:[
        { text:'I\'m sorry about your people.', next:null, effect:s=>{ s.npcs.merchant.met=true; adjTrust(s,'merchant',9); } },
        { text:'I\'ll keep this area safe.', next:null, effect:s=>{ s.npcs.merchant.met=true; adjTrust(s,'merchant',5); } },
      ],
    },
    {
      id:'merchant_shop', speaker:'Merchant Ida', portrait:'npc-merchant',
      text:'Healing Potions: 15g each. Flash Flasks: 20g. Holy Water: 30g — I only have one left. What can I do for you?',
      choices(s) {
        return [
          { text:`Buy Healing Potion (15g)  [${s.gold}g]`, requires:()=>s.gold>=15, next:null, effect:st=>{ st.gold-=15; st.items.healingPotion=(st.items.healingPotion||0)+1; } },
          { text:`Buy Flash Flask (20g)`, requires:()=>s.gold>=20, next:null, effect:st=>{ st.gold-=20; st.items.flashFlask=(st.items.flashFlask||0)+1; } },
          { text:`Buy Holy Water (30g)`, requires:()=>s.gold>=30&&!s.flags.boughtHW, next:null, effect:st=>{ st.gold-=30; st.items.holyWater=(st.items.holyWater||0)+1; st.flags.boughtHW=true; } },
          { text:'Nothing right now.', next:null },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    {
      id:'merchant_dark', speaker:'Merchant Ida', portrait:'npc-merchant',
      text:'*She hesitates.* A cultist attacked me two days ago. I took this off him — some kind of vial. It smells wrong but it\'s clearly valuable to them. I want it gone. Take it. Free. Just don\'t tell me what it does.',
      choices:[
        { text:'Take the vial.', next:null, effect:s=>{ s.items.holyWater=(s.items.holyWater||0)+1; s.npcs.merchant.suspicious=true; adjTrust(s,'merchant',-5); } },
        { text:'I\'ll leave it.', next:null, effect:s=>{ adjTrust(s,'merchant',5); } },
      ],
    },
  ],

  guard: [
    {
      id:'start', speaker:'Captain Serrin', portrait:'npc-guard',
      text(s) {
        if (s.npcs.guard.hostile) return '*His hand rests on his sword.* We have nothing to discuss. Leave.';
        if (!s.npcs.guard.met) return 'Halt. I am Captain Serrin — what remains of the Order\'s garrison. The catacombs are restricted. State your purpose.';
        if (s.npcs.guard.bribed) return '*A curt nod.* The passage is open. Don\'t make me regret this.';
        if (s.corruption>=50) return '*He watches you with undisguised unease.* I can see it on you. If you\'ve been touched, going deeper will only accelerate it.';
        return 'Back again. What do you need?';
      },
      choices(s) {
        return [
          { text:'I need passage to the catacombs.', next:'guard_passage', requires:()=>!s.npcs.guard.hostile },
          { text:'What happened to the Order here?', next:'guard_order', requires:()=>!s.npcs.guard.met },
          { text:`[30g] I can compensate for your supply shortage.`, next:'guard_bribe', requires:()=>s.gold>=30&&!s.npcs.guard.bribed&&!s.npcs.guard.hostile },
          { text:'[Trust 68+] Is there another route inside?', next:'guard_secret', requires:()=>s.npcs.guard.trust>=68 },
          { text:'Never mind.', next:null, effect:st=>{ st.npcs.guard.met=true; } },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    {
      id:'guard_passage', speaker:'Captain Serrin', portrait:'npc-guard',
      text:'The catacombs are not safe. Half my garrison are what guards it now. But someone has to deal with what\'s down there. The Elder vouches for you — go. If you come back... changed... I will act accordingly.',
      choices:[
        { text:'I understand.', next:null, effect:s=>{ s.npcs.guard.met=true; s.flags.dungeonOpen=true; adjTrust(s,'guard',5); adjFaction(s,'order',4); } },
        { text:'What does "changed" mean?', next:'guard_changed' },
      ],
    },
    {
      id:'guard_changed', speaker:'Captain Serrin', portrait:'npc-guard',
      text:'Corrupted. Turned. I have watched it happen to people with far more discipline than either of us. It starts as exhaustion. Then the choices start shifting. If you feel yourself being pulled toward the darkness — retreat. Don\'t keep pushing.',
      choices:[{ text:'I\'ll watch for it.', next:null, effect:s=>{ adjTrust(s,'guard',8); } }],
    },
    {
      id:'guard_order', speaker:'Captain Serrin', portrait:'npc-guard',
      text:'Thirty of us. The Patron\'s influence spreads faster than doctrine accounts for. Six fled. Fourteen turned. Nine died fighting what they turned into. There are four of us left in this hall. I keep the ward charged and I keep hoping someone comes with a real solution.',
      choices:[
        { text:'I\'m going to end it.', next:null, effect:s=>{ s.npcs.guard.met=true; adjTrust(s,'guard',10); adjFaction(s,'order',6); } },
        { text:'I\'ll do what I can.', next:null, effect:s=>{ s.npcs.guard.met=true; } },
      ],
    },
    {
      id:'guard_bribe', speaker:'Captain Serrin', portrait:'npc-guard',
      text:'*He stares at the coin for several seconds.* ...That covers two weeks of supplies. The inner gate is open. I saw nothing. *He pockets it with a look that will take him a long time to recover from.*',
      choices:[{ text:'Your secret is safe.', next:null, effect:s=>{ s.gold-=30; s.npcs.guard.bribed=true; adjTrust(s,'guard',-6); adjFaction(s,'order',-8); s.flags.sanctumOpen=true; } }],
    },
    {
      id:'guard_secret', speaker:'Captain Serrin', portrait:'npc-guard',
      text:'There\'s a passage behind the old altar in the catacombs. Built before the cult learned the layout. It bypasses the main guarded corridor entirely. I\'m trusting you with this — don\'t make me regret it.',
      choices:[{ text:'I won\'t let you down.', next:null, effect:s=>{ s.flags.secretRoute=true; adjTrust(s,'guard',6); } }],
    },
  ],

  witch: [
    {
      id:'start', speaker:'Witch Moira', portrait:'npc-witch',
      text(s) {
        if (s.npcs.witch.pact) return '*She smiles with the calm of someone who knew you\'d return.* The Patron senses you approaching. Its appetite sharpens. Are you ready for what you\'ll find in the sanctum?';
        if (s.corruption>=50) return 'Mmm. The shadow clings to you beautifully. Come closer — I have a proposition that suits your... current state precisely.';
        if (!s.npcs.witch.met) return 'A visitor. How extraordinary. I am Moira — witch, not cultist, and possessor of information you desperately need. Before you tense: I am not your enemy.';
        return 'Back again. Good instinct — desperation and honesty make for my favourite clients.';
      },
      choices(s) {
        return [
          { text:'What do you know about the Patron?', next:'witch_patron' },
          { text:'[Corruption 50+] Tell me about the pact.', next:'witch_pact', requires:()=>s.corruption>=50&&!s.npcs.witch.pact },
          { text:'Can you repair my clothing?', next:'witch_repair', requires:()=>Object.values(s.clothing).some(c=>c.stripped||c.dur<100) },
          { text:'[Trust 40+] Teach me something about the corruption.', next:'witch_teach', requires:()=>s.npcs.witch.trust>=40 },
          { text:'I\'m leaving.', next:null, effect:st=>{ st.npcs.witch.met=true; } },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    {
      id:'witch_patron', speaker:'Witch Moira', portrait:'npc-witch',
      text:'Old. Older than this building. The Patron does not hate you — it has no room for hate beside the hunger. What it wants is a vessel: someone touched enough by its essence to carry its will without physical destruction. That is why the cultists spread corruption rather than simply killing. They\'re preparing candidates.',
      choices:[
        { text:'How do I stop it?', next:'witch_stop' },
        { text:'What is a vessel?', next:'witch_vessel' },
        { text:'What would happen if it got what it wanted?', next:'witch_vessel' },
      ],
    },
    {
      id:'witch_stop', speaker:'Witch Moira', portrait:'npc-witch',
      text:'Holy Water disrupts its physical anchor. Strong willpower — genuine, unconditional — can strike the seal\'s core and shatter it. You would need low corruption and high will. Or... *she trails off.*',
      choices:[
        { text:'Or what?', next:'witch_or', effect:s=>{ adjTrust(s,'witch',4); } },
        { text:'I\'ll prepare properly.', next:null, effect:s=>{ s.npcs.witch.met=true; adjTrust(s,'witch',5); } },
      ],
    },
    {
      id:'witch_or', speaker:'Witch Moira', portrait:'npc-witch',
      text:'Or you lean into the corruption rather than fighting it. Use it as a weapon. It requires a formal pact — I act as anchor and witness — and it costs willpower permanently. But you would wield the corruption rather than be wielded by it. Think carefully. It isn\'t reversible.',
      choices:[
        { text:'I\'ll consider it.', next:null, effect:s=>{ adjTrust(s,'witch',5); } },
        { text:'That sounds like a trap.', next:null, effect:s=>{ adjTrust(s,'witch',-3); } },
      ],
    },
    {
      id:'witch_vessel', speaker:'Witch Moira', portrait:'npc-witch',
      text:'The person ceases to exist as a coherent self and becomes an expression of the Patron\'s desire. Present in body. Entirely alien in mind. The cultists call it ascension. I call it the quietest kind of death — the kind where your body keeps walking around afterward.',
      choices:[
        { text:'I will not allow that.', next:null, effect:s=>{ s.npcs.witch.met=true; } },
        { text:'Unless the power makes it worthwhile.', next:null, effect:s=>{ s.corruption=Math.min(100,s.corruption+5); adjFaction(s,'cult',6); } },
      ],
    },
    {
      id:'witch_pact', speaker:'Witch Moira', portrait:'npc-witch',
      text:'You\'re already halfway there — the corruption in you can be shaped rather than simply spreading. My pact will permanently reduce your maximum willpower by 20. In return, corruption-based skills unlock at lower thresholds, and I\'ll teach you to redirect arousal into power rather than surrendering to it. Interested?',
      choices:[
        { text:'I accept the pact.', next:'witch_pact_seal' },
        { text:'The cost is too steep.', next:null, effect:s=>{ adjTrust(s,'witch',-2); } },
      ],
    },
    {
      id:'witch_pact_seal', speaker:'Witch Moira', portrait:'npc-witch',
      text:'*She traces a sigil on your palm — it burns cold for a moment, then settles.* Done. The corruption answers you now rather than simply consuming. What do you owe me? After the Patron is dealt with, bring me the sealing stone from the sanctum\'s heart. It has no power left against the Patron. For other purposes — invaluable. Good luck, apostate.',
      choices:[
        { text:'We have a deal.', next:null, effect:s=>{
          s.npcs.witch.pact=true; s.flags.witchPact=true;
          s.maxWil=Math.max(30,s.maxWil-20); s.wil=Math.min(s.maxWil,s.wil);
          adjTrust(s,'witch',20); adjFaction(s,'cult',10);
        }},
      ],
    },
    {
      id:'witch_repair', speaker:'Witch Moira', portrait:'npc-witch',
      text:'Clothing? The enchantments I weave are thorough — not just repaired, slightly reinforced. Twenty gold and I\'ll restore everything fully. Given what strips it down here, it\'s worth paying.',
      choices(s) {
        return [
          { text:`Pay 20g to repair all clothing  [${s.gold}g]`, requires:()=>s.gold>=20, next:null, effect:st=>{ st.gold-=20; repairCloth(st); } },
          { text:'I can\'t afford it right now.', next:null },
        ].filter(o=>!o.requires||o.requires());
      },
    },
    {
      id:'witch_teach', speaker:'Witch Moira', portrait:'npc-witch',
      text:'When arousal builds in battle, the instinct is to suppress it. That wastes the energy and leaves you vulnerable. Instead — use Focus. The mechanic is the same as willpower recovery, but you\'re redirecting the stimulation into clarity. The enemies use arousal as a weapon because most victims fight it. You don\'t have to.',
      choices:[{ text:'That\'s genuinely useful.', next:null, effect:s=>{ s.sensitivity=Math.max(0,s.sensitivity-10); adjTrust(s,'witch',6); } }],
    },
  ],
};

// ─── CORRIDOR EVENTS ─────────────────────────────────────────────────────────
export const CORRIDOR_EVENTS = [
  { chance:0.09, requires:s=>s.corruption>0,  text:'A voice hisses: "Let go…"',              effect:s=>{ s.corruption=Math.min(100,s.corruption+2); } },
  { chance:0.07, requires:()=>true,           text:'A faint warmth pulses from the stone.',   effect:s=>{ s.wil=Math.min(s.maxWil,s.wil+6); s.pressure=Math.max(0,s.pressure-5); } },
  { chance:0.11, requires:()=>true,           text:'Scattered coins glint on the floor.',     effect:s=>{ s.gold+=5+Math.floor(Math.random()*10); } },
  { chance:0.06, requires:s=>s.corruption>=40,text:'The corruption flares — a burning warmth you wish you didn\'t notice.', effect:s=>{ s.corruption=Math.min(100,s.corruption+3); s.sensitivity=Math.min(100,s.sensitivity+4); } },
  { chance:0.05, requires:s=>s.pressure>40,  text:'Your hands are shaking. Focus.',           effect:s=>{ s.pressure=Math.max(0,s.pressure-8); } },
];
