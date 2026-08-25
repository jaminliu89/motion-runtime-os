export const hyperframesProvider = {
  id: 'hyperframes',
  version: '0.1.0',
  async discoverCapabilities() {
    return {provider:'hyperframes', connected:false, status:'CAPABILITY_DISCOVERY_REQUIRED'};
  },
  async validate() {
    return {ok:false, issues:['CAPABILITY_DISCOVERY_REQUIRED']};
  },
  async compile() {
    throw new Error('CAPABILITY_DISCOVERY_REQUIRED');
  },
  async submit() {
    throw new Error('CAPABILITY_DISCOVERY_REQUIRED');
  },
  async observe() {
    return {status:'unknown', reason:'CAPABILITY_DISCOVERY_REQUIRED'};
  },
  async retrieve() {
    return {artifacts:[]};
  },
  async verify() {
    return {ok:false, reason:'CAPABILITY_DISCOVERY_REQUIRED'};
  },
  normalizeFailure(error) {
    return {category:'UNSUPPORTED', message:error instanceof Error ? error.message : String(error)};
  },
};
