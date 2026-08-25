import fs from 'node:fs';

const registry = fs.readFileSync('adapters/PROVIDER_REGISTRY.yaml', 'utf8');
const contract = fs.readFileSync('adapters/ADAPTER_CONTRACT.md', 'utf8');
const requiredMethods = ['discoverCapabilities()', 'validate(ir)', 'compile(ir, renderJob)', 'submit(compiled)', 'observe(job)', 'retrieve(job)', 'verify(artifact, expected)', 'normalizeFailure(error)'];
const failures = [];
for (const method of requiredMethods) if (!contract.includes(method)) failures.push(`adapter contract missing ${method}`);
for (const provider of ['remotion', 'hyperframes']) if (!registry.includes(`${provider}:`)) failures.push(`provider registry missing ${provider}`);
if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exit(1);
}
console.log('Provider conformance contract passed');
