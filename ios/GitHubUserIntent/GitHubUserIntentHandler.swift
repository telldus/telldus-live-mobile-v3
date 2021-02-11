//
//  GitHubUserIntentHandler.swift
//  GitHubUserIntent
//
//  Created by Rimnesh Fernandez on 10/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

import UIKit
import GitHubFetcher

final class CheckMyGitHubIntentHandler: NSObject, CheckMyGitHubIntentHandling {
  @available(iOS 12.0, *)
  func handle(intent: CheckMyGitHubIntent, completion: @escaping (CheckMyGitHubIntentResponse) -> Void) {
    print("TEST CheckMyGitHubIntentHandler handle \(intent.deviceId)")
    print("TEST CheckMyGitHubIntentHandler device \(intent.device)")
        guard let deviceId = intent.deviceId else {
            completion(CheckMyGitHubIntentResponse(code: .failure, userActivity: nil))
            return
        }
    
    let method = intent.method
    print("TEST CheckMyGitHubIntentHandler method \(method)")
    Fetcher.fetch(deviceId: deviceId, method: method!) { (user, followers) in
      print("TEST CheckMyGitHubIntentHandler user \(user)")
      guard let user = user else {
                completion(CheckMyGitHubIntentResponse(code: .failure, userActivity: nil))
                return
            }

      completion(CheckMyGitHubIntentResponse(code: .success, userActivity: nil))
        }
    }
    
}
