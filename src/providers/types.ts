import type {MotionIR} from '../motion-ir';

export type ProviderCapability = 'text' | 'light' | 'background' | 'audio' | 'subtitles' | 'multi-scene' | 'still-render';
export type NormalizedFailure = {category: 'AUTH'|'PERMISSION'|'UNSUPPORTED'|'ASSET'|'COMPILE'|'RENDER'|'RATE_LIMIT'|'UNKNOWN_OUTCOME'|'PROVIDER_ERROR'; message: string};
export type CompiledMotion = {provider: string; composition: string; ir: MotionIR; metadata?: Record<string, unknown>};
export type ProviderJob = {id: string; provider: string; status: 'planned'|'rendering'|'done'|'failed'|'unknown'; ref?: string};
export type ProviderArtifact = {path: string; kind: 'video'|'still'|'frame-set'|'project'|'report'};

export interface MotionProviderAdapter {
  readonly id: string;
  readonly version: string;
  discoverCapabilities(): Promise<ProviderCapability[]>;
  validate(ir: MotionIR): Promise<{ok: boolean; unsupported: string[]}>;
  compile(ir: MotionIR, renderJob?: Record<string, unknown>): Promise<CompiledMotion>;
  submit(compiled: CompiledMotion): Promise<ProviderJob>;
  observe(job: ProviderJob): Promise<ProviderJob>;
  retrieve(job: ProviderJob): Promise<ProviderArtifact[]>;
  verify(artifacts: ProviderArtifact[], expected?: Record<string, unknown>): Promise<{ok: boolean; findings: string[]}>;
  normalizeFailure(error: unknown): NormalizedFailure;
}
