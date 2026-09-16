import { requireOptionalNativeModule } from 'expo';

export type NativeProgress = {
  lastShownVerseId: number;
  sequentialVerseId: number;
  sequentialCompleted: boolean;
  lastShownAt: number;
};

export type ConfigurePayload = {
  enabled: boolean;
  mode: 'random' | 'sequential';
  pronunciation: 'english' | 'bengali' | 'both';
  meaningLanguage: 'english' | 'bengali' | 'both';
  lastShownVerseId: number;
  sequentialVerseId: number;
  sequentialCompleted: boolean;
  dbPath: string;
};

type DeenUnlockModuleNative = {
  configure(payload: ConfigurePayload): Promise<void>;
  getNativeProgress(): Promise<NativeProgress | null>;
};

const DeenUnlock = requireOptionalNativeModule<DeenUnlockModuleNative>('DeenUnlock');

export default DeenUnlock;

export async function configure(payload: ConfigurePayload) {
  await DeenUnlock?.configure(payload);
}

export async function getNativeProgress() {
  return DeenUnlock?.getNativeProgress() ?? null;
}
