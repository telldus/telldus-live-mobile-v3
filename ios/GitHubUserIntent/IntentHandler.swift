//
//  IntentHandler.swift
//  GitHubUserIntent
//
//  Created by Rimnesh Fernandez on 10/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Intents

class IntentHandler: INExtension {
    
  override func handler(for intent: INIntent) -> Any {
//      guard intent is CheckMyGitHubIntent else {
//          fatalError("Unhandled intent type: \(intent)")
//      }

      return CheckMyGitHubIntentHandler()
  }
    
}
