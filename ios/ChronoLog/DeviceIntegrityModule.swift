import Foundation
import UIKit

@objc(DeviceIntegrityModule)
class DeviceIntegrityModule: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func checkDeviceIntegrity(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    var reasons: [String] = []

    if isJailbroken() {
      reasons.append("Jailbreak file paths or sandbox escape detected")
    }
    if canOpenCydia() {
      reasons.append("Cydia URL scheme accessible")
    }
    if isSuspiciousEnvironment() {
      reasons.append("Suspicious dynamic libraries or substrate detected")
    }

    resolve([
      "isSecure": reasons.isEmpty,
      "platform": "ios",
      "reasons": reasons,
    ])
  }

  private func isJailbroken() -> Bool {
    #if targetEnvironment(simulator)
    return false
    #else
    let paths = [
      "/Applications/Cydia.app",
      "/Library/MobileSubstrate/MobileSubstrate.dylib",
      "/bin/bash",
      "/usr/sbin/sshd",
      "/etc/apt",
      "/private/var/lib/apt/",
      "/private/var/stash",
      "/private/var/tmp/cydia.log",
      "/Applications/FakeCarrier.app",
      "/Applications/Icy.app",
      "/Applications/IntelliScreen.app",
      "/Applications/MxTube.app",
      "/Applications/RockApp.app",
      "/Applications/SBSettings.app",
      "/Applications/WinterBoard.app",
    ]
    for path in paths {
      if FileManager.default.fileExists(atPath: path) {
        return true
      }
    }

    let testPath = "/private/jailbreak_test_\(UUID().uuidString)"
    do {
      try "test".write(toFile: testPath, atomically: true, encoding: .utf8)
      try FileManager.default.removeItem(atPath: testPath)
      return true
    } catch {
      return false
    }
    #endif
  }

  private func canOpenCydia() -> Bool {
    guard let url = URL(string: "cydia://package/com.example.package") else {
      return false
    }
    return UIApplication.shared.canOpenURL(url)
  }

  private func isSuspiciousEnvironment() -> Bool {
    let suspicious = [
      "SubstrateLoader.dylib",
      "SSLKillSwitch2.dylib",
      "SSLKillSwitch.dylib",
      "MobileSubstrate.dylib",
      "TweakInject.dylib",
      "CydiaSubstrate",
    ]
    for i in 0..<_dyld_image_count() {
      if let name = _dyld_get_image_name(i) {
        let imageName = String(cString: name)
        for lib in suspicious where imageName.lowercased().contains(lib.lowercased()) {
          return true
        }
      }
    }
    return false
  }
}

// dyld introspection for injected libraries
@_silgen_name("_dyld_image_count")
func _dyld_image_count() -> UInt32

@_silgen_name("_dyld_get_image_name")
func _dyld_get_image_name(_ index: UInt32) -> UnsafePointer<CChar>?
