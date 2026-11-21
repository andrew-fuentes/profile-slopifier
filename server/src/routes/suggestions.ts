import { Router } from 'express';
import { readText } from './validation.js';

const router = Router();
const colors = ['#dddddd', '#bdd7ee', '#c6e0b4', '#ffe699'];

router.get('/usernames', (req, res) => {
  const name = readText(req.query.name, 40)?.toLowerCase().replace(/\s+/g, '');
  if (!name) {
    res.status(400).json({ error: 'name must contain 1 to 40 characters.' });
    return;
  }

  res.json({ candidates: [`${name}123`, `${name}_online`, `hello_${name}`] });
});

router.get('/picture', (req, res) => {
  const username = readText(req.query.username, 80);
  const rawVariant = req.query.variant ?? '0';
  const variant = typeof rawVariant === 'string' && /^\d+$/.test(rawVariant)
    ? Number(rawVariant)
    : NaN;
  if (!username || !Number.isSafeInteger(variant)) {
    res.status(400).json({ error: 'Provide a username of up to 80 characters and an optional nonnegative integer variant.' });
    return;
  }

  const color = colors[variant % colors.length];
  const initial = Array.from(username)[0].toUpperCase().replace(/[<>&"'\u0000-\u001f\uD800-\uDFFF\uFFFE\uFFFF]/gu, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="${color}"/><text x="128" y="155" text-anchor="middle" font-family="Arial" font-size="80">${initial}</text></svg>`;
  res.json({ picture: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, variant });
});

export default router;
