//
//  Fetcher.swift
//  GitHubFetcher
//
//  Created by Rimnesh Fernandez on 10/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

public final class Fetcher: NSObject {
  
  var timerDeviceInfo: [String: Timer] = [:]
  
  public func fetch(deviceId: String, method: String, stateValue: NSNumber?, completion: @escaping (_ status: String) -> Void) {
    API().callEndPoint("/device/command?id=\(deviceId)&method=\(method)&value=\(stateValue)") {result in
      switch result {
      case .success(_):
        var requestedStateValue: [String: Any] = [:];
        if stateValue != nil, method == "16" {
          requestedStateValue["dimValue"] = stateValue
        }
        self.timerDeviceInfo[deviceId]?.invalidate()
        DispatchQueue.main.async {
          self.timerDeviceInfo[deviceId] = Timer.scheduledTimer(withTimeInterval: 10, repeats: false) {timer in
            self.getDeviceInfo(deviceId: deviceId, requestedState: method, requestedStateValue: requestedStateValue, completion: completion);
          }
        }
      case .failure(_):
        completion("failed");
        return;
      }
    }
  }
  
  public func getDeviceInfo(deviceId: String, requestedState: String, requestedStateValue: Dictionary<String, Any>, completion: @escaping (_ status: String) -> Void) {
    API().callEndPoint("/device/info?id=\(deviceId)&supportedMethods=\(Constants.supportedMethods)") {result in
      switch result {
      case let .success(data):
        guard let _result = data["result"] as? [String:Any] else {
          completion("failed");
          return;
        }
        
        let stateValues = _result["statevalues"] as? Array<Any>
        let currentState = _result["state"] as? String
        
        let reqDimValue = requestedStateValue["dimValue"] as? String
        let rgbValue = requestedStateValue["rgbValue"]
        let thermostatMode = requestedStateValue["thermostatMode"]
        let thermostatSetPoint = requestedStateValue["thermostatSetPoint"]
        
        var reducedStateValues: [String: Int] = [:]
        var isStateValueEqual = true;
        if let _stateValues = stateValues, (reqDimValue != nil || rgbValue != nil || thermostatMode != nil || thermostatSetPoint != nil) {
          isStateValueEqual = false;
          for sValue in _stateValues {
            if let _sValue = sValue as? [String: Any] {
              let state = _sValue["state"] as? String
              let value = _sValue["value"] as? Int
              reducedStateValues[state!] = value!
            }
          }
          
          if reqDimValue != nil {
            let currentDimValue = String(reducedStateValues["16"]!)
            isStateValueEqual = reqDimValue! == currentDimValue
          }
        }
        let isStateEqual = requestedState == currentState!;
        if isStateEqual && isStateValueEqual {
          completion("success");
        } else {
          completion("failed");
        }
        return;
      case .failure(_):
        completion("failed");
        return;
      }
    }
  }
}
