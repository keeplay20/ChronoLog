#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DeviceIntegrityModule, NSObject)

RCT_EXTERN_METHOD(checkDeviceIntegrity:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
