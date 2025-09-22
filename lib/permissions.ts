export function canRead(): boolean {
  return process.env.ALLOW_READ === 'true';
}

export function canWrite(): boolean {
  return process.env.ALLOW_WRITE === 'true';
}

export function getPermissions() {
  return {
    read: canRead(),
    write: canWrite(),
  };
}