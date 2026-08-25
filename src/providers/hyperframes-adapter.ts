import type {MotionIR} from '../motion-ir';
import type {CompiledMotion, MotionProviderAdapter, NormalizedFailure, ProviderArtifact, ProviderCapability, ProviderJob} from './types';

export class HyperFramesAdapter implements MotionProviderAdapter {
  readonly id = 'hyperframes';
  readonly version = '0.1.0-contract';

  async discoverCapabilities(): Promise<ProviderCapability[]> {
    // Runtime discovery must replace this placeholder once the provider is connected.
    return [];
  }
  async validate(_ir: MotionIR) { return {ok:false, unsupported:['CAPABILITY_DISCOVERY_REQUIRED']}; }
  async compile(_ir: MotionIR): Promise<CompiledMotion> { throw new Error('HyperFrames capability discovery is required before compile'); }
  async submit(_compiled: CompiledMotion): Promise<ProviderJob> { throw new Error('HyperFrames provider is not connected'); }
  async observe(job: ProviderJob): Promise<ProviderJob> { return {...job,status:'unknown'}; }
  async retrieve(_job: ProviderJob): Promise<ProviderArtifact[]> { return []; }
  async verify(_artifacts: ProviderArtifact[]) { return {ok:false,findings:['provider not connected']}; }
  normalizeFailure(error: unknown): NormalizedFailure {
    const message = error instanceof Error ? error.message : String(error);
    return {category: message.includes('not connected') || message.includes('discovery') ? 'UNSUPPORTED' : 'PROVIDER_ERROR', message};
  }
}
