//
//  WidgetModuleBridge.m
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 08/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetModule, NSObject)

RCT_EXTERN_METHOD(configureWidgetAuthData:(NSDictionary *)authData)
RCT_EXTERN_METHOD(disableAllWidgets)
RCT_EXTERN_METHOD(refreshAllWidgetsData)
RCT_EXTERN_METHOD(setUserDefault:(NSString *)key value:(NSString *)value)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getUserDefault:(NSString *)key)
RCT_EXTERN_METHOD(refreshAllWidgets)
RCT_EXTERN_METHOD(donate :(NSDictionary *) options)
RCT_EXTERN_METHOD(presentShortcut :(NSDictionary *) options callback: (RCTResponseSenderBlock) callback)
RCT_EXTERN_METHOD(getShortcuts : (RCTResponseSenderBlock) callback)
RCT_EXTERN_METHOD(requestPermissionAppTracking)

@end
