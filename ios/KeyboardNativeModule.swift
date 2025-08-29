import Foundation
import React

@objc(KeyboardNativeModule)
class KeyboardNativeModule: NSObject {
  
  @objc
  func isKeyboardInstalled(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    // Check if the Snippeta keyboard extension is available
    let keyboards = UserDefaults.standard.object(forKey: "AppleKeyboards") as? [String] ?? []
    
    // Look for our keyboard extension bundle ID
    let isInstalled = keyboards.contains { keyboard in
      keyboard.contains("SnippetaKeyboard") || keyboard.contains("com.wavelinkllc.snippeta.keyboard")
    }
    
    resolve(isInstalled)
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
