# Veiled Apostasy v2.0

> A dark fantasy RPG blending *Apostate Verity*'s atmosphere with *Unholy Maiden*'s corruption mechanics.
> Built with Phaser 3, deployable to GitHub Pages with zero server dependencies.

---

## Quickstart

### GitHub Pages
1. Create a new repository
2. Upload this entire folder
3. Settings → Pages → Source: `main` branch, root `/`
4. Visit `https://yourusername.github.io/repo-name/`

### Local Dev (requires a web server — ES modules don't run from `file://`)
```bash
# Python
python3 -m http.server 8080

# Node
npx serve .

# VS Code: install "Live Server" extension, click "Go Live"
```

---

## Controls

### Keyboard
| Key | Action |
|-----|--------|
| `A` / `←` | Move left |
| `D` / `→` | Move right |
| `W` / `Space` / `↑` | Jump |
| `E` / `Enter` | Interact / Confirm |
| `I` | Open Inventory |
| `ESC` | Settings |
| `↑` `↓` | Navigate menus |
| `1`–`7` | Battle actions |
| `Enter` / `Space` | Confirm focused button |

### Touch (Mobile)
- **D-pad** bottom-left: `◀` `▶` `▲` for movement and jump
- **Action buttons** bottom-right: `E/INT` to interact, `I/INV` for inventory
- **All menus**: tap any button directly — no mouse required
- **Battle**: tap action buttons or use the on-screen grid

---

## Game Systems

### Corruption (0–100)
| Tier | Range | Effects |
|------|-------|---------|
| Pure | 0–24 | No corruption skills; NPCs treat you normally |
| Tainted | 25–49 | Dark Veil unlocked; NPCs grow wary |
| Defiled | 50–74 | Soul Drain unlocked; some NPCs hostile; new dialogue paths |
| Consumed | 75–100 | Void Burst unlocked; dramatic NPC reactions; cult invites |

### Clothing Layers (5 slots)
Each layer has **durability** (0–100%). At 0% the layer is **stripped**:
- `Outer Cloak` — Stripped: −5 max HP permanently
- `Upper Vest` — Stripped: −5 max STA permanently  
- `Lower Skirt` — Stripped: −5 max WIL permanently
- `Inner Bind` — Stripped: **+18 Sensitivity**, +14 Pressure (most consequential)
- `Foot Treads` — Stripped by special attacks only

Repair at **Witch Moira** (20g) or from the **Inventory** screen.

### H-Bound State
When **Arousal hits 100** in battle:
- Normal Attack is replaced by **Struggle** (chance to break free)
- Heavy Strike is disabled
- Use **Flash Flask** to instantly break the binding and stun the enemy
- Use **Focus** to redirect arousal into willpower (reduces arousal by 12)

### Battle Actions
| # | Action | Notes |
|---|--------|-------|
| 1 | Attack / Struggle | Struggle when H-Bound |
| 2 | Heavy Strike | +50% damage, costs 14 STA; disabled when H-Bound |
| 3 | Guard | Halve incoming damage; +10 STA; +4 WIL |
| 4 | Focus | +24 power bonus; +14 STA; −12 Arousal |
| 5 | Corruption Skill | Dark Veil (25+), Soul Drain (50+), Void Burst (75+) |
| 6 | Item | Healing Potion, Flash Flask, or Holy Water |
| 7 | Flee | 38–66% success; failure costs 8 Pressure + enemy attack |

### NPCs & Permanent Flags
- **Elder Thane** — Quest giver; trust unlocks hidden lore; corruption ≥50 opens cult-path dialogue
- **Merchant Ida** — Sells potions; corruption ≥50 offers dark wares; trust from compassionate choices
- **Captain Serrin** — Controls catacombs access; trust ≥68 reveals secret route; bribable for 30g
- **Witch Moira** — Pact: −20 max WIL permanently, unlocks deeper corruption skill interaction
  
All NPC states, trust values, and story flags persist across sessions via `localStorage`.

### Defeat Consequences (never a simple Game Over)
- Max STA permanently −6
- Max WIL permanently −4
- Corruption +5 (or enemy-specific amount)
- Pressure +25
- Clothing strip if enemy has `stripsOnDefeat:true`
- Respawn at Sanctuary Hall entrance

---

## Adding New Assets

See `ASSETS_NEEDED.md` for full download links and placement paths.
All external assets are optional — the game uses procedural textures as fallback.

---

## File Structure

```
veiled-apostasy/
├── index.html              Entry point (GitHub Pages compatible)
├── ASSETS_NEEDED.md        Download guide for itch.io sprites
├── src/
│   ├── game.js             Phaser config + scene registry
│   ├── util.js             State engine, FramePlayer, KbdFocus, FRAMES manifest
│   ├── data.js             Encounters, skills, items, full dialogue trees
│   ├── loading.js          Asset preload + procedural texture generation
│   ├── title.js            Title screen with keyboard navigation
│   ├── world.js            Side-scrolling exploration (3 zones)
│   ├── battle.js           AV-style cinematic turn-based combat
│   ├── dialogue.js         Branching NPC conversations (keyboard + touch)
│   ├── status.js           Full character sheet
│   ├── inventory.js        Item use + clothing repair
│   └── settings.js         Toggles + save management
└── assets/
    └── ruin_runners_shaia/ Included sprite pack (Shaia + Skeleton)
```

---

## Credits

- Character sprites: [Ruin Runners Shaia](https://github.com/ruin-runners) (CC-BY 4.0)
- Engine: [Phaser 3](https://phaser.io/) (MIT)
- Inspired by: *Apostate Verity* (visual style), *Unholy Maiden* (mechanics)

*Contains mature themes for adult audiences.*
