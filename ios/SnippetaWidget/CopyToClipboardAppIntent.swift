//
//  CopyToClipboardIntent.swift
//  Snippeta
//
//  Created by Kelvin Graddick on 11/2/24.
//

import AppIntents
import UIKit
import WidgetKit

struct CopyToClipboardAppIntent: AppIntent {
  static var title: LocalizedStringResource = "Copy Text to Clipboard"

  @Parameter(title: "Text to Copy")
  var text: String

  init(text: String) {
    self.text = text;
  }

  init() {}

  func perform() async throws -> some IntentResult {
    UIPasteboard.general.string = text
    return .result()
  }
}
