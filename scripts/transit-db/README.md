
# Planet Transit Database Scripts

## One-time setup (run in order)
1. `node seed-transit-log.js`           — Seed 257 pending log rows
2. `node transit-cron-worker.js`        — Run repeatedly until Saturn complete (~90 rows)
3. `node generate-planet-transits.js`   — All other planets, 2020-2040 (~611 rows)
4. `node generate-daily-positions.js`   — Daily positions, rolling 8 years (~26,298 rows)

## Annual maintenance (run every Jan 1)
`node generate-daily-positions.js --extend`

## Notes
- All scripts read .env.local automatically
- Safe to re-run — unique constraints prevent duplicates
- Saturn cron: fix saturnAt() if swe_calc_ut returns flat object (res.longitude not res.data[0])
