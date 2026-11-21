import type { RequestHandler } from 'express';
import { firebaseAuth } from '../firebase.js';

export const requireFirebaseUser: RequestHandler = async (req, res, next) => {
  const token = /^Bearer\s+(\S+)$/i.exec(req.get('Authorization') ?? '')?.[1];

  if (!token) {
    res.status(401).json({ error: 'A Firebase ID token is required.' });
    return;
  }

  try {
    const user = await firebaseAuth.verifyIdToken(token);
    res.locals.firebaseUid = user.uid;
  } catch (error) {
    const code = (error as { code?: string } | undefined)?.code;
    if (code === 'auth/argument-error' || code === 'auth/id-token-expired' || code === 'auth/invalid-id-token') {
      res.status(401).json({ error: 'Invalid or expired Firebase ID token.' });
      return;
    }

    console.error('Firebase ID token verification failed', code ?? 'unknown error');
    res.status(503).json({ error: 'Could not verify Firebase ID token.' });
    return;
  }

  next();
};
