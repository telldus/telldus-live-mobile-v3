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
      print("TEST result \(result) ")
      switch result {
      case let .success(data):
        print("TEST success data \(data) ")
        completion("success");
        return;
      case .failure(_):
        print("TEST failure")
        completion("failed");
        return;
      }
    }
  }
}
