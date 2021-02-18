//
//  DeviceActionShortcutIntentHandler.swift
//  DeviceActionShortcutExtension
//
//  Created by Rimnesh Fernandez on 15/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

import UIKit
import DeviceActionShortcut

final class DeviceActionShortcutIntentHandler: NSObject, DeviceActionShortcutIntentHandling {
  @available(iOS 12.0, *)
  func handle(intent: DeviceActionShortcutIntent, completion: @escaping (DeviceActionShortcutIntentResponse) -> Void) {
    
    let dataDict = Utilities().getAuthData()
    guard dataDict != nil
    else {
      completion(DeviceActionShortcutIntentResponse(code: .failure, userActivity: nil))
      return
    }
    let pro = dataDict?["pro"] as? Int
    let _isBasicUser = SharedUtils().isBasicUser(pro: pro)
    if _isBasicUser {
      completion(DeviceActionShortcutIntentResponse(code: .basic, userActivity: nil))
      return;
    }
    
    guard let deviceId = intent.deviceId else {
      completion(DeviceActionShortcutIntentResponse(code: .failure, userActivity: nil))
      return
    }
    
    let method = intent.method
    let fetcher = Fetcher();
    if method == "2048" {
      let thermostatValue = intent.thermostatValue
      fetcher.deviceSetStateThermostat(deviceId: deviceId, stateValue: thermostatValue!) { (status) in
        
        guard status == "success" else {
          completion(DeviceActionShortcutIntentResponse(code: .failure, userActivity: nil))
          return
        }
        
        completion(DeviceActionShortcutIntentResponse(code: .success, userActivity: nil))
      }
    } else if method == "1024" {
      let rgbValue = intent.rgbValue
      fetcher.deviceSetStateRGB(deviceId: deviceId, stateValue: rgbValue!) { (status) in
        
        guard status == "success" else {
          completion(DeviceActionShortcutIntentResponse(code: .failure, userActivity: nil))
          return
        }
        
        completion(DeviceActionShortcutIntentResponse(code: .success, userActivity: nil))
      }
    } else {
      let dimValue = intent.dimValue
      fetcher.deviceSetState(deviceId: deviceId, method: method!, stateValue: dimValue) { (status) in
        
        guard status == "success" else {
          completion(DeviceActionShortcutIntentResponse(code: .failure, userActivity: nil))
          return
        }
        
        completion(DeviceActionShortcutIntentResponse(code: .success, userActivity: nil))
      }
    }
  }
  
}
