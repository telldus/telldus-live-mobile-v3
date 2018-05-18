//
//  WidgetCollectionViewCell.swift
//  TelldusDeviceLive
//

import UIKit

class WidgetCollectionViewCell: UICollectionViewCell {
    
    @IBOutlet weak var deviceLabel: UILabel!
    @IBOutlet weak var btnView: UIView!
    @IBOutlet weak var onBtn: UIButton!
    @IBOutlet weak var offBtn: UIButton!
    @IBOutlet weak var downBtn: UIButton!
    @IBOutlet weak var upBtn: UIButton!
    @IBOutlet weak var stopBtn: UIButton!
    @IBOutlet weak var minusBtn: UIButton!
    @IBOutlet weak var plusBtn: UIButton!
    @IBOutlet weak var dimmerSlider: UISlider!
    @IBOutlet weak var collectionViewData: UIView!
    @IBOutlet weak var removeMinusBtn: UIButton!
    
    func displayContent(label: String) {
        deviceLabel.text = label
        collectionViewData.layer.cornerRadius = 5.0
    }
    
}
