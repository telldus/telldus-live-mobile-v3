//
//  AddWidgetCollectionViewCell.swift
//  TelldusDeviceLive
//

import UIKit

class AddWidgetCollectionViewCell: UICollectionViewCell {
    
    @IBOutlet weak var addWidgetBtn: UIButton!
    @IBOutlet weak var addWidgetLbl: UILabel!
    @IBOutlet weak var removeBtn: UIButton!
    @IBOutlet weak var removeWidgetLbl: UILabel!
    
    func displayButton(display: Bool) {
        print(display)
        self.contentView.isHidden = display
    }
}
