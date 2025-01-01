import WidgetKit
import AppIntents

struct ListWidgetConfigurationIntent: WidgetConfigurationIntent {
  static var title: LocalizedStringResource { "Configuration" }
  static var description: IntentDescription { "This is an example widget." }
  
  @Parameter(title: "List")
  var snippetList: SnippetList?
  
  init(snippetList: SnippetList) {
    self.snippetList = snippetList;
  }
  
  init() {}
  
  public static var defaultValue: ListWidgetConfigurationIntent {
    let snippet1 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.STORAGE.rawValue, title: "Snippet 1", content: "This is snippet 1!", color_id: 1, order_index: 0, snippets: [])
    let snippet2 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.STORAGE.rawValue, title: "Snippet 2", content: "This is snippet 2!", color_id: 2, order_index: 1, snippets: [])
    let snippetList1  = SnippetList(id: "-1", type: SnippetType.MULTIPLE.rawValue, source: SnippetSource.STORAGE.rawValue, title: "Snippet List 1", content: "This is snippet list 1!", color_id: 3, order_index: 2, snippets: [])
    let snippet3 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.STORAGE.rawValue, title: "Snippet 3", content: "This is snippet 3!", color_id: 4, order_index: 3, snippets: [])
    let snippet4 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.STORAGE.rawValue, title: "Snippet 4", content: "This is snippet 4!", color_id: 5, order_index: 4, snippets: [])
    let snippet5 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.API.rawValue, title: "Snippet 5", content: "This is snippet 5!", color_id: 6, order_index: 0, snippets: [])
    let snippetList2  = SnippetList(id: "-1", type: SnippetType.MULTIPLE.rawValue, source: SnippetSource.API.rawValue, title: "Snippet List 2", content: "This is snippet list 2!", color_id: 7, order_index: 1, snippets: [])
    let snippet6 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.API.rawValue, title: "Snippet 6", content: "This is snippet 6!", color_id: 8, order_index: 2, snippets: [])
    let snippet7 = SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.API.rawValue, title: "Snippet 7", content: "This is snippet 7!", color_id: 9, order_index: 3, snippets: [])
    return ListWidgetConfigurationIntent(snippetList: SnippetList(id: "-1", type: SnippetType.SINGLE.rawValue, source: SnippetSource.API.rawValue, title: "Snippets", content: "These are snippets!", color_id: 100, order_index: 0, snippets: [snippet1, snippet2, snippetList1, snippet3, snippet4, snippet5, snippetList2, snippet6, snippet7]))
  }
}
