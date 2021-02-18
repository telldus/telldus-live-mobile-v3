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
import DeviceActionShortcut
import UIKit
import Intents
import IntentsUI
import CoreSpotlight

enum VoiceShortcutMutationStatus: String {
  case cancelled = "cancelled"
  case added = "added"
  case updated = "updated"
  case deleted = "deleted"
}

@objc(WidgetModule)
class WidgetModule: NSObject, INUIAddVoiceShortcutViewControllerDelegate, INUIEditVoiceShortcutViewControllerDelegate {
  
  var presenterViewController: UIViewController?
  var voiceShortcuts: Array<NSObject> = [] // Actually it's INVoiceShortcut, but that way we would have to break compatibility with simple NSUserActivity behaviour
  var presentShortcutCallback: RCTResponseSenderBlock?
  
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
  func donate(jsonOptions: Dictionary<String, Any>) {
    if #available(iOS 12.0, *) {
      let intent = DeviceActionShortcutIntent()
      
      let phrase = jsonOptions["phrase"] as! String
      let deviceId = jsonOptions["deviceId"] as! String
      let method = jsonOptions["method"] as! String
      let dimValue = jsonOptions["dimValue"] as? NSNumber
      let rgbValue = jsonOptions["rgbValue"] as? [String: NSNumber] ?? [:]
      let thermostatValue = jsonOptions["thermostatValue"] as? [String: Any] ?? [:]
      
      let r = rgbValue["r"]
      let g = rgbValue["g"]
      let b = rgbValue["b"]
      let _rgbValue: RGBValue = RGBValue(
        identifier: "rgbValue",
        display: "rgb value",
        pronunciationHint: "rgb value"
      )
      
      let mode = thermostatValue["mode"] as? String ?? ""
      let temperature = thermostatValue["temperature"] as? NSNumber
      let scale = thermostatValue["scale"] as? NSNumber ?? 0
      let changeMode = thermostatValue["changeMode"] as? NSNumber ?? 0
      let _thermostatValue: ThermostatValue = ThermostatValue(identifier: "_thermostatValue", display: "thermostat value")
      
      if #available(iOS 13.0, *) {
        _rgbValue.r = r
        _rgbValue.g = g;
        _rgbValue.b = b;
        
        _thermostatValue.mode = mode;
        _thermostatValue.temperature = temperature;
        _thermostatValue.scale = scale;
        _thermostatValue.changeMode = changeMode;
      } else {
        // Fallback on earlier versions
      };
      
      intent.suggestedInvocationPhrase = "phrase"
      intent.phrase = phrase
      intent.deviceId = deviceId
      intent.method = method
      intent.dimValue = dimValue
      intent.rgbValue = _rgbValue
      intent.thermostatValue = _thermostatValue
      
      let interaction = INInteraction(intent: intent, response: nil)
      
