// ─── ENCOUNTER DEFINITIONS ───────────────────────────────────────────────────
export const ENCOUNTERS = {
  possessedGuard: {
    id: 'possessedGuard',
    label: 'Possessed Guard',
    spriteKey: 'enemy-guard',
    hp: 60,  maxHp: 60,
    atk: 12, def: 4,
    corruptionOnDefeat: 4,
    stripsOnDefeat: true,
    reward: { gold: 18, hp: 8, sta: 12, pressureDrop: 10 },
    intents: ['strike','strike','guard','heavyStrike','strike'],
    stripChance: 0.22,    // probability each turn of targeting clothing
    arousalAttack: false,
    bindAttack: false,
    lore: 'Once a faithful sentinel, now driven mad by dark influence.',
  },
  undeadMinion: {
    id: 'undeadMinion',
    label: 'Undead Minion',
    spriteKey: 'sk-idle',
    hp: 40,  maxHp: 40,
    atk: 9,  def: 2,
    corruptionOnDefeat: 2,
    stripsOnDefeat: false,
    reward: { gold: 10, hp: 5, sta: 8, pressureDrop: 8 },
    intents: ['strike','strike','strike','feint','guard'],
    stripChance: 0,
    arousalAttack: false,
    bindAttack: false,
    lore: 'A remnant of the sanctum\'s former defenders, bound by dark rites.',
  },
  cultistSeducer: {
    id: 'cultistSeducer',
    label: 'Cultist Seducer',
    spriteKey: 'enemy-cultist',
    hp: 50,  maxHp: 50,
    atk: 8,  def: 3,
    corruptionOnDefeat: 7,
    stripsOnDefeat: true,
    reward: { gold: 22, hp: 3, sta: 5, wil: 8, pressureDrop: 5, item: 'holyWater' },
    intents: ['arouse','arouse','strike','bind','arouse','heavyStrip'],
    stripChance: 0.35,
    arousalAttack: true,
    bindAttack: true,
    lore: 'An acolyte of the Veil who weaponises desire to subdue prey.',
  },
  shadowBeast: {
    id: 'shadowBeast',
    label: 'Shadow Beast',
    spriteKey: 'enemy-shadow',
    hp: 75,  maxHp: 75,
    atk: 16, def: 6,
    corruptionOnDefeat: 6,
    stripsOnDefeat: true,
    reward: { gold: 30, hp: 10, sta: 10, wil: 5, pressureDrop: 14 },
    intents: ['heavyStrike','heavyStrike','heavyStrip','arouse','guard'],
    stripChance: 0.45,
    arousalAttack: true,
    bindAttack: false,
    lore: 'A predator spawned from concentrated corruption — hunger made flesh.',
  },
  patronBoss: {
    id: 'patronBoss',
    label: 'The Patron',
    spriteKey: 'enemy-patron',
    hp: 180, maxHp: 180,
    atk: 20, def: 10,
    corruptionOnDefeat: 15,
    stripsOnDefeat: true,
    reward: { gold: 100, hp: 20, sta: 20, wil: 20, pressureDrop: 30, item: 'holyWater', corruptionDrop: 10 },
    intents: ['heavyStrike','arouse','heavyStrip','bind','voidPulse','heavyStrike','guard'],
    stripChance: 0.6,
    arousalAttack: true,
    bindAttack: true,
    lore: 'The architect of the sanctuary\'s corruption. It watches with ancient eyes.',
    isBoss: true,
  },
};

// ─── SKILL DEFINITIONS ───────────────────────────────────────────────────────
export const SKILLS = [
  {
    id: 'darkVeil',
    label: 'Dark Veil',
    minCorruption: 25,
    staCost: 12,
    desc: 'Wrap yourself in corruption energy. Reduce next damage by 80%.',
    effect: (state, battle) => {
      battle.playerVeilActive = true;
      return 'A veil of dark energy shrouds you — the next blow will glance.';
    },
  },
  {
    id: 'soulDrain',
    label: 'Soul Drain',
    minCorruption: 50,
    staCost: 20,
    desc: 'Drain life essence from the enemy. Steal 18 HP; they deal −25% next attack.',
    effect: (state, battle) => {
      const drain = 18;
      battle.enemy.hp = Math.max(0, battle.enemy.hp - drain);
      state.hp = Math.min(state.maxHp, state.hp + drain);
      battle.enemyWeakened = 2;
      return `Soul Drain steals ${drain} HP from ${battle.encounter.label}.`;
    },
  },
  {
    id: 'voidBurst',
    label: 'Void Burst',
    minCorruption: 75,
    staCost: 30,
    desc: 'Unleash raw corruption in an explosion. Massive damage but deepens your own corruption.',
    effect: (state, battle) => {
      const dmg = 45 + Math.floor(state.corruption / 4);
      battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg);
      state.corruption = Math.min(100, state.corruption + 8);
      return `Void Burst erupts for ${dmg} damage — but corruption grows deeper.`;
    },
  },
];

