# GarageBook

Offline garage book. Log fuel fills, EV charges, and shop receipts. Photos are read **on this device**. No account. No upload.

Successor to [FillCue](https://github.com/wilsonsamiano/fillcue).

## Live app

- **Grok:** [garagebook.grok.me](https://garagebook.grok.me)
- **GitHub Pages:** [wilsonsamiano.github.io/garagebook](https://wilsonsamiano.github.io/garagebook/)

Then install it as a PWA:

| Device | How |
| --- | --- |
| **iPhone / iPad** | Safari → Share → **Add to Home Screen** |
| **Android / Chrome / Brave / Edge** | Menu → **Install app** / **Add to Home screen** |

Brave on iPhone cannot install web apps (Apple). Use Safari.

## What it does

- Multiple vehicles, optional VIN
- EPA city / highway / combined lookup (NHTSA + fueleconomy.gov)
- Gas, hybrid, plug-in, and EV capture
- On-device OCR for pump, charge, shop, and cluster photos
- Due list from this log (not the factory schedule)
- Ownership spreadsheet (fuel, kWh, shop, $ / mile)

## Privacy

Everything stays in this browser’s IndexedDB. Clearing site data wipes the log — export JSON first. VIN / EPA lookup needs the network; the rest works offline after the first load.

## Develop

```bash
git clone https://github.com/wilsonsamiano/garagebook.git
cd garagebook
npm install
npm run dev
```

GitHub Pages builds with `npm run build:pages`.

## License

[MIT](LICENSE) © 2026 Wilson Samiano.

Support: [Buy me a coffee](https://buymeacoffee.com/wilsonsamiano)
