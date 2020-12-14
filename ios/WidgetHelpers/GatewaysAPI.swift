//
//  GatewaysAPI.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 09/12/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

class GatewaysAPI {
  func getGatewaysList(completion: @escaping (Dictionary<String, Any>) -> Void)  {
    API().callEndPoint("/clients/list?&extras=timezone") {result in
      switch result {
      case let .success(data):
        guard let dataNew = data["result"] as? [String:Any] else {
          completion(["clients": [], "authData": []]);
          return
        }
        guard let authData = data["authData"] as? Dictionary<String, Any> else {
          completion(["clients": [], "authData": []]);
          return
        }
        guard let clients = dataNew["client"] as? Array<Dictionary<String, Any>> else {
          completion(["clients": [], "authData": []]);
          return
        }
        completion(["clients": clients, "authData": authData])
        return;
      case .failure(_):
        completion(["clients": [], "authData": []]);
      }
    }
  }
}
