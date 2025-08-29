#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(KeyboardNativeModule, NSObject)

RCT_EXTERN_METHOD(isKeyboardInstalled:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
