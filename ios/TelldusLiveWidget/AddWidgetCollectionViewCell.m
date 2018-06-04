//
//  AddWidgetCollectionViewCell.m
//  TelldusLiveWidget
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import "AddWidgetCollectionViewCell.h"

@implementation AddWidgetCollectionViewCell

-(void)displayButton: (BOOL *)display {
  [self.contentView setHidden:display];
}

@end
