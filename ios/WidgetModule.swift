//
//  WidgetModule.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 08/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import Security

@objc(WidgetModule)
class WidgetModule: NSObject {
  
  let KEYCHAIN_SERVICE = "TelldusKeychain";
  let KEYCHAIN_ACCOUNT = "widgetData";
  
  @objc(configureWidgetAuthData:)
  func configureWidgetAuthData(authData: Dictionary<String, Any>) -> Void {
    let stringifiedData = Utilities().convertDictionaryToString(dict: authData)
    let status = setSecureData(data: stringifiedData)
    if (status) {
      APICacher().cacheAPIData() {
        WidgetUtils.refreshAllWidgets()
      }
    }
  }
  
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
  
  @objc(disableAllWidgets)
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
    WidgetUtils.refreshAllWidgets()
  }
}
