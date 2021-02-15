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

final class CheckMyGitHubIntentHandler: NSObject, CheckMyGitHubIntentHandling {
  @available(iOS 12.0, *)
  func handle(intent: CheckMyGitHubIntent, completion: @escaping (CheckMyGitHubIntentResponse) -> Void) {
    print("TEST CheckMyGitHubIntentHandler handle \(intent.deviceId)")
    guard let deviceId = intent.deviceId else {
      completion(CheckMyGitHubIntentResponse(code: .failure, userActivity: nil))
      return
    }
    
    let method = intent.method
    let dimValue = intent.dimValue
    print("TEST CheckMyGitHubIntentHandler method \(method)")
    var fetcher = Fetcher();
    fetcher.fetch(deviceId: deviceId, method: method!, stateValue: dimValue) { (status) in
      print("TEST CheckMyGitHubIntentHandler status \(status)")
      
      guard status == "success" else {
        completion(CheckMyGitHubIntentResponse(code: .failure, userActivity: nil))
        return
      }
      
      completion(CheckMyGitHubIntentResponse(code: .success, userActivity: nil))
    }
  }
  
}
