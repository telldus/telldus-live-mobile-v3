//
//  Fetcher.swift
//  GitHubFetcher
//
//  Created by Rimnesh Fernandez on 10/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

public final class Fetcher: NSObject {
  public static func fetch(deviceId: String, method: String, completion: @escaping (_ status: String) -> Void) {
    let value = ""
    
    API().callEndPoint("/device/command?id=\(deviceId)&method=\(method)&value=\(value)") {result in
      switch result {
      case .success(_):
        completion("success");
        return;
      case .failure(_):
        completion("failed");
        return;
      }
    }
  }
}
