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
        guard let name = intent.name else {
            completion(CheckMyGitHubIntentResponse(code: .failure, userActivity: nil))
            return
        }

        Fetcher.fetch(name: name) { (user, followers) in
            guard let user = user else {
                completion(CheckMyGitHubIntentResponse(code: .failure, userActivity: nil))
                return
            }

            completion(CheckMyGitHubIntentResponse.success(repos: user.repos as NSNumber, followers: followers.count as NSNumber))
        }
    }
    
}
