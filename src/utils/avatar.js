// Local placeholder until the image API is connected.
export function avatarUrl(username, variant = 0) {
  const colors = ['#dddddd', '#bdd7ee', '#c6e0b4', '#ffe699'];
  const color = colors[variant % colors.length];
  const initial = username.charAt(0).toUpperCase().replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="${color}"/><text x="128" y="155" text-anchor="middle" font-family="Arial" font-size="80">${initial}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function downloadProfile(profile) {
  const file = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${profile.service}-${profile.username}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
