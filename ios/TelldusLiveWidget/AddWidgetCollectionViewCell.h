//
//  AddWidgetCollectionViewCell.h
//  TelldusLiveWidget
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface AddWidgetCollectionViewCell : UICollectionViewCell
@property (weak, nonatomic) IBOutlet UIButton *addWidgetBtn;
@property (weak, nonatomic) IBOutlet UIButton *removeBtn;
@property (weak, nonatomic) IBOutlet UILabel *addWidgetLbl;
@property (weak, nonatomic) IBOutlet UILabel *removeWidgetLbl;

@end
