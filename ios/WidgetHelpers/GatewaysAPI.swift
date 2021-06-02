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
    let api =  API()
    api.callEndPoint("\(EndPoints.getClients.rawValue)?&\(GetClients.extras.rawValue)=timezone") {result in
      switch result {
      case let .success(data):
        guard let parsedData = api.parseData(data: data["data"] as? Data, model: Gateways.self) else {
          completion(["clients": [], "authData": []]);
          return
        }
        guard let authData = data["authData"] as? Dictionary<String, Any> else {
          completion(["clients": [], "authData": []]);
          return
        }
        completion(["clients": parsedData.client, "authData": authData])
        return;
      case .failure(_):
        completion(["clients": [], "authData": []]);
      }
    }
  }
}
