import { createHash } from 'node:crypto';
import { readProviderError } from './provider-error.js';

export async function generateProfilePicture(username: string, variant: number, apiKey: string): Promise<string> {
  const digest = createHash('sha256').update(JSON.stringify([username, variant])).digest();
  const palettes = ['muted blues', 'sage greens', 'warm amber', 'soft violet'];
  const palette = palettes[digest[4] % palettes.length];
  const response = await fetch('https://gen.pollinations.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    redirect: 'error',
    signal: AbortSignal.timeout(45_000),
    body: JSON.stringify({
      model: 'black-forest-labs/flux.1-schnell',
      prompt: `Square profile avatar, original abstract geometric illustration in ${palette}, centered composition, clean background, no text.`,
      seed: digest.readUInt32BE(0) % 2_147_483_647,
      size: '512x512',
      n: 1,
      response_format: 'url',
    }),
  });
  if (!response.ok) throw await readProviderError('Pollinations', response);

  const data = await response.json() as { data?: { url?: string }[] };
  const url = data.data?.[0]?.url;
  if (typeof url !== 'string' || url.length > 4096) throw new Error('Pollinations returned no media URL');
  const picture = new URL(url);
  if (picture.origin !== 'https://media.pollinations.ai' || picture.username || picture.password) {
    throw new Error('Pollinations returned an invalid media URL');
  }
  return picture.href;
}
