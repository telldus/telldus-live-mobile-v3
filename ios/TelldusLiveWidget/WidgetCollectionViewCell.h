//
//  WidgetCollectionViewCell.h
//  TelldusLiveWidget
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface WidgetCollectionViewCell : UICollectionViewCell
@property (weak, nonatomic) IBOutlet UILabel *deviceLabel;
@property (weak, nonatomic) IBOutlet UIView *btnView;
@property (weak, nonatomic) IBOutlet UIButton *onBtn;
@property (weak, nonatomic) IBOutlet UIButton *offBtn;
@property (weak, nonatomic) IBOutlet UIButton *downBtn;
@property (weak, nonatomic) IBOutlet UIButton *upBtn;
@property (weak, nonatomic) IBOutlet UIButton *stopBtn;
@property (weak, nonatomic) IBOutlet UIButton *plusBtn;
@property (weak, nonatomic) IBOutlet UIButton *minusBtn;
@property (weak, nonatomic) IBOutlet UISlider *dimmerSlider;
@property (weak, nonatomic) IBOutlet UIView *collectionViewData;
@property (weak, nonatomic) IBOutlet UIButton *removeMinusBtn;


-(void)updateCell: (int) index;
-(void)displayContent: (NSString *)label;

@end
