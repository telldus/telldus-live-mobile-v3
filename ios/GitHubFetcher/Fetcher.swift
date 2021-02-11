//
//  Fetcher.swift
//  GitHubFetcher
//
//  Created by Rimnesh Fernandez on 10/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation
//import Utilities
//import API

public final class Fetcher: NSObject {
  public static func fetch(deviceId: String, method: String, completion: @escaping (_ status: String) -> Void) {
    let value = ""
    
//    let dataDict = Utilities().getAuthData()
//    guard dataDict != nil else {
//      completion("failed")
//      return
//    }
//
//    let accessToken = dataDict!["accessToken"] as! String?
//    print ("TEST accessToken \(accessToken)");
//    guard accessToken != nil else {
//      completion("failed")
//      return
//    }
    
    print ("TEST \(deviceId), \(method)");
    guard let url = URL(string: "https://api3.telldus.com/oauth2/device/command?id=\(deviceId)&method=\(method)&value=$\(value)") else {
      return
    }
    
    var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 10.0)
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.addValue("application/json", forHTTPHeaderField: "Accept")
    request.addValue("Bearer 0c8742ce517ec630f68a7f23bdd235ddf69bee92", forHTTPHeaderField: "Authorization")
    
    let task = URLSession.shared.dataTask(with: request) { data, response, error in
      print("TEST ONE error \(error)")
      guard let data = data else {
        completion("failed")
        return
      }
      print("TEST ONE data \(data)")
      do {
        //create json object from data
        let str = String(data: data, encoding: String.Encoding.utf8)
        print("TEST ONE str \(str)")
        if let json = try JSONSerialization.jsonObject(with: data, options: .mutableContainers) as? [String: Any] {
          let err = json["error"] ?? nil
          print("TEST err \(err)")
          guard err == nil else {
            let _error = err as! String
//            if (_error == "invalid_token" || _error == "expired_token") {
//              return API.refreshAccessToken(authData: dataDict) {responseAT in
//                guard responseAT != nil else {
//                  completion("failed")
//                  return
//                }
//                return self.callEndPoint(params, completion: completion)
//              }
              completion("failed")
              return
//            }
          }
          print("TEST json \(json)")
          completion("success")
          return
        }
      } catch let err {
        print("TEST catch err \(err)")
        completion("failed")
        return
      }
      return
    }
    
    task.resume()
  }
}
