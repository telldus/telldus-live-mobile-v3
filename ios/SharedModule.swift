//
//  SharedModule.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 04/12/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import Security

class SharedModule {
  
  let KEYCHAIN_SERVICE = "TelldusKeychain";
  let KEYCHAIN_ACCOUNT = "widgetData";
  
  var userDefaults = UserDefaults(suiteName: "group.com.telldus.live.mobile")!
  
  func configureWidgetAuthData(authData: Dictionary<String, Any>) -> Void {
    let stringifiedData = Utilities().convertDictionaryToString(dict: authData)
    let status = setSecureData(data: stringifiedData)
    if status {
      if #available(iOS 12.0, *) {
        WidgetUtils.refreshAllWidgets()
      } else {
        // Fallback on earlier versions
      }
    }
  }
  
  @discardableResult
  func setSecureData(data: String) -> Bool {
    var status = 1;
    let hasNotStored = getSecureData() == nil
    if (hasNotStored) {
      let keychainItemQuery = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrService: KEYCHAIN_SERVICE,
        kSecAttrAccount: KEYCHAIN_ACCOUNT,
        kSecValueData: data.data(using: .utf8)!,
      ] as CFDictionary
      status = Int(SecItemAdd(keychainItemQuery, nil))
    } else {
      status = updateSecureData(data: data)
    }
    return status == 0;
  }
  
  // IMP: Do not update with partial data! Should have all keys set by 'configureWidgetAuthData'
  @discardableResult
  func updateSecureData(data: String) -> Int {
    let keychainItemQuery = [
      kSecClass: kSecClassGenericPassword,
      kSecAttrService: KEYCHAIN_SERVICE,
      kSecAttrAccount: KEYCHAIN_ACCOUNT,
    ] as CFDictionary
    let updateFields = [
      kSecValueData: data.data(using: .utf8)!,
    ] as CFDictionary
    return Int(SecItemUpdate(keychainItemQuery, updateFields))
  }
  
  func getSecureData() -> String? {
    let query = [
      kSecClass: kSecClassGenericPassword,
      kSecReturnAttributes: true,
      kSecReturnData: true,
      kSecAttrService: KEYCHAIN_SERVICE,
      kSecAttrAccount: KEYCHAIN_ACCOUNT,
    ] as CFDictionary
    
    var result: AnyObject?
    let status = SecItemCopyMatching(query, &result)
    guard status == 0 else {
      return nil;
    }
    let dic = result as! NSDictionary
    let passwordData = dic[kSecValueData] as! Data
    return String(data: passwordData, encoding: .utf8)!
  }
  
  func disableAllWidgets() -> Void {
    let authData: Dictionary<String, Any> = [
      "accessToken": "null",
      "refreshToken": "null",
      "expiresIn": "null",
      "clientId": "null",
      "clientSecret": "null",
      "email": "null",
      "pro": -1,
      "uuid": "null",
    ]
    let stringifiedData = Utilities().convertDictionaryToString(dict: authData)
    updateSecureData(data: stringifiedData)
    if #available(iOS 12.0, *) {
      WidgetUtils.refreshAllWidgets()
    } else {
      // Fallback on earlier versions
    }
  }
  
  func refreshAllWidgetsData() {
    APICacher().cacheAPIData() {
      if #available(iOS 12.0, *) {
        WidgetUtils.refreshAllWidgets()
      } else {
        // Fallback on earlier versions
      }
    }
  }
  
  func refreshAllWidgets() {
    if #available(iOS 12.0, *) {
      WidgetUtils.refreshAllWidgets()
    } else {
      // Fallback on earlier versions
    }
  }
  
  func setUserDefault(key: NSString, value: NSString) {
    userDefaults.set(value, forKey: key as String)
  }
  
  func getUserDefault(key: NSString) -> NSString {
    let value = userDefaults.string(forKey: key as String) ?? "0"
    return value as NSString
  }
}
