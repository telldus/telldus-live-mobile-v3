//
//  GitHubUserIntentHandler.swift
//  GitHubUserIntent
//
//  Created by Rimnesh Fernandez on 10/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

import UIKit
import DeviceActionShortcut

final class DeviceActionShortcutIntentHandler: NSObject, DeviceActionShortcutIntentHandling {
  @available(iOS 12.0, *)
  func handle(intent: DeviceActionShortcutIntent, completion: @escaping (DeviceActionShortcutIntentResponse) -> Void) {
    guard let deviceId = intent.deviceId else {
      completion(DeviceActionShortcutIntentResponse(code: .failure, userActivity: nil))
      return
    }
    
    let method = intent.method
    let dimValue = intent.dimValue
    var fetcher = Fetcher();
    fetcher.fetch(deviceId: deviceId, method: method!, stateValue: dimValue) { (status) in
      
      guard status == "success" else {
        completion(DeviceActionShortcutIntentResponse(code: .failure, userActivity: nil))
        return
      }
      
      completion(DeviceActionShortcutIntentResponse(code: .success, userActivity: nil))
    }
  }
  
}
