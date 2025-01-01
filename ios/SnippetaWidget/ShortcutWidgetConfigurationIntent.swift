import WidgetKit
import AppIntents

struct ShortcutWidgetConfigurationIntent: WidgetConfigurationIntent {
  static var title: LocalizedStringResource { "Configuration" }
  static var description: IntentDescription { "This is an example widget." }

  @Parameter(title: "List 1")
  var snippetList1: SnippetList?

  @Parameter(title: "List 2")
  var snippetList2: SnippetList?
  
  @Parameter(title: "List 3")
  var snippetList3: SnippetList?
  
  @Parameter(title: "List 4")
  var snippetList4: SnippetList?

  init(snippetList1: SnippetList, snippetList2: SnippetList, snippetList3: SnippetList, snippetList4: SnippetList) {
    self.snippetList1 = snippetList1;
    self.snippetList2 = snippetList2;
    self.snippetList3 = snippetList3;
    self.snippetList4 = snippetList4;
  }

  init() {}

  public static var defaultValue: ShortcutWidgetConfigurationIntent {
    let snippetList1 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.STORAGE.rawValue, title: "Example List 1", content: "This is example list 1.", color_id: -1, order_index: 0, snippets: [])
    let snippetList2 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.STORAGE.rawValue, title: "Example List 2", content: "This is example list 2.", color_id: 1, order_index: 1, snippets: [])
    let snippetList3 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.API.rawValue, title: "Example List 3", content: "This is example list 3.", color_id: 2, order_index: 2, snippets: [])
    let snippetList4 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.API.rawValue, title: "Example List 4", content: "This is example list 4.", color_id: 3, order_index: 3, snippets: [])
    return ShortcutWidgetConfigurationIntent(snippetList1: snippetList1, snippetList2: snippetList2, snippetList3: snippetList3, snippetList4: snippetList4)
  }
}
