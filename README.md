# Veiled Apostasy

A dark fantasy RPG built with Phaser 3, blending mechanics from *Apostate Verity* and *Unholy Maiden*.

## Features

- **5-layer clothing strip system** tracked per slot (Outer → Inner) with permanent vulnerability consequences
- **Corruption tier system** (Pure → Tainted → Defiled → Consumed) altering dialogue, combat options, and NPC reactions
- **Sensitivity & Arousal mechanics** — H-Bound state when Arousal maxes, limiting actions to Struggle or Flash Flask
- **Branching dialogue trees** with 4 NPCs (Elder Thane, Merchant Ida, Captain Serrin, Witch Moira) — permanent state flags, trust system, corruption-gated choices
- **Corruption-gated skills** — Dark Veil (25+), Soul Drain (50+), Void Burst (75+)
- **5 enemy types** with unique intent patterns: Possessed Guard, Undead Minion, Cultist Seducer, Shadow Beast, Patron (Boss)
- **Consequential battle outcomes** — defeat permanently reduces max STA/WIL, increases Pressure, may strip clothing
- **3 world zones** — Sanctuary Hall, Catacombs, Inner Sanctum with door/faction gating

## Controls

| Key | Action |
|-----|--------|
| A/D or ◀/▶ | Move |
| W/Space | Jump |
| E/Enter | Interact |
| I | Inventory |
| ESC | Settings |
| 1–6 | Battle actions |

## Deployment (GitHub Pages)

1. Create a repository and push this entire folder
2. Enable GitHub Pages in repo Settings → Pages → Source: `main` branch, root `/`
3. Visit `https://<username>.github.io/<repo>/`

## Asset Credits

Character sprites: [Ruin Runners Shaia](https://github.com/your/attribution) (CC BY 4.0)
Enemy textures: Procedurally generated at runtime
Engine: [Phaser 3](https://phaser.io/) (MIT License)

## Savefile

Game state is saved to `localStorage` under key `veiled_apostasy_v1`. Clear from Settings → Clear Save.

---

*Contains mature themes: corruption, psychological horror, body horror, adult content (non-explicit). For adult audiences.*
