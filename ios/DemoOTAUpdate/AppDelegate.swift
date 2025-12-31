import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import airship_sdk  

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "DemoOTAUpdate",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    return self.bundleURL()
  }

  override func bundleURL() -> URL? {
      // Always try Airship OTA first
      if let airshipURL = StallionModule.getBundleURL() {
          print("🚀 Using Airship OTA bundle: \(airshipURL)")
          return airshipURL
      }

      print("⚠️ No Airship bundle available, using fallback")

  #if DEBUG
      // Check if Metro is available before trying
      let metroURL = RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")

      if let url = metroURL {
          print("📱 Debug mode: Using Metro bundler at \(url)")
          return url
      } else {
          print("❌ Metro bundler unavailable, falling back to embedded bundle")
          return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
      }
  #else
      print("📦 Release mode: Using embedded bundle")
      return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
  #endif
  }
}


