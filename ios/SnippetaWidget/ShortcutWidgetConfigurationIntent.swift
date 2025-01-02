import WidgetKit
import AppIntents

struct ShortcutWidgetConfigurationIntent: WidgetConfigurationIntent {
  static var title: LocalizedStringResource { "Configuration" }
  static var description: IntentDescription { "This is an example widget." }

  @Parameter(title: "Group 1")
  var snippetGroup1: SnippetGroup?

  @Parameter(title: "Group 2")
  var snippetGroup2: SnippetGroup?
  
  @Parameter(title: "Group 3")
  var snippetGroup3: SnippetGroup?
  
  @Parameter(title: "Group 4")
  var snippetGroup4: SnippetGroup?

  init(snippetGroup1: SnippetGroup, snippetGroup2: SnippetGroup, snippetGroup3: SnippetGroup, snippetGroup4: SnippetGroup) {
    self.snippetGroup1 = snippetGroup1;
    self.snippetGroup2 = snippetGroup2;
    self.snippetGroup3 = snippetGroup3;
    self.snippetGroup4 = snippetGroup4;
  }

  init() {}

  public static var defaultValue: ShortcutWidgetConfigurationIntent {
    let snippetGroup1 = SnippetGroup(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.STORAGE.rawValue, title: "Example Group 1", content: "This is example group 1.", color_id: -1, order_index: 0, snippets: [])
    let snippetGroup2 = SnippetGroup(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.STORAGE.rawValue, title: "Example Group 2", content: "This is example group 2.", color_id: 1, order_index: 1, snippets: [])
    let snippetGroup3 = SnippetGroup(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.API.rawValue, title: "Example Group 3", content: "This is example group 3.", color_id: 2, order_index: 2, snippets: [])
    let snippetGroup4 = SnippetGroup(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.API.rawValue, title: "Example Group 4", content: "This is example group 4.", color_id: 3, order_index: 3, snippets: [])
    return ShortcutWidgetConfigurationIntent(snippetGroup1: snippetGroup1, snippetGroup2: snippetGroup2, snippetGroup3: snippetGroup3, snippetGroup4: snippetGroup4)
  }
}
