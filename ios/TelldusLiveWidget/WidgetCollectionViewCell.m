//
//  WidgetCollectionViewCell.m
//  TelldusLiveWidget
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import "WidgetCollectionViewCell.h"

@implementation WidgetCollectionViewCell

-(void)displayContent: (NSString *)label {
  _deviceLabel.text = label;
  _collectionViewData.layer.cornerRadius = 5.0;
}

-(void)updateCell: (int) index {
  [_onBtn setHidden:YES];
  [_offBtn setHidden:YES];
  [_downBtn setHidden:YES];
  [_upBtn setHidden:YES];
  [_stopBtn setHidden:YES];
  [_minusBtn setHidden:YES];
  [_plusBtn setHidden:YES];
  [_dimmerSlider setHidden:YES];
  [_dimmerSlider setUserInteractionEnabled: NO];
  
  _removeMinusBtn.layer.cornerRadius = 12.5;
  _removeMinusBtn.layer.zPosition = 1.0;
  _removeMinusBtn.tag = index;
}

@end
