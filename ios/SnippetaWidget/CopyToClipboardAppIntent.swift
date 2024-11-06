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
  static var title: LocalizedStringResource = "Copy to clipboard"
  static var description = IntentDescription("Copy text to clipboard.")

  @Parameter(title: "Snippet Id")
  var snippetId: String
  
  @Parameter(title: "Text to copy")
  var text: String

  init(snippetId: String, text: String) {
    self.snippetId = snippetId
    self.text = text
  }

  init() {}

  func perform() async throws -> some IntentResult {
    UIPasteboard.general.string = text
    
    let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared")
    sharedDefaults?.set(snippetId, forKey: "copiedSnippetId")
    
    WidgetCenter.shared.reloadTimelines(ofKind: "ListWidget")
    
    return .result()
  }
}
