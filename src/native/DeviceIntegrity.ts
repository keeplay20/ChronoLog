import {NativeModules, Platform} from 'react-native';
import type {DeviceIntegrityResult} from '../types/episode';

interface DeviceIntegrityNative {
  checkDeviceIntegrity(): Promise<DeviceIntegrityResult>;
}

const LINKING_ERROR =
  "DeviceIntegrityModule native module not linked. Run a native build (not Expo Go).";

const DeviceIntegrityModule: DeviceIntegrityNative =
  NativeModules.DeviceIntegrityModule ??
  ({
    checkDeviceIntegrity: async () => {
      if (__DEV__) {
        console.warn(LINKING_ERROR);
        return {
          isSecure: true,
          platform: Platform.OS as 'ios' | 'android',
          reasons: [],
        };
      }
      throw new Error(LINKING_ERROR);
    },
  } as DeviceIntegrityNative);

export async function checkDeviceIntegrity(): Promise<DeviceIntegrityResult> {
  return DeviceIntegrityModule.checkDeviceIntegrity();
}
