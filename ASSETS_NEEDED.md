# External Assets — Download Guide

The game runs fully without these. Download any you want and place at the paths below, then the game auto-loads them.

## HOW TO ADD AN ASSET
1. Download the sprite sheet from itch.io
2. Extract and rename the **idle frame** to `idle.png` (or whichever frame the game references)
3. Place in the path listed below
4. Open the game — it will load automatically

---

## 🗺 BACKGROUNDS (Parallax)

| Asset | URL | Place at |
|-------|-----|----------|
| Forest | https://frostwindz.itch.io/hand-painted-parallax-background-whitewood-vale | `assets/backgrounds/forest/bg.png` |
| Dead Forest | https://frostwindz.itch.io/hand-painted-parallax-background-gloomwood-forest | `assets/backgrounds/dead-forest/bg.png` |
| Dark Cave | https://admurin.itch.io/parallax-backgrounds-caves | `assets/backgrounds/cave/bg.png` |
| Cold Corridors | https://ansimuz.itch.io/gothicvania-cold-corridors | `assets/backgrounds/corridor/bg.png` |

> The game uses `assets/backgrounds/corridor/bg.png` as the battle scene background first. If missing, a procedural dungeon is drawn instead.

---

## 👹 ENEMY SPRITES

Place each pack's **idle/standing frame** at the path shown. The game loads them as static images (full animation integration is a planned extension).

| Enemy | URL | Place at |
|-------|-----|----------|
| Boss Minotaur | https://chierit.itch.io/boss-minotaur | `assets/enemies/minotaur/idle.png` |
| Dark Enemies Pack | https://williamqm.itch.io/dark-enemies-pack | `assets/enemies/dark/idle.png` |
| Free Minotaur | https://free-game-assets.itch.io/free-minotaur-sprite-sheet-pixel-art-pack | `assets/enemies/minotaur2/idle.png` |
| Goblin Warrior | https://hsdsz.itch.io/goblin-warrior-1-pixelated-free-ver | `assets/enemies/goblin/idle.png` |
| Goblin Blade | https://hsdsz.itch.io/goblin-blade-pixelated-free-ver | `assets/enemies/goblin-blade/idle.png` |
| Goblin Giant | https://hsdsz.itch.io/goblin-giant-pixelated-free-ver | `assets/enemies/goblin-giant/idle.png` |
| Goblin Boss | https://hsdsz.itch.io/goblin-boss-free-ver | `assets/enemies/goblin-boss/idle.png` |
| Gorgon | https://free-game-assets.itch.io/free-gorgon-pixel-art-character-sprite-sheets | `assets/enemies/gorgon/idle.png` |
| Satyr | https://free-game-assets.itch.io/free-satyr-sprite-sheet-pixel-art-pack | `assets/enemies/satyr/idle.png` |
| Vampire | https://free-game-assets.itch.io/free-vampire-pixel-art-sprite-sheets | `assets/enemies/vampire/idle.png` |
| Mutated Cultist | https://catalone.itch.io/mutated-cultist | `assets/enemies/cultist/idle.png` |
| Demon Girl | https://yhukimhuri.itch.io/anime-demon-girl | `assets/enemies/demon/idle.png` |
| Golem (Boss) | https://admurin.itch.io/bosses-gollux | `assets/enemies/golem/idle.png` |
| Knight (Soulslike) | https://szadiart.itch.io/2d-soulslike-character | `assets/enemies/knight/idle.png` |
| Knight (Fantasy) | https://free-game-assets.itch.io/free-fantasy-knight | `assets/enemies/knight2/idle.png` |
| Knight (2H Shield) | https://bongseng.itch.io/knight-2h-shield-character | `assets/enemies/knight3/idle.png` |
| Knight (Semi-Real) | https://bongseng.itch.io/knight-character-semi-realist | `assets/enemies/knight4/idle.png` |
| Wizard | https://free-game-assets.itch.io/free-wizard-sprite-sheets-pixel-art | `assets/enemies/wizard/idle.png` |

---

## 🧑 NPC SPRITES

| NPC | URL | Place at |
|-----|-----|----------|
| Shop Merchant | https://free-game-assets.itch.io/free-city-trader-character-sprite-sheets-pixel-art | `assets/npcs/merchant/idle.png` |
| Homeless NPC | https://free-game-assets.itch.io/free-homeless-character-sprite-sheets-pixel-art | `assets/npcs/homeless/idle.png` |
| Schoolgirl NPC | https://free-game-assets.itch.io/free-schoolgirls-anime-character-pixel-sprite-pack | `assets/npcs/schoolgirl/idle.png` |

---

## 🎮 TO WIRE UP A NEW ENEMY IN CODE

After placing the asset, open `src/data.js` and in the relevant encounter add:

```js
// Example: add Goblin as a new encounter
goblinWarrior: {
  id: 'goblinWarrior',
  label: 'Goblin Warrior',
  spriteKey: 'enemy-goblin',   // ← matches the key registered in loading.js
  useSkeleton: false,
  spriteFamily: 'goblin',      // ← used to look up the external texture
  hp: 40, maxHp: 40,
  atk: 11, def: 3,
  ...
}
```

Then in `src/loading.js`, the line:
```js
{ key:'enemy-goblin', url:'assets/enemies/goblin/idle.png' },
```
is already present — the game will load it automatically when the file exists.

---

## 📁 FULL EXPECTED DIRECTORY STRUCTURE

```
assets/
  ruin_runners_shaia/          ← INCLUDED (from original RPG)
    sprites/
      shaia/
      skeleton/
      background/
      prop/
  backgrounds/                 ← YOU ADD (download from itch.io)
    cave/bg.png
    corridor/bg.png
    forest/bg.png
    dead-forest/bg.png
  enemies/                     ← YOU ADD (download from itch.io)
    minotaur/idle.png
    goblin/idle.png
    gorgon/idle.png
    satyr/idle.png
    vampire/idle.png
    cultist/idle.png
    demon/idle.png
    golem/idle.png
    knight/idle.png
    wizard/idle.png
  npcs/                        ← YOU ADD (download from itch.io)
    merchant/idle.png
    homeless/idle.png
    schoolgirl/idle.png
```

All external paths silently fail if the file isn't there — the game falls back to procedurally generated textures.