// ─── ITEMS ───────────────────────────────────────────────────────────────────
export const ITEMS = {
  healingPotion: {
    label: 'Healing Potion',
    desc: 'Restore 35 HP and 10 STA.',
    usableInBattle: true,
    effect: (state) => {
      state.hp  = Math.min(state.maxHp,  state.hp  + 35);
      state.sta = Math.min(state.maxSta, state.sta + 10);
      return 'Drank a Healing Potion. HP and STA restored.';
    },
  },
  flashFlask: {
    label: 'Flash Flask',
    desc: 'Stun all enemies for 1 turn and reduce arousal by 30.',
    usableInBattle: true,
    effect: (state, battle) => {
      if (battle) battle.enemyStunned = 1;
      state.arousal = Math.max(0, state.arousal - 30);
      return 'Flash Flask detonates — enemy stunned, arousal reduced.';
    },
  },
  holyWater: {
    label: 'Holy Water',
    desc: 'Reduce corruption by 10 and restore 12 WIL.',
    usableInBattle: false,
    effect: (state) => {
      state.corruption = Math.max(0, state.corruption - 10);
      state.wil = Math.min(state.maxWil, state.wil + 12);
      return 'Holy Water cleanses some corruption and bolsters willpower.';
    },
  },
};

// ─── DIALOGUE TREES ──────────────────────────────────────────────────────────
// Each node: { id, speaker, text, choices: [{ text, next, requires, effect }] }
// requires: (state) => bool
// effect: (state) => void

