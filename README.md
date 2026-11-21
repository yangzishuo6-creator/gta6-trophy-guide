# Vice Trophy Atlas

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/yangzishuo6-creator/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/yangzishuo6-creator/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline PlayStation 5 checklist for all 55 Grand Theft Auto VI trophies. Filter by kind, open a cited guide, or use the roadmap to plan the route to platinum. Story spoilers start hidden and are revealed as you check off each story trophy.

## Run locally

Run `node serve.ts` with Node.js 22.18 or later and open `http://localhost:8080`. You can also serve `app/` with any static HTTP server. The app loads its files locally. Trophy-source links open only when clicked.

Progress saves in your browser. **Export JSON** creates a portable progress file. **Import JSON** replaces your checkmarks with the progress in that file and accepts the starter’s array format.

## Trophy evidence

Official names, objectives and grades come from the contest’s 18 November 2026 snapshot. The roadmap uses the descriptions to identify milestones and targets. Missable watch calls out conditions worth checking while access and replay rules are pending. The supplied descriptions establish zero permanent lockouts.

[Exophase PS5 trophy list](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) · [PSNProfiles PS5 trophy list](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi)

## Package

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```
