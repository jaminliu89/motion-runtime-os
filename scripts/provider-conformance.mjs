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
  failures.push('hyperframes adapter must expose connected local_render runtime capability');
}

const hyperSection = registry.split(/\n  [a-zA-Z0-9_]+:\n/).find((section) => section.includes('runtime_adapter_path: runtime/providers/hyperframes-provider.mjs')) ?? '';
const isVerified = /status:\s*verified_/.test(hyperSection) || /verified:\s*true/.test(hyperSection);
if (isVerified) {
  const requiredEvidence = [
    'verification_evidence:',
    'run_id: 32887649705',
    'media_probe: pass',
    'provider_independence: proven',
    'semantic_equivalence: false',
  ];
  for (const token of requiredEvidence) {
    if (!hyperSection.includes(token)) failures.push(`verified hyperframes registry missing evidence: ${token}`);
  }
} else if (!/verified:\s*false/.test(hyperSection) && !/status:\s*(candidate|capability_discovery_required)/.test(hyperSection)) {
  failures.push('hyperframes registry must be either explicit candidate/unverified or evidence-backed verified');
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log(`Executable provider conformance passed for Remotion and HyperFrames (${isVerified ? 'verified' : 'candidate'})`);
