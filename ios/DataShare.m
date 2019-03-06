//
//  DataShare.m
//  TelldusLiveApp
//
//  Created by micra on 06/03/19.
//  Copyright © 2019 Telldus Technologies AB. All rights reserved.
//

#import "DataShare.h"

@implementation DataShare

// To export a module named DataShare
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setBool:(BOOL)value key:(NSString *)key group:(NSString *)groupId )
{
  NSUserDefaults *dataInfo = [[NSUserDefaults alloc] initWithSuiteName:groupId];
  [dataInfo setBool:value forKey:key];
  [dataInfo synchronize];
}

@end