export const DIALOGUES = {

  elder: [
    {
      id: 'start',
      speaker: 'Elder Thane',
      portrait: 'npc-elder',
      text(state) {
        if (state.npcs.elder.stage === 0) return 'Ah... another soul drawn into the sanctum\'s shadow. I am Elder Thane, keeper of what little light remains here. Heed my warning — the corruption seeping through these halls will try to claim you too.';
        if (state.corruption >= 50)       return 'Child... you reek of it now. The corruption has taken root. I can still help you, but you must choose your path soon — before there is nothing left to save.';
        if (state.corruption >= 25)       return 'I see the shadow touching you, Verity. It is faint still. Resist. Use holy water when you can find it. The witch below knows remedies — though her price is always steep.';
        return 'Still holding on, I see. Good. The catacombs have grown more restless. Tread carefully and report back.';
      },
      choices(state) {
        const opts = [
          { text: 'What is this corruption you speak of?', next: 'elder_explain_corruption', requires: () => state.npcs.elder.stage === 0 },
          { text: 'I need supplies for the catacombs.', next: 'elder_supplies' },
          { text: 'Tell me about the Patron.', next: 'elder_patron', requires: () => state.questStage >= 1 },
          { text: '[Corruption 50+] I have questions about the Cult.', next: 'elder_cult_path', requires: () => state.corruption >= 50 },
          { text: 'Take care of yourself.', next: null, effect: s => { s.npcs.elder.met = true; } },
        ];
        return opts.filter(o => !o.requires || o.requires());
      },
    },
    {
      id: 'elder_explain_corruption',
      speaker: 'Elder Thane',
      portrait: 'npc-elder',
      text: 'Corruption is the sanctum\'s oldest curse. When the Patron was sealed here, its influence seeped into the stone — into everything. Defeat, despair, certain enemies... all can spread it. It erodes willpower and heightens... vulnerability. Keep your mind strong and your garments intact.',
      choices: [
        { text: 'How do I cleanse it?', next: 'elder_cleanse', effect: s => { s.npcs.elder.stage = Math.max(s.npcs.elder.stage, 1); } },
        { text: 'Understood. I\'ll be careful.', next: null },
      ],
    },
    {
      id: 'elder_cleanse',
      speaker: 'Elder Thane',
      portrait: 'npc-elder',
      text: 'Holy Water is the surest remedy — find it in chests or purchase it from the merchant. Victory over the cultists also dims their influence slightly. And rest — true rest in this hall — will slow its spread. Now go, but return when you need guidance.',
      choices: [
        { text: 'I will, Elder.', next: null, effect: s => { s.items.healingPotion = (s.items.healingPotion || 0) + 1; } },
      ],
    },
    {
      id: 'elder_supplies',
      speaker: 'Elder Thane',
      portrait: 'npc-elder',
      text: 'I have little to offer beyond words, but words have kept survivors alive before. The merchant has potions. The chest near the catacombs gate may have a flask. And guard your clothing — each layer stripped away leaves you more... susceptible to what lurks below.',
      choices: [
        { text: 'I understand. Thank you.', next: null, effect: s => { adjustTrustLocal(s, 'elder', 3); } },
      ],
    },
    {
      id: 'elder_patron',
      speaker: 'Elder Thane',
      portrait: 'npc-elder',
      text: 'The Patron is the source — a being of pure corruption sealed in the Inner Sanctum when this place still served the light. Something has been weakening the seal. If you reach it... you must choose. Destroy it with holy power, or... some have suggested it can be bargained with. I pray you make the right choice.',
      choices: [
        { text: 'Can I destroy it outright?', next: 'elder_patron_destroy' },
        { text: '[Trust 65+] What does bargaining with it entail?', next: 'elder_patron_bargain', requires: s => s.npcs.elder.trust >= 65 },
        { text: 'Thank you, Elder.', next: null },
      ],
    },
    {
      id: 'elder_patron_destroy',
      speaker: 'Elder Thane',
      portrait: 'npc-elder',
      text: 'Holy Water weakens it significantly. The witch knows a ritual as well — though I distrust her methods. Bring as much holy water as you can carry and your willpower must be strong. High corruption makes you... compatible... with the Patron. That is dangerous.',
      choices: [{ text: 'I\'ll prepare carefully.', next: null, effect: s => { s.flags.elderReveal = true; } }],
    },
    {
      id: 'elder_patron_bargain',
      speaker: 'Elder Thane',
      portrait: 'npc-elder',
      text: 'I should not speak of this... but if your corruption is already deep, the Patron may offer you power in exchange for becoming its vessel. Some call it apostate — I call it damnation. Yet I cannot stop you if you choose that path. Just know that every soul who accepted... never returned themselves.',
      choices: [
        { text: 'I won\'t let that happen.', next: null, effect: s => { adjustTrustLocal(s, 'elder', 5); } },
        { text: 'Power sounds appealing...', next: null, effect: s => { adjustTrustLocal(s, 'elder', -10); s.corruption = Math.min(100, s.corruption + 3); } },
      ],
    },
    {
      id: 'elder_cult_path',
      speaker: 'Elder Thane',
      portrait: 'npc-elder',
      text: 'You can feel the pull already, can\'t you. The cult offers acceptance — tells you the corruption is a gift, not a curse. *He looks at you with pain.* They are not entirely wrong about the power. But they serve the Patron entirely. Going to them means never coming back to who you were.',
      choices: [
        { text: 'I\'m not interested in the cult.', next: null, effect: s => { adjustTrustLocal(s, 'elder', 5); } },
        { text: 'What if I infiltrate them?', next: 'elder_cult_infiltrate' },
        { text: 'Maybe the cult isn\'t so wrong.', next: null, effect: s => { adjustTrustLocal(s, 'elder', -15); adjustFactionLocal(s, 'cult', 5); } },
      ],
    },
    {
      id: 'elder_cult_infiltrate',
      speaker: 'Elder Thane',
      portrait: 'npc-elder',
      text: 'A dangerous gambit. The cult\'s rites will increase your corruption further — even feigning initiation carries a cost. But information gained that way could be invaluable. If you try it... come back to me before you go too deep.',
      choices: [
        { text: 'I\'ll be careful.', next: null, effect: s => { adjustTrustLocal(s, 'elder', 5); s.flags.elderReveal = true; } },
      ],
    },
  ],

  merchant: [
    {
      id: 'start',
      speaker: 'Merchant Ida',
      portrait: 'npc-merchant',
      text(state) {
        if (!state.npcs.merchant.met) return 'Oh! A living soul. I\'d nearly given up hope of customers. I\'m Ida — survivor, trader, and currently very motivated to leave this place once I\'ve sold my wares.';
        if (state.npcs.merchant.suspicious) return '*She eyes your tattered clothing.* Back again. I won\'t pry about your state, but... please do buy something. I need the coin more than you need the questions.';
        return 'Welcome back. Still breathing — that\'s more than most manage down here.';
      },
      choices(state) {
        return [
          { text: 'What are you selling?', next: 'merchant_shop' },
          { text: 'How did you end up here?', next: 'merchant_story', requires: () => !state.npcs.merchant.met },
          { text: '[Corruption 50+] I need something stronger than potions.', next: 'merchant_dark_wares', requires: () => state.corruption >= 50 && !state.npcs.merchant.suspicious },
          { text: 'Stay safe, Ida.', next: null, effect: s => { s.npcs.merchant.met = true; } },
        ].filter(o => !o.requires || o.requires());
      },
    },
    {
      id: 'merchant_story',
      speaker: 'Merchant Ida',
      portrait: 'npc-merchant',
      text: 'Caravan got turned around in the fog three nights ago. By the time I realised we\'d crossed into corrupted territory... it was just me left. The others... *she stops.* Well. I found this hall and it seemed safe enough. Elder Thane confirmed the sanctuary wards still hold. So here I am. Selling hope by the flask.',
      choices: [
        { text: 'I\'m sorry about your people.', next: null, effect: s => { s.npcs.merchant.met = true; adjustTrustLocal(s, 'merchant', 8); } },
        { text: 'I\'ll keep this area clear.', next: null, effect: s => { s.npcs.merchant.met = true; adjustTrustLocal(s, 'merchant', 5); } },
      ],
    },
    {
      id: 'merchant_shop',
      speaker: 'Merchant Ida',
      portrait: 'npc-merchant',
      text: 'Healing Potions — 15 gold each. Flash Flasks — 20 gold. Holy Water — 30 gold but I only have one left. What\'ll it be?',
      choices(state) {
        return [
          { text: `Buy Healing Potion (15g) [Have: ${state.gold}g]`, next: null, requires: () => state.gold >= 15, effect: s => { s.gold -= 15; s.items.healingPotion = (s.items.healingPotion||0)+1; } },
          { text: `Buy Flash Flask (20g)`, next: null, requires: () => state.gold >= 20, effect: s => { s.gold -= 20; s.items.flashFlask = (s.items.flashFlask||0)+1; } },
          { text: `Buy Holy Water (30g)`, next: null, requires: () => state.gold >= 30 && !state.flags.boughtHolyWater, effect: s => { s.gold -= 30; s.items.holyWater = (s.items.holyWater||0)+1; s.flags.boughtHolyWater = true; } },
          { text: 'Nothing right now.', next: null },
        ].filter(o => !o.requires || o.requires());
      },
    },
    {
      id: 'merchant_dark_wares',
      speaker: 'Merchant Ida',
      portrait: 'npc-merchant',
      text: '*She glances around nervously.* I... I do have one thing. Came off a cultist who attacked me. Some kind of vial that smells wrong but makes you stronger. I don\'t want it. Take it for free — just don\'t tell me what it does.',
      choices: [
        { text: 'Take the vial.', next: null, effect: s => { s.items.holyWater = (s.items.holyWater||0)+1; s.npcs.merchant.suspicious = true; adjustTrustLocal(s, 'merchant', -5); } },
        { text: 'I\'d rather not.', next: null, effect: s => { adjustTrustLocal(s, 'merchant', 5); } },
      ],
    },
  ],

  guard: [
    {
      id: 'start',
      speaker: 'Captain Serrin',
      portrait: 'npc-guard',
      text(state) {
        if (state.npcs.guard.hostile) return '*The captain\'s hand rests on his sword hilt.* We have nothing to discuss. Leave my sight.';
        if (!state.npcs.guard.met)    return 'Halt. I am Captain Serrin, what remains of the Order\'s garrison here. The catacombs are under restricted access. State your purpose.';
        if (state.npcs.guard.bribed)  return '*He nods curtly.* The passage is open. Don\'t make me regret my... pragmatism.';
        if (state.corruption >= 50)   return '*He eyes you with suspicion.* Something is wrong with you. I can see it. If you\'ve been touched by corruption, the deeper passage will only make it worse.';
        return 'Back again. What do you need, soldier?';
      },
      choices(state) {
        return [
          { text: 'I need passage to the catacombs.', next: 'guard_passage', requires: () => !state.npcs.guard.hostile },
          { text: 'What happened to the Order here?', next: 'guard_order', requires: () => !state.npcs.guard.met },
          { text: '[30 gold] I can make it worth your while.', next: 'guard_bribe', requires: () => state.gold >= 30 && !state.npcs.guard.bribed && !state.npcs.guard.hostile },
          { text: '[Trust 70+] Tell me about the hidden route.', next: 'guard_secret', requires: () => state.npcs.guard.trust >= 70 },
          { text: 'Never mind.', next: null, effect: s => { s.npcs.guard.met = true; } },
        ].filter(o => !o.requires || o.requires());
      },
    },
    {
      id: 'guard_passage',
      speaker: 'Captain Serrin',
      portrait: 'npc-guard',
      text: 'The catacombs are not safe. Half my men are... what guards down there now. *He pauses.* But someone needs to go. The Elder vouches for you, so I\'ll allow it — but if you come back compromised, I will not hesitate.',
      choices: [
        { text: 'I understand the risks.', next: null, effect: s => { s.npcs.guard.met = true; s.flags.dungeon1Open = true; adjustTrustLocal(s, 'guard', 5); } },
        { text: 'What do you mean by "compromised"?', next: 'guard_compromised' },
      ],
    },
    {
      id: 'guard_compromised',
      speaker: 'Captain Serrin',
      portrait: 'npc-guard',
      text: 'Corrupted. Turned. I\'ve watched it happen to good soldiers. It starts as fatigue, weakness. Then the choices start changing. If you feel the pull toward darkness — come back immediately. Don\'t push deeper.',
      choices: [
        { text: 'I\'ll watch for the signs.', next: null, effect: s => { adjustTrustLocal(s, 'guard', 8); } },
      ],
    },
    {
      id: 'guard_order',
      speaker: 'Captain Serrin',
      portrait: 'npc-guard',
      text: 'We were thirty. The Patron\'s influence spreads faster than anyone anticipated. Some fled. Some... fell to it. Four of us remain in this hall. I keep watch. I keep the wards charged. I keep hoping someone will come with a real solution.',
      choices: [
        { text: 'I\'m going to end this.', next: null, effect: s => { s.npcs.guard.met = true; adjustTrustLocal(s, 'guard', 10); adjustFactionLocal(s, 'order', 5); } },
        { text: 'I\'ll do what I can.', next: null, effect: s => { s.npcs.guard.met = true; } },
      ],
    },
    {
      id: 'guard_bribe',
      speaker: 'Captain Serrin',
      portrait: 'npc-guard',
      text: '*He stares at the coin for a long moment.* I... yes. That will cover our supply shortage. The inner gate is open. I saw nothing. *He pockets the gold with a look of self-loathing.*',
      choices: [
        { text: 'The Order doesn\'t need to know.', next: null, effect: s => { s.gold -= 30; s.npcs.guard.bribed = true; adjustTrustLocal(s, 'guard', -5); adjustFactionLocal(s, 'order', -8); s.flags.sanctumOpen = true; } },
      ],
    },
    {
      id: 'guard_secret',
      speaker: 'Captain Serrin',
      portrait: 'npc-guard',
      text: 'There\'s a passage behind the old altar in the catacombs — the cultists don\'t know about it. Leads directly to the sanctum\'s antechamber. If you\'re going after the Patron, it\'s safer than the main path. I\'m trusting you with this.',
      choices: [
        { text: 'I won\'t let you down.', next: null, effect: s => { s.flags.secretRoute = true; adjustTrustLocal(s, 'guard', 5); } },
      ],
    },
  ],

  witch: [
    {
      id: 'start',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text(state) {
        if (state.npcs.witch.pact) return '*She smiles like she expected you.* Still walking your own path... for now. The Patron senses your approach. Its hunger grows. Are you ready for what awaits?';
        if (state.corruption >= 50)  return 'Mmm. The shadow clings to you like perfume. Interesting. Come closer — I have a proposition that should appeal to someone of your... condition.';
        if (!state.npcs.witch.met)   return 'Oh, a visitor. How delightful. I had begun to think the sanctum had consumed everyone. I am Moira. And before you ask — yes, I am a witch, no, I am not with the cult, and yes, I know things you need to know.';
        return 'Back again. Good. Desperation makes for honest customers.';
      },
      choices(state) {
        return [
          { text: 'What do you know about the Patron?', next: 'witch_patron' },
          { text: '[Corruption 50+] Tell me about the pact.', next: 'witch_pact_offer', requires: () => state.corruption >= 50 && !state.npcs.witch.pact },
          { text: 'Can you repair my clothing?', next: 'witch_repair', requires: () => Object.values(state.clothing).some(c => c.stripped || c.dur < 100) },
          { text: 'Teach me something about corruption.', next: 'witch_teach', requires: () => state.npcs.witch.trust >= 40 },
          { text: 'I\'m leaving.', next: null, effect: s => { s.npcs.witch.met = true; } },
        ].filter(o => !o.requires || o.requires());
      },
    },
    {
      id: 'witch_patron',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text: 'The Patron is old — older than this building, older than the Order that imprisoned it. It does not hate you. It does not love you. It simply... wants. And what it wants is a vessel — someone already touched enough by its essence to carry its will forward. That\'s why it sends the cultists to spread corruption rather than simply kill.',
      choices: [
        { text: 'How do I stop it?', next: 'witch_stop' },
        { text: 'What happens if someone becomes its vessel?', next: 'witch_vessel' },
      ],
    },
    {
      id: 'witch_stop',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text: 'Holy Water weakens its form. Willpower — real, iron willpower — disrupts its influence. And if you can get it to manifest fully, a focused burst of pure intent can shatter the seal from within. But you\'ll need high willpower and low corruption to survive that confrontation. Or...',
      choices: [
        { text: 'Or what?', next: 'witch_pact_hint' },
        { text: 'Understood. I\'ll prepare.', next: null, effect: s => { s.npcs.witch.met = true; adjustTrustLocal(s, 'witch', 5); } },
      ],
    },
    {
      id: 'witch_pact_hint',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text: '*She tilts her head.* Or you let it in — just enough. Use the corruption as a weapon rather than fighting it. It\'s dangerous, requires a formal pact with me as witness, and costs willpower permanently... but it would give you powers most people can only dream of. Think on it.',
      choices: [
        { text: 'I\'ll think about it.', next: null, effect: s => { adjustTrustLocal(s, 'witch', 5); } },
        { text: 'That sounds like a terrible idea.', next: null, effect: s => { adjustTrustLocal(s, 'witch', -3); } },
      ],
    },
    {
      id: 'witch_vessel',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text: 'They cease to exist as a person and become an expression of the Patron\'s will. Physically present, but... entirely Other. The cultists call it ascension. The Order calls it damnation. I call it a waste of a perfectly interesting individual.',
      choices: [
        { text: 'I won\'t let that happen.', next: null, effect: s => { s.npcs.witch.met = true; } },
        { text: 'Unless the power is worth it?', next: null, effect: s => { s.corruption = Math.min(100, s.corruption + 4); adjustFactionLocal(s, 'cult', 5); } },
      ],
    },
    {
      id: 'witch_pact_offer',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text: 'You\'re already halfway there — the corruption in you can be shaped into something useful rather than something that simply consumes. My pact will permanently reduce your max willpower by 20, but in return you\'ll access dark skills the corruption unlocks, and I\'ll teach you to use them without losing yourself. Mostly.',
      choices: [
        { text: 'I accept the pact.', next: 'witch_pact_accept' },
        { text: 'The cost is too high.', next: null, effect: s => { adjustTrustLocal(s, 'witch', -2); } },
      ],
    },
    {
      id: 'witch_pact_accept',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text: '*She traces a sigil on your palm.* Done. You\'ll feel the difference immediately — the corruption answers you now rather than simply spreading. Use it wisely. Come to me when you\'re ready to face the Patron.',
      choices: [
        { text: 'What do I owe you?', next: 'witch_debt' },
      ],
    },
    {
      id: 'witch_debt',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text: '*She smiles.* After the Patron is dealt with, I want the sealing stone from the sanctum\'s heart. It has no power left to contain the Patron — but for other purposes, it\'s invaluable. That\'s all. Good luck, apostate.',
      choices: [
        {
          text: 'Agreed.',
          next: null,
          effect: s => {
            s.npcs.witch.pact = true;
            s.flags.witchPact = true;
            s.maxWil = Math.max(30, s.maxWil - 20);
            s.wil = Math.min(s.maxWil, s.wil);
            adjustTrustLocal(s, 'witch', 20);
            adjustFactionLocal(s, 'cult', 10);
          },
        },
      ],
    },
    {
      id: 'witch_repair',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text: 'Clothing? Oh, I can mend that. The enchantments I use are... thorough. Twenty gold and I\'ll restore everything to full. It\'s worth it — your protection matters more than you realise down there.',
      choices(state) {
        return [
          { text: `Pay 20 gold to repair all clothing [Have: ${state.gold}g]`, next: null, requires: () => state.gold >= 20, effect: s => { s.gold -= 20; repairLocal(s); } },
          { text: 'I can\'t afford it right now.', next: null },
        ].filter(o => !o.requires || o.requires());
      },
    },
    {
      id: 'witch_teach',
      speaker: 'Witch Moira',
      portrait: 'npc-witch',
      text: 'The corruption makes you feel things more intensely — the trick is not to suppress it but to redirect the energy. When arousal builds in battle, channel it into focus rather than fighting it. The enemies use it as a weapon because most victims surrender to it. You don\'t have to.',
      choices: [
        { text: 'Useful to know. Thank you.', next: null, effect: s => { s.sensitivity = Math.max(0, s.sensitivity - 8); adjustTrustLocal(s, 'witch', 5); } },
      ],
    },
  ],
};

