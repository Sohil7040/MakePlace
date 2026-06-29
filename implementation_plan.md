# MakePlace Platform Expansion: Master Plan

Adding all of these incredible features (3D Viewers, Skill Trees, Social Feeds, multiplayer, and AI tools) is a massive undertaking that will completely transform the platform. 

To ensure we **do not break the current, working platform**, we absolutely must build this in iterative phases. If we try to implement a 3D engine, a social network, and a multiplayer WebSocket backend all at the same time, the app will become unstable.

Here is the strategic rollout plan. I strongly recommend we start by executing **Phase 1** today.

## User Review Required
> [!WARNING]
> Please confirm that you approve of this phased approach and are ready for me to begin executing **Phase 1** ONLY right now.

---

## Phase 1: Customization, Export & AI Fun (Starting Now)
These features provide immediate, high-impact value to students without requiring massive database restructuring that could break existing features.

### 1. Personalized Portfolios & HTML/PDF Export
- **Database:** Add a `theme` field to the `Portfolio` schema (default: "minimalist").
- **UI:** Add a Theme Selector to the Portfolio Builder page.
- **Export:** Build a `/api/students/:id/portfolio/export` endpoint that generates a standalone, styled HTML file. Students can use their browser's native "Print to PDF" on this file for college apps.

### 2. "Scrap-Yard" Idea Generator (AI)
- **Backend:** Create a new Gemini API endpoint tailored for brainstorming.
- **UI:** Add a fun "Scrap-Yard" widget to the student dashboard where they can type in loose parts they own (e.g., "cardboard, 1 servo, arduino") and instantly get 3 project ideas.

### 3. Gamification Foundation (XP System)
- **Database:** Add an `xp` (Integer) field to the `Student` model.
- **Backend:** Update existing routes (like generating a portfolio or publishing a project) to award XP points. Display their XP proudly on the dashboard.

---

## Phase 2: Interactive Tools & Basic Social (Next Session)
Once Phase 1 is stable, we move to tooling and sharing.
- **3D Model Viewer:** Integrate `three.js` to render uploaded `.stl` files in the Design Journal.
- **Hall of Fame (Gallery):** A public `/explore` route querying all projects where `status == 'published'`, allowing students to see each other's work.
- **"Roast My Design" AI:** A specific AI persona added to the journal UI that gives playful, constructive critiques.

---

## Phase 3: Multiplayer & RPG Mechanics (Future)
The most complex features require significant architectural additions (like WebSockets for real-time collaboration).
- **RPG Skill Trees:** Mapping out specific domains (Mech, Code, Electronics) based on tags.
- **Team Workspaces:** Enabling multi-user project ownership and real-time cursor tracking on the Canva-style journals.
- **Code Simulator:** Integrating Wokwi or a similar browser-based embedded system simulator.

## Verification Plan for Phase 1
1. Run Prisma migrations to safely add `theme` and `xp` without dropping data.
2. Generate the standalone HTML export and verify the themes inject correctly.
3. Test the Scrap-Yard AI generator to ensure Gemini returns structured project ideas.
