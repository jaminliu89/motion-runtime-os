export const REQUIRED_PROVIDER_METHODS = [
  'discoverCapabilities',
  'validate',
  'compile',
  'submit',
  'observe',
  'retrieve',
  'verify',
  'normalizeFailure',
];

export function assertProviderContract(provider) {
  for (const method of REQUIRED_PROVIDER_METHODS) {
    if (typeof provider?.[method] !== 'function') throw new Error(`Provider missing method: ${method}`);
  }
  if (!provider.id) throw new Error('Provider id is required');
  return true;
}
