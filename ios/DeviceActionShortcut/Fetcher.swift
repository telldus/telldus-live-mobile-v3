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
  
  public func deviceSetState(deviceId: String, method: String, stateValue: NSNumber?, completion: @escaping (_ status: String) -> Void) {
    var _stateValue: Any = ""
    if stateValue != nil {
      _stateValue = String(describing: stateValue!)
    }
    API().callEndPoint("/device/command?id=\(deviceId)&method=\(method)&value=\(_stateValue)") {result in
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
  
  @available(iOS 12.0, *)
  public func deviceSetStateRGB(deviceId: String, stateValue: RGBValue, completion: @escaping (_ status: String) -> Void) {
    if #available(iOS 13.0, *) {
      let r: NSNumber = stateValue.r!, g: NSNumber = stateValue.g!, b: NSNumber = stateValue.b!;
      API().callEndPoint("/device/rgb?id=\(deviceId)&r=\(r)&g=\(g)&b=\(b)") {result in
        switch result {
        case .success(_):
          let requestedStateValue: [String: RGBValue] = ["rgbValue":stateValue];
          self.timerDeviceInfo[deviceId]?.invalidate()
          DispatchQueue.main.async {
            self.timerDeviceInfo[deviceId] = Timer.scheduledTimer(withTimeInterval: 10, repeats: false) {timer in
              self.getDeviceInfo(deviceId: deviceId, requestedState: "1024", requestedStateValue: requestedStateValue, completion: completion);
            }
          }
        case .failure(_):
          completion("failed");
          return;
        }
      }
    } else {
      // Fallback on earlier versions
      completion("failed");
    }
  }
  
  @available(iOS 12.0, *)
  public func deviceSetStateThermostat(deviceId: String, stateValue: ThermostatValue, completion: @escaping (_ status: String) -> Void) {
    if #available(iOS 13.0, *) {
      let mode: String = stateValue.mode!, temperature: NSNumber = stateValue.temperature!, scale: NSNumber = stateValue.scale!, changeMode: NSNumber = stateValue.changeMode!;
      API().callEndPoint("/device/thermostat?id=\(deviceId)&mode=\(mode)&temperature=\(temperature)&scale\(scale)&changeMode\(changeMode)") {result in
        switch result {
        case .success(_):
          let requestedStateValue: [String: ThermostatValue] = ["thermostatValue":stateValue];
          self.timerDeviceInfo[deviceId]?.invalidate()
          DispatchQueue.main.async {
            self.timerDeviceInfo[deviceId] = Timer.scheduledTimer(withTimeInterval: 10, repeats: false) {timer in
              self.getDeviceInfo(deviceId: deviceId, requestedState: "2048", requestedStateValue: requestedStateValue, completion: completion);
            }
          }
        case .failure(_):
          completion("failed");
          return;
        }
      }
    } else {
      // Fallback on earlier versions
      completion("failed");
    }
  }
  
  public func getDeviceInfo(deviceId: String, requestedState: String, requestedStateValue: Dictionary<String, Any>, completion: @escaping (_ status: String) -> Void) {
    if #available(iOS 13.0, *) {
      API().callEndPoint("/device/info?id=\(deviceId)&supportedMethods=\(Constants.supportedMethods)") {result in
        switch result {
        case let .success(data):
          guard let _result = data["result"] as? [String:Any] else {
            completion("failed");
            return;
          }
          
          let stateValues = _result["statevalues"] as? Array<Any>
          let currentState = _result["state"] as? String
          
          let reqDimValue = requestedStateValue["dimValue"] as? Int
          let reqRgbValue = requestedStateValue["rgbValue"] as? RGBValue
          let reqThermostatValue = requestedStateValue["thermostatValue"] as? ThermostatValue
          
          var reducedStateValues: [String: Any] = [:]
          var isStateValueEqual = true;
          var isStateEqual = requestedState == currentState!;
          if let _stateValues = stateValues, (reqDimValue != nil || reqRgbValue != nil || reqThermostatValue != nil) {
            isStateValueEqual = false;
            for sValue in _stateValues {
              if let _sValue = sValue as? [String: Any] {
                let state = _sValue["state"] as? String
                let value: Any
                if state == "2048" {
                  value = _sValue["value"] as? [String: Any]
                } else {
                  value = _sValue["value"] as? Int
                }
                reducedStateValues[state!] = value
              }
            }
            if reqDimValue != nil && requestedState == "16" {
              let currentDimValue = String(reducedStateValues["16"] as! Int)
              isStateValueEqual = String(reqDimValue!) == currentDimValue
            }
            if reqRgbValue != nil && requestedState == "1024" {
              isStateEqual = (currentState! == "1024") || (currentState! == "16") || (currentState! == "1")
              let currentRgbValue = reducedStateValues["1024"] as! Int
              let r = reqRgbValue?.r
              let g = reqRgbValue?.g
              let b = reqRgbValue?.b
              
              let hexValueReq = "#"+String(format:"%02X", Int(r!)) + String(format:"%02X", Int(g!)) + String(format:"%02X", Int(b!))
              let hexvalueRes = Utilities().getMainColorRGB(decimalRGB: currentRgbValue)
              isStateValueEqual = hexValueReq.lowercased() == hexvalueRes.lowercased()
            }
            if reqThermostatValue != nil && requestedState == "2048" {
              let currentThermostatValue = reducedStateValues["2048"] as! [String: Any]
              var currentTemp: String = ""
              var currentMode = currentThermostatValue["mode"] as? String
              var setpoints = currentThermostatValue["setpoint"] as? [String: String] ?? [:]
              if currentMode == nil && setpoints.count == 1 {
                let keys = [String] (setpoints.keys)
                currentMode = keys[0]
              }
              for sp in setpoints {
                if sp.key == currentMode {
                  currentTemp = sp.value
                }
              }
              
              let reqMode = reqThermostatValue?.mode
              let reqTemp = reqThermostatValue?.temperature as! Int
              let changeMode = reqThermostatValue?.changeMode
              if changeMode == 1 {
                isStateValueEqual = (reqMode == currentMode) && (String(reqTemp) == currentTemp)
              } else {
                isStateValueEqual = (String(reqTemp) == currentTemp)
              }
            }
          }
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
    } else {
      completion("failed");
    }
  }
}
