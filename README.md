# Nikita S. — The Living Archive

*Every chapter builds the next.*

A career told as a building: a playable 3D architectural experience plus a full conventional portfolio. Each floor of the building is also a normal web page.

| Floor | Environment | Page |
|---|---|---|
| G | The Grand Atrium | `/` |
| 01 | Memory Archive | `/about` |
| 02 | The Foundry | `/ventures` |
| 03 | The Arena | `/sports` |
| 04 | Control Room | `/esports` |
| 05 | The Sandbox | `/tech` |
| 06 | The Assembly | `/impact` |
| 07 | The Exchange | `/contact` |

Also: `/experience` (the playable building, `?floor=arena` deep-links to a floor), `/archive` (searchable index), `/profile` (printable / downloadable profile).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Editing content (the important part)

**All content lives in [`src/content/site.ts`](src/content/site.ts).** The website and the 3D building both read from it.

The site follows a *genuine content only* rule. Only the career story from the brief is written in. Fields that need real facts are left empty on purpose:

- `profile.email`, `profile.location`, `profile.socials`: hidden until filled in.
- `chapters[].period`: shows "Date — to add" until filled in.
- `entries[]`: frames for ventures, sports, esports, tech and impact work. They are marked `awaitingRecord: true` and show "details pending" until you replace the summary, role, period and link with the real record. Then remove the flag.
- `achievements`, `galleries`, `videos`: show an "Awaiting record" plate until you add items. Put images in `public/media/` and reference them as `/media/file.jpg`. Videos take a YouTube id.
- `profile.profilePdf`: set it to `/your-profile.pdf` (file in `public/`) to add a direct PDF download next to the printable profile.

To add an exhibit to a 3D floor, add it to that floor in [`src/experience/world.ts`](src/experience/world.ts). `fromEntry("entry-id", shape, [x, z])` pulls its copy from `site.ts`.

## Contact form

`POST /api/contact` validates the input and has a honeypot. To deliver messages, set `CONTACT_WEBHOOK_URL` (Slack, Discord, Zapier, Make or your own endpoint). The JSON message is sent there. Without it, messages are logged on the server and the form tells the visitor delivery isn't connected yet.

## Controls

Desktop: WASD or arrow keys to move, Shift to move faster, drag to look, scroll to zoom, E or click to interact, M for the map, Esc or P for the pause menu and direct navigation.
Mobile: virtual joystick, drag to look, tap objects or press Interact, ☰ for the menu. Mobile automatically uses the lighter "Performance" render path.

## Architecture & performance

- `src/experience/`: R3F scene. `Building.tsx` holds the shared shell, elevator core, exhibits and per-floor architecture. `Player.tsx` is the third-person controller with collision and proximity. `HUD.tsx` covers onboarding, minimap, menus, joystick and the GSAP elevator transition. `store.ts` keeps React state in zustand; per-frame state stays outside React.
- Only the current floor is mounted. Three.js loads only on `/` (hero) and `/experience`, client-side via `next/dynamic`.
- All geometry is procedural, so there are no model or texture downloads. Repeated elements (columns, seats, voxels, monitors, beams) are instanced. Fonts are self-hosted in `public/fonts`.
- Adaptive rendering: `PerformanceMonitor` drops to the Performance path (no reflections, no shadows, fewer instances, lower DPR) when frame rate falls, and `AdaptiveDpr` handles the rest. Visitors can also switch manually in the pause menu.
