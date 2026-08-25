import type {MotionIR} from '../motion-ir';
import type {CompiledMotion, MotionProviderAdapter, NormalizedFailure, ProviderArtifact, ProviderCapability, ProviderJob} from './types';

export class RemotionAdapter implements MotionProviderAdapter {
  readonly id = 'remotion';
  readonly version = '0.1.0';

  async discoverCapabilities(): Promise<ProviderCapability[]> {
    return ['text','light','background','multi-scene','still-render'];
  }

  async validate(ir: MotionIR) {
    const supported = new Set(await this.discoverCapabilities());
    const unsupported = [...new Set(ir.scenes.flatMap((scene)=>scene.layers.map((layer)=>layer.type)).filter((type)=>!supported.has(type as ProviderCapability)))];
    return {ok: unsupported.length === 0, unsupported};
  }

  async compile(ir: MotionIR): Promise<CompiledMotion> {
    const validation = await this.validate(ir);
    if (!validation.ok) throw new Error(`Unsupported Motion IR layer types: ${validation.unsupported.join(', ')}`);
    return {provider:this.id, composition:'CinematicIntro', ir, metadata:{entryPoint:'src/index.ts'}};
  }

  async submit(compiled: CompiledMotion): Promise<ProviderJob> {
    return {id:`local-${compiled.composition}`, provider:this.id, status:'planned', ref:compiled.composition};
  }
  async observe(job: ProviderJob): Promise<ProviderJob> { return job; }
  async retrieve(job: ProviderJob): Promise<ProviderArtifact[]> {
    return job.status === 'done' && job.ref ? [{path:job.ref, kind:'video'}] : [];
  }
  async verify(artifacts: ProviderArtifact[]) { return {ok: artifacts.length > 0, findings: artifacts.length ? [] : ['no artifacts']}; }
  normalizeFailure(error: unknown): NormalizedFailure {
    const message = error instanceof Error ? error.message : String(error);
    return {category: message.includes('Unsupported') ? 'UNSUPPORTED' : 'PROVIDER_ERROR', message};
  }
}
