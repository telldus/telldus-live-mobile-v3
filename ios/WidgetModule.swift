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

  @objc(configureWidgetAuthData:refreshToken:expiresIn:clientId:clientSecret:userId:pro:)
  func configureWidgetAuthData(
    accessToken: String,
    refreshToken: String,
    expiresIn: String,
    clientId: String,
    clientSecret: String,
    userId: String,
    pro: NSNumber
    ) -> Void {
    let dict: NSDictionary = [
        "accessToken": accessToken,
        "refreshToken": refreshToken,
        "expiresIn": expiresIn,
        "clientId": clientId,
        "clientSecret": clientSecret,
        "userId": userId,
        "pro": pro,
    ]
    let stringifiedData = convertDictionaryToString(dict: dict)
    setSecureData(data: stringifiedData)
  }
  
  func convertDictionaryToString (dict: NSDictionary) -> String {
    var data: Data?;
    do {
        data = try JSONSerialization.data(withJSONObject: dict)
    } catch {
      
    }
    if let data = data {
      return (NSString(data: data, encoding: String.Encoding.utf8.rawValue) ?? "") as String
    }
    return "";
  }
  
  func setSecureData(data: String) -> Bool {
    let keychainItemQuery = [
      kSecClass: kSecClassGenericPassword,
      kSecAttrService: KEYCHAIN_SERVICE,
      kSecAttrAccount: KEYCHAIN_ACCOUNT,
    ] as CFDictionary
    
    let updateFields = [
      kSecValueData: data.data(using: .utf8)!,
    ] as CFDictionary

    let status = SecItemUpdate(keychainItemQuery, updateFields)
    return status == 0;
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
}
