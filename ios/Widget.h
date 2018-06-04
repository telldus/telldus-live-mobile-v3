
//
//  Widget.h
//  TelldusLiveApp
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface Widget : NSObject

@property (nonatomic) NSString *name;
@property (nonatomic) NSString *clientDeviceId;
@property (nonatomic) NSString *type;
@property (nonatomic) NSString *client;
@property (nonatomic) NSString *identifier;
@property (nonatomic) NSString *clientName;
@property (nonatomic) NSString *metadataHash;
@property (nonatomic) NSString *statevalue;
@property (nonatomic) NSString *devType;
@property (nonatomic) int state;
@property (nonatomic) int ignored;
@property (nonatomic) int methods;
@property (nonatomic) int editable;
@property (nonatomic) int online;

@end
