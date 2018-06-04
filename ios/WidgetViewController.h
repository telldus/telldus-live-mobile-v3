//
//  WidgetViewController.h
//  TelldusLiveApp
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "WidgetDA.h"

@interface WidgetViewController : UIViewController <UIPickerViewDelegate, UIPickerViewDataSource, NSURLConnectionDelegate>

@property (weak, nonatomic) IBOutlet UIView *addDevLblView;
@property (weak, nonatomic) IBOutlet UITextField *selectDevices;
@property (weak, nonatomic) IBOutlet UIButton *cnfrmBtmLbl;
@property (weak, nonatomic) IBOutlet UIButton *cnclBtnLbl;

@property (weak, nonatomic) IBOutlet UINavigationBar *navBar;

@end
