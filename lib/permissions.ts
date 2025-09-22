export function canRead(): boolean {
  const value = process.env.ALLOW_READ?.toLowerCase().trim();
  return value !== 'false' && value !== '0' && value !== 'no' && value !== '';
}

export function canWrite(): boolean {
  const value = process.env.ALLOW_WRITE?.toLowerCase().trim();
  return value !== 'false' && value !== '0' && value !== 'no' && value !== '';
}

export function getPermissions() {
  return {
    read: canRead(),
    write: canWrite(),
  };
}