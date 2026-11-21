import { Router } from 'express';
import type { Response } from 'express';
import { firestore } from '../firebase.js';
import { readText } from './validation.js';

const router = Router();

function profiles(res: Response) {
  return firestore.collection('users').doc(res.locals.firebaseUid).collection('profiles');
}

router.param('profileId', (_req, res, next, id: string) => {
  if (!/^[\p{L}\p{N}_-]{1,128}$/u.test(id) || /^__.*__$/.test(id)) {
    res.status(400).json({ error: 'Invalid profile ID.' });
    return;
  }
  next();
});

router.get('/', async (_req, res) => {
  const snapshot = await profiles(res).get();
  res.json(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
});

router.post('/', async (req, res) => {
  const firstName = readText(req.body?.firstName, 40);
  const username = readText(req.body?.username, 80);
  const service = readText(req.body?.service, 200);

  if (!firstName || !username || !service) {
    res.status(400).json({ error: 'Provide firstName, username, and service of up to 40, 80, and 200 characters respectively.' });
    return;
  }

  const profile = { firstName, username, service, picture: '', variant: 0, comments: '' };
  const picture = readPicture(req.body);
  if (!picture && [req.body.picture, req.body.variant, req.body.comments].some(value => value !== undefined)) {
    res.status(400).json({ error: pictureError });
    return;
  }

  const data = { ...profile, ...picture };
  const doc = await profiles(res).add(data);
  res.status(201).json({ ...data, id: doc.id });
});

const pictureError = 'Provide a picture URL of up to 4096 characters, an optional nonnegative integer variant, and optional comments of up to 1000 characters.';

function readPicture(body: Record<string, unknown> | undefined) {
  const picture = readText(body?.picture, 4096);
  const variant = body?.variant;
  const comments = body?.comments;
  if (!picture || !URL.canParse(picture) || !/^(https?:\/\/[^\s]+|data:image\/svg\+xml;charset=utf-8,[^\s]+)$/i.test(picture)) return;
  if (variant !== undefined && (typeof variant !== 'number' || !Number.isSafeInteger(variant) || variant < 0)) return;
  if (comments !== undefined && (typeof comments !== 'string' || comments.length > 1000)) return;

  return {
    picture,
    ...(variant !== undefined && { variant }),
    ...(typeof comments === 'string' && { comments: comments.trim() }),
  };
}

async function updateProfile(res: Response, id: string, changes: Record<string, string | number>) {
  const doc = profiles(res).doc(id);
  const profile = await firestore.runTransaction(async transaction => {
    const snapshot = await transaction.get(doc);
    if (!snapshot.exists) return;
    transaction.update(doc, changes);
    return { ...snapshot.data(), ...changes, id: doc.id };
  });

  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }
  res.json(profile);
}

router.put('/:profileId/username', async (req, res) => {
  const username = readText(req.body?.username, 80);
  if (!username) {
    res.status(400).json({ error: 'username must contain 1 to 80 characters.' });
    return;
  }
  await updateProfile(res, req.params.profileId, { username });
});

router.put('/:profileId/picture', async (req, res) => {
  const picture = readPicture(req.body);
  if (!picture) {
    res.status(400).json({ error: pictureError });
    return;
  }
  await updateProfile(res, req.params.profileId, picture);
});

router.delete('/:profileId', async (req, res) => {
  await profiles(res).doc(req.params.profileId).delete();
  res.sendStatus(204);
});

export default router;