// ─── LOCAL HELPER STUBS (used inside dialogue closures) ──────────────────────
function adjustTrustLocal(state, key, delta) {
  if (!state.npcs[key]) return;
  state.npcs[key].trust = Math.max(0, Math.min(100, (state.npcs[key].trust || 50) + delta));
}
function adjustFactionLocal(state, key, delta) {
  if (state.factions[key] === undefined) return;
  state.factions[key] = Math.max(0, Math.min(100, state.factions[key] + delta));
}
function repairLocal(state) {
  for (const slot of ['outer','upper','lower','inner','shoes']) {
    state.clothing[slot].stripped = false;
    state.clothing[slot].dur = state.clothing[slot].max;
  }
}

// ─── RANDOM CORRIDOR EVENTS ──────────────────────────────────────────────────
export const CORRIDOR_EVENTS = [
  {
    id: 'shadowy_whisper',
    chance: 0.08,
    requires: s => s.corruption > 0,
    text: 'A voice hisses from the dark: "Let go..."',
    effect: s => { s.corruption = Math.min(100, s.corruption + 2); },
  },
  {
    id: 'faint_light',
    chance: 0.06,
    requires: () => true,
    text: 'A soft light pulses from a crack in the wall, warming you briefly.',
    effect: s => { s.wil = Math.min(s.maxWil, s.wil + 6); s.pressure = Math.max(0, s.pressure - 5); },
  },
  {
    id: 'found_coin',
    chance: 0.1,
    requires: () => true,
    text: 'You find a few coins scattered on the floor.',
    effect: s => { s.gold += 5 + Math.floor(Math.random() * 10); },
  },
  {
    id: 'corruption_surge',
    chance: 0.07,
    requires: s => s.corruption >= 40,
    text: 'The corruption within you flares — a pleasurable burn that you wish you didn\'t find... interesting.',
    effect: s => { s.corruption = Math.min(100, s.corruption + 3); s.sensitivity = Math.min(100, s.sensitivity + 4); },
  },
];