      interaction.donate { (error) in
        if error != nil {
          if let error = error as NSError? {
            print("TEST Interaction donation failed: \(error.description)")
          } else {
            print("TEST Successfully donated interaction")
          }
        }
      }
    } else {
      // Fallback on earlier versions
    }
  }
  
  @objc(presentShortcut:callback:)
  func presentShortcut(jsonOptions: Dictionary<String, Any>, callback: @escaping RCTResponseSenderBlock) {
    if #available(iOS 12.0, *) {
      self.presentShortcutCallback = callback
      
      let intent = DeviceActionShortcutIntent()
      
      let phrase = jsonOptions["phrase"] as! String
      let deviceId = jsonOptions["deviceId"] as! String
      let method = jsonOptions["method"] as! String
      let dimValue = jsonOptions["dimValue"] as? NSNumber
      let rgbValue = jsonOptions["rgbValue"] as? [String: NSNumber] ?? [:]
      let thermostatValue = jsonOptions["thermostatValue"] as? [String: Any] ?? [:]
      let identifier = jsonOptions["identifier"] as? String
      
      let r = rgbValue["r"]
      let g = rgbValue["g"]
      let b = rgbValue["b"]
      let _rgbValue: RGBValue = RGBValue(
        identifier: "rgbValue",
        display: "rgb value",
        pronunciationHint: "rgb value"
      )
      
      let mode = thermostatValue["mode"] as? String ?? ""
      let temperature = thermostatValue["temperature"] as? NSNumber
      let scale = thermostatValue["scale"] as? NSNumber ?? 0
      let changeMode = thermostatValue["changeMode"] as? NSNumber ?? 0
      let _thermostatValue: ThermostatValue = ThermostatValue(
        identifier: "thermostatValue",
        display: "thermostat value",
        pronunciationHint: "thermostat value"
        )
      
      if #available(iOS 13.0, *) {
        _rgbValue.r = r
        _rgbValue.g = g;
        _rgbValue.b = b;
        
        _thermostatValue.mode = mode;
        _thermostatValue.temperature = temperature;
        _thermostatValue.scale = scale;
        _thermostatValue.changeMode = changeMode;
      } else {
        // Fallback on earlier versions
      };
      
      intent.phrase = phrase
      intent.deviceId = deviceId
      intent.method = method
      intent.dimValue = dimValue
      intent.rgbValue = _rgbValue
      intent.thermostatValue = _thermostatValue
      
      guard let shortcut = INShortcut(intent: intent) else {
        return
      }
      
      var addedVoiceShortcut: INVoiceShortcut?
      INVoiceShortcutCenter.shared.getAllVoiceShortcuts { (voiceShortcutsFromCenter, error) in
        if let voiceShortcutsFromCenter = voiceShortcutsFromCenter {
          for sc in voiceShortcutsFromCenter {
            if identifier != nil, sc.identifier.uuidString == identifier {
              addedVoiceShortcut = sc
            }
          }
        }
        
        DispatchQueue.main.async {
          // The shortcut was not added yet, so present a form to add it
          if (addedVoiceShortcut == nil) {
            self.presenterViewController = INUIAddVoiceShortcutViewController(shortcut: shortcut)
            self.presenterViewController!.modalPresentationStyle = .formSheet
            (self.presenterViewController as! INUIAddVoiceShortcutViewController).delegate = self
          } // The shortcut was already added, so we present a form to edit it
          else {
            self.presenterViewController = INUIEditVoiceShortcutViewController(voiceShortcut: addedVoiceShortcut!)
            self.presenterViewController!.modalPresentationStyle = .formSheet
            (self.presenterViewController as! INUIEditVoiceShortcutViewController).delegate = self
          }
          
          UIApplication.shared.keyWindow!.rootViewController!.present(self.presenterViewController!, animated: true, completion: nil)
        }
      }
    } else {
      // Fallback on earlier versions
    }
  }
  
  @objc(getShortcuts:)
  func getShortcuts(callback: @escaping RCTResponseSenderBlock) {
    if #available(iOS 12.0, *) {
      INVoiceShortcutCenter.shared.getAllVoiceShortcuts { (voiceShortcutsFromCenter, error) in
        if let voiceShortcutsFromCenter = voiceShortcutsFromCenter {
          var shortcuts: [[String: Any]] = []
          for sc in voiceShortcutsFromCenter {
            var userInfo: [String: Any] = [:]
            if let intent = sc.shortcut.intent as? DeviceActionShortcutIntent {
              userInfo = [
                "phrase": intent.phrase,
                "deviceId": intent.deviceId,
                "method": intent.method,
                "dimValue": intent.dimValue,
                "rgbValue": intent.rgbValue,
                "thermostatValue": intent.thermostatValue,
              ]
            }
            shortcuts.append([
              "identifier": sc.identifier.uuidString,
              "invocationPhrase": sc.invocationPhrase,
              "userInfo": userInfo,
            ])
          }
          callback([["shortcuts":shortcuts]])
        } else {
          if let error = error as NSError? {
            callback([["error":error]])
            return
          }
        }
      }
    } else {
      // Fallback on earlier versions
      let shortcuts: [Any] = []
      callback([["shortcuts":shortcuts]])
    }
  }
  
  @available(iOS 12.0, *)
  func addVoiceShortcutViewController(_ controller: INUIAddVoiceShortcutViewController, didFinishWith voiceShortcut: INVoiceShortcut?, error: Error?) {
    // Shortcut was added
    if (voiceShortcut != nil) {
      voiceShortcuts.append(voiceShortcut!)
    }
    dismissPresenter(.added, withShortcut: voiceShortcut)
  }
  
  @available(iOS 12.0, *)
  func addVoiceShortcutViewControllerDidCancel(_ controller: INUIAddVoiceShortcutViewController) {
    // Adding shortcut cancelled
    dismissPresenter(.cancelled, withShortcut: nil)
  }
  
  @available(iOS 12.0, *)
  func editVoiceShortcutViewController(_ controller: INUIEditVoiceShortcutViewController, didUpdate voiceShortcut: INVoiceShortcut?, error: Error?) {
    // Shortcut was updated
    
    if (voiceShortcut != nil) {
      // Update the array with the shortcut that was updated, just so we don't have to loop over the existing shortcuts again
      let indexOfUpdatedShortcut = (voiceShortcuts as! Array<INVoiceShortcut>).firstIndex { (shortcut) -> Bool in
        return shortcut.identifier == voiceShortcut!.identifier
      }
      
      if (indexOfUpdatedShortcut != nil) {
        voiceShortcuts[indexOfUpdatedShortcut!] = voiceShortcut!
      }
    }
    
    dismissPresenter(.updated, withShortcut: voiceShortcut)
  }
  
  @available(iOS 12.0, *)
  func editVoiceShortcutViewController(_ controller: INUIEditVoiceShortcutViewController, didDeleteVoiceShortcutWithIdentifier deletedVoiceShortcutIdentifier: UUID) {
    // Shortcut was deleted
    
    // Keep a reference so we can notify JS about what the invocationPhrase was for this shortcut
    var deletedShortcut: INVoiceShortcut? = nil
    
    // Remove the deleted shortcut from the array
    let indexOfDeletedShortcut = (voiceShortcuts as! Array<INVoiceShortcut>).firstIndex { (shortcut) -> Bool in
      return shortcut.identifier == deletedVoiceShortcutIdentifier
    }
    
    if (indexOfDeletedShortcut != nil) {
      deletedShortcut = voiceShortcuts[indexOfDeletedShortcut!] as? INVoiceShortcut
      voiceShortcuts.remove(at: indexOfDeletedShortcut!)
    }
    
    dismissPresenter(.deleted, withShortcut: deletedShortcut)
  }
  
  @available(iOS 12.0, *)
  func editVoiceShortcutViewControllerDidCancel(_ controller: INUIEditVoiceShortcutViewController) {
    // Shortcut edit was cancelled
    dismissPresenter(.cancelled, withShortcut: nil)
  }
  
  @available(iOS 12.0, *)
  func dismissPresenter(_ status: VoiceShortcutMutationStatus, withShortcut voiceShortcut: INVoiceShortcut?) {
    DispatchQueue.main.async {
      self.presenterViewController?.dismiss(animated: true, completion: nil)
      self.presenterViewController = nil
      self.presentShortcutCallback?([
        ["status": status.rawValue, "phrase": voiceShortcut?.invocationPhrase]
      ])
      self.presentShortcutCallback = nil
    }
  }
}
