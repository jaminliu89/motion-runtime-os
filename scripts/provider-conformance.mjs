import fs from 'node:fs';
import {assertProviderContract} from '../runtime/providers/provider-contract.mjs';
import {remotionProvider} from '../runtime/providers/remotion-provider.mjs';
import {hyperframesProvider} from '../runtime/providers/hyperframes-provider.mjs';

const registry = fs.readFileSync('adapters/PROVIDER_REGISTRY.yaml', 'utf8');
const providers = [remotionProvider, hyperframesProvider];
const failures = [];

for (const provider of providers) {
  try {
    assertProviderContract(provider);
  } catch (error) {
    failures.push(`${provider?.id ?? 'unknown'}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!registry.includes(`${provider.id}:`)) failures.push(`provider registry missing ${provider.id}`);
}

const remotionCapabilities = await remotionProvider.discoverCapabilities();
if (!remotionCapabilities.deterministic || !remotionCapabilities.local_render) {
  failures.push('remotion capability contract missing deterministic/local_render');
}

const hyperCapabilities = await hyperframesProvider.discoverCapabilities();
if (!hyperCapabilities.connected || !hyperCapabilities.local_render || hyperCapabilities.runtime !== 'hyperframes@0.8.12') {
  failures.push('hyperframes executable candidate must expose connected local_render runtime capability');
}

// Conformance proves the adapter object and declared capabilities are valid.
// It does NOT mark HyperFrames verified. Registry verification is only allowed
// after a real render + media probe + same-IR provider comparison succeeds.
if (registry.includes('hyperframes:\n    status: verified')) {
  failures.push('registry cannot mark hyperframes verified before execution evidence is committed');
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log('Executable provider conformance passed for Remotion and HyperFrames candidate');
