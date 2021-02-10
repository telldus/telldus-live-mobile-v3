//
//  WidgetModule.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 08/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import Security
import Intents
import UIKit
import GitHubFetcher

@objc(WidgetModule)
class WidgetModule: NSObject {
  
  let sharedModule = SharedModule()
  
  @objc(configureWidgetAuthData:)
  func configureWidgetAuthData(authData: Dictionary<String, Any>) -> Void {
    sharedModule.configureWidgetAuthData(authData: authData)
  }
  
  @discardableResult
  func setSecureData(data: String) -> Bool {
    return sharedModule.setSecureData(data: data)
  }
  
  // IMP: Do not update with partial data! Should have all keys set by 'configureWidgetAuthData'
  @discardableResult
  func updateSecureData(data: String) -> Int {
    return sharedModule.updateSecureData(data: data)
  }
  
  func getSecureData() -> String? {
    return sharedModule.getSecureData()
  }
  
  @objc(disableAllWidgets)
  func disableAllWidgets() -> Void {
    sharedModule.disableAllWidgets()
  }
  
  @objc(refreshAllWidgetsData)
  func refreshAllWidgetsData() {
    sharedModule.refreshAllWidgetsData()
  }
  
  @objc(refreshAllWidgets)
  func refreshAllWidgets() {
    sharedModule.refreshAllWidgets()
  }
  
  @objc(setUserDefault:value:)
  func setUserDefault(key: NSString, value: NSString) {
    sharedModule.setUserDefault(key: key, value: value);
  }
  
  @objc(getUserDefault:)
  func getUserDefault(key: NSString) -> NSString {
    return sharedModule.getUserDefault(key: key)
  }
  
  @objc(donate:)
  func donate(name: String) {
    if #available(iOS 12.0, *) {
      let intent = CheckMyGitHubIntent()
      intent.suggestedInvocationPhrase = "Check my GitHub"
      intent.name = name

      let interaction = INInteraction(intent: intent, response: nil)

      interaction.donate { (error) in
          if error != nil {
              if let error = error as NSError? {
                  print("Interaction donation failed: \(error.description)")
              } else {
                  print("Successfully donated interaction")
              }
          }
      }
    } else {
      // Fallback on earlier versions
    }
  }
}
