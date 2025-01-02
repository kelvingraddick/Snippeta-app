import WidgetKit
import SwiftUI

@main
struct SnippetaWidgetBundle: WidgetBundle {
  var body: some Widget {
    GroupWidget()
    ShortcutWidget()
  }
}
