import { Router } from 'express';
import type { Response } from 'express';
import { requireFirebaseUser } from '../middleware/require-firebase-user.js';
import { generateUsernames } from '../services/gemini.js';
import { generateProfilePicture } from '../services/pollinations.js';
import { ProviderHttpError } from '../services/provider-error.js';
import { readText } from './validation.js';

const router = Router();
const namePattern = /^\p{L}[\p{L}\p{M}]*(?:[ '’.-]\p{L}[\p{L}\p{M}]*)*$/u;
const usernamePattern = /^[\p{L}\p{N}][\p{L}\p{M}\p{N}_.-]*$/u;
const instructionPattern = /\b(?:ignore (?:all |the )?(?:previous|prior|above) instructions|(?:reveal|print|show) (?:the |your )?(?:system|developer) prompt|(?:reveal|print|show) (?:the |your )?api key)\b/i;

router.get('/usernames', requireFirebaseUser, async (req, res) => {
  const name = readGenerationInput(req.query.name, 40, namePattern);
  if (!name || Object.keys(req.query).some(key => key !== 'name')) {
    res.status(400).json({ error: 'Provide a name of up to 40 characters using letters, spaces, apostrophes, periods, or hyphens.' });
    return;
  }

  res.set('Cache-Control', 'no-store');
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({ error: 'Username generation requires GEMINI_API_KEY on the server.' });
    return;
  }
  try {
    res.json({ candidates: await generateUsernames(name, apiKey) });
  } catch (error) {
    sendGenerationError(res, 'Gemini', error);
  }
});

router.get('/picture', requireFirebaseUser, async (req, res) => {
  const username = readGenerationInput(req.query.username, 80, usernamePattern);
  const rawVariant = req.query.variant ?? '0';
  const variant = typeof rawVariant === 'string' && /^\d+$/.test(rawVariant)
    ? Number(rawVariant)
    : NaN;
  if (!username || !Number.isSafeInteger(variant) || Object.keys(req.query).some(key => key !== 'username' && key !== 'variant')) {
    res.status(400).json({ error: 'Provide a username of up to 80 characters using letters, digits, underscores, periods, or hyphens, and an optional nonnegative integer variant.' });
    return;
  }

  res.set('Cache-Control', 'no-store');
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({ error: 'Picture generation requires POLLINATIONS_API_KEY on the server.' });
    return;
  }

  try {
    const picture = await generateProfilePicture(username, variant, apiKey);
    res.json({ picture, variant, source: 'pollinations' });
  } catch (error) {
    sendGenerationError(res, 'Pollinations', error);
  }
});

function sendGenerationError(res: Response, provider: string, error: unknown) {
  if (error instanceof ProviderHttpError) {
    res.status(502).json({
      error: error.message,
      upstreamStatus: error.upstreamStatus,
      upstreamCode: error.upstreamCode,
    });
    return;
  }
  if (error instanceof Error && error.name === 'TimeoutError') {
    res.status(504).json({ error: `${provider}: The generation request timed out.` });
    return;
  }
  res.status(502).json({ error: `${provider}: The request failed or returned an unusable result.` });
}

function readGenerationInput(value: unknown, maxLength: number, pattern: RegExp) {
  const input = readText(value, maxLength)?.normalize('NFC');
  if (!input || !pattern.test(input)) return;

  const words = input.normalize('NFKC').replace(/[_.’'-]+/g, ' ').replace(/ +/g, ' ');
  if (!instructionPattern.test(words)) return input;
}

export default router;
