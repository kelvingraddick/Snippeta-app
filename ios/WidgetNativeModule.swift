//
//  WidgetNativeModule.swift
//  Snippeta
//
//  Created by Kelvin Graddick on 12/23/24.
//

import Foundation
import React
import WidgetKit

@objc(WidgetNativeModule)
class WidgetNativeModule: NSObject {

  @objc
  func updateWidgets() {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
