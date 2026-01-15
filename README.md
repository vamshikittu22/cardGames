# 🎴 Tales of Dharma: Chapter I

**Tales of Dharma** is a high-fidelity, strategic card game platform rooted in the epic narratives of Indian Mythology. It merges the complex moral and martial dilemmas of ancient epics with a clean, high-contrast **Swiss Design** aesthetic.

---

## 🏛️ Case Study: The "Swiss-Myth" Aesthetic

### The Challenge
Most mythological games lean heavily into ornate, "aged" aesthetics—parchment textures, gold filigree, and complex illustrations. While thematic, this often sacrifices **legibility** and **modern UX standards** in complex strategy games.

### The Vision
We pioneered the **"Swiss-Myth"** design language. By stripping away the clutter and focusing on bold typography (**Space Grotesk**), geometric iconography, and a disciplined grid system, we allow the strategic depth of the game to shine. 

### Design Choices
- **Dark Mode by Default**: Represents the "Cosmic Void" or *Sunyata* from which all manifestations emerge.
- **Vibrant Coding**: Each card type (Major, Astra, Curse) is assigned a high-contrast neon hue (Teal, Gold, Crimson) for instant visual recognition.
- **Mandala Motion**: An interactive, SVG-animated Mandala serves as the lobby's heartbeat, representing the cyclic nature of time (*Kaala*).

---

## 🎯 Gameplay Objective

In *Tales of Dharma*, you are a divine architect guiding warriors through the cycles of fate. Your goal is to reach one of two victory conditions:

1. **The Path of Power (Assura Capture)**: Be the first to capture **3 Assuras** from the central realm.
2. **The Path of Wisdom (Class Mastery)**: (Phase 2) Complete a full set of unique warrior classes within your Sena.

---

## 🕹️ Core Mechanics

### 🌀 Karma Points (KP)
Karma is your primary resource. Every cycle (turn), you are granted **3 KP**. 
- **1 KP**: Draw a card, manifest a Major, or play an Astra/Curse/Maya.
- **2 KP**: Attempt to capture a central Assura.

### ⚔️ The Battlefield
- **Sena (Army)**: Your active frontline. Only Majors in the Sena can attempt to capture Assuras.
- **The Central Realm**: Where the Assuras (Ravana, Mahishasura, etc.) reside, awaiting challenge.
- **The Jail**: Where captured Assuras are held as trophies of victory.

### 🃏 Card Classifications
- **Major**: Your warriors (e.g., Arjuna, Karna). They possess power ranges and unique class symbols.
- **Astra**: Divine weapons. Attach them to your Majors to boost capture rolls or add protection.
- **Curse**: Blights to cast upon enemy Majors to reduce their effectiveness.
- **Maya**: Reality-warping cards that can swap positions, steal Karma, or peek into the future.
- **Generals**: Passive commanders (e.g., Krishna, Shakuni) that provide permanent buffs as long as they are in your hand or Sena.

### 🎲 Invoking Divine Will
Capturing an Assura is not guaranteed. It requires a **2d6 roll**. Each Assura has a:
- **Capture Range**: Usually 9-12.
- **Retaliation Range**: If you roll low, the Assura strikes back, potentially sending your Major to the Submerge Pile.
- **Safe Zone**: A middle ground where nothing happens, but your KP is spent.

---

## 🛠️ Technology Stack

The platform is built with a cutting-edge frontend architecture designed for low-latency, "backend-less" multiplayer synchronization.

- **React 19**: Utilizing the latest concurrent rendering features for ultra-smooth UI transitions.
- **Tailwind CSS**: Custom configuration for the "Swiss-Myth" color palette and glassmorphism effects.
- **BroadcastChannel API**: A robust "Socket Bridge" that allows real-time state synchronization across multiple browser tabs without requiring a dedicated WebSocket server for local play.
- **TypeScript**: Strict typing for complex game state objects (Rooms, Players, Card Effects).
- **Vite/ESM**: Modern module loading for rapid development and optimized builds.

---

## 🚀 Future Phases
- **Phase 2**: Full "Class Mastery" logic and advanced General abilities.
- **Phase 3**: "The Great War" - 2v2 Team formats.
- **Phase 4**: AI Personalities based on mythological traits (The Aggressive Duryodhana, The Strategic Yudhisthira).

---
*Built for the Divine Cycle • Tales of Dharma © 2025*