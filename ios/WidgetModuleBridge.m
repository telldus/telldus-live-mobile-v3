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

RCT_EXTERN_METHOD(configureWidgetAuthData:(NSString *)accessToken
                  refreshToken:(NSString *)refreshToken
                  expiresIn:(NSString *)expiresIn
                  clientId:(NSString *)clientId
                  clientSecret:(NSString *)clientSecret
                  userId:(NSString *)userId
                  pro:(nonnull NSNumber *)pro)

@end