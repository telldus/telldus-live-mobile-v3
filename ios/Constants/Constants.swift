//
//  Constants.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
struct Constants {
  
  static var telldusAPIServer: String = Constants.variable(named: "TELLDUS_API_SERVER") ?? CI.telldusAPIServer
  static let supportedMethods = 4023;
  
  static func variable(named name: String) -> String? {
    let processInfo = ProcessInfo.processInfo
    guard let value = processInfo.environment[name] else {
      return nil
    }
    return value
  }
}
