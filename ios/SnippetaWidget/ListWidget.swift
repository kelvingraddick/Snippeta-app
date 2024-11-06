import AppIntents
import SwiftUI
import WidgetKit

struct ListWidget: Widget {
  let kind: String = "ListWidget"
  var body: some WidgetConfiguration {
    AppIntentConfiguration(kind: kind, intent: ListWidgetConfigurationIntent.self, provider: ListWidgetAppIntentTimelineProvider()) {
      entry in ListWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Snippet List")
    .description("Select a list of snippets for quick copying to clipboard")
  }
}

struct ListWidgetEntryView : View {
  var entry: ListWidgetAppIntentTimelineProvider.Entry
  @Environment(\.widgetFamily) var widgetFamily
  
  var body: some View {
    VStack(alignment: .leading, spacing: 5) {
        
      Text(entry.configuration.snippetList?.title ?? "Text")
        .font(.headline)
        .truncationMode(.tail).multilineTextAlignment(.leading)
        .frame(maxWidth: .infinity, alignment: .leading)
        .foregroundStyle(Color(hex: entry.configuration.snippetList!.colorHexCode) ?? Color.primary)
      
      Spacer().frame(height: 0)
      
      if let snippets = entry.configuration.snippetList!.snippets {
        let maxSnippets = (widgetFamily == .systemSmall || widgetFamily == .systemMedium) ? 3 : 8;
        ForEach((0...min((maxSnippets - 1), (snippets.count - 1))), id: \.self) {
          getSnippetListButton(snippetList: snippets[$0], copiedSnippetId: entry.copiedSnippetId)
        }
      }
    }
    .containerBackground(for: .widget) {
      Color(.systemGray6)
    }
  }
}

private func getSnippetListButton(snippetList: SnippetList, copiedSnippetId: String?) -> some View {
  return
    Button(intent: CopyToClipboardAppIntent(snippetId: snippetList.id, text: snippetList.content)) {
      HStack(alignment: .center, spacing: 7) {
        
        Rectangle().frame(width: 12).foregroundColor(Color(hex: snippetList.colorHexCode) ?? Color.primary);
        
        HStack(alignment: .center) {
          Text(snippetList.id == copiedSnippetId ? "Copied!" : snippetList.title)
            .font(.caption).foregroundColor(.primary)
            .truncationMode(.tail).multilineTextAlignment(.leading)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(2)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(Color("WidgetButtonColor"))
      .cornerRadius(3)
    }
    .buttonStyle(.borderless)
}

struct ListWidgetAppIntentTimelineProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> ListWidgetTimelineEntry {
    ListWidgetTimelineEntry(date: Date(), configuration: ListWidgetConfigurationIntent(), copiedSnippetId: nil)
  }
  
  func snapshot(for configuration: ListWidgetConfigurationIntent, in context: Context) async -> ListWidgetTimelineEntry {
    ListWidgetTimelineEntry(date: Date(), configuration: configuration, copiedSnippetId: nil)
  }
  
  func timeline(for configuration: ListWidgetConfigurationIntent, in context: Context) async -> Timeline<ListWidgetTimelineEntry> {
    var entries: [ListWidgetTimelineEntry] = []
    var currentDate = Date()
    
    // Handle if a snippet was just copied (notification message)
    let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared")
    let copiedSnippetId = sharedDefaults?.string(forKey: "copiedSnippetId")
    if (copiedSnippetId != nil) {
      let startDate = Date()
      let endDate = startDate.addingTimeInterval(3)
      currentDate = endDate
      
      let copiedSnippetEntry = ListWidgetTimelineEntry(date: startDate, configuration: configuration, copiedSnippetId: copiedSnippetId)
      entries.append(copiedSnippetEntry)
      
      DispatchQueue.main.asyncAfter(deadline: DispatchTime.now() + endDate.timeIntervalSinceNow) {
        let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared")
        sharedDefaults?.removeObject(forKey: "copiedSnippetId")
      }
    }
    
    // Generate a timeline consisting of five entries an hour apart, starting from the current date.
    for hourOffset in 0 ..< 5 {
      let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
      let entry = ListWidgetTimelineEntry(date: entryDate, configuration: configuration, copiedSnippetId: nil)
      entries.append(entry)
    }
    
    return Timeline(entries: entries, policy: .atEnd)
  }
}

struct ListWidgetTimelineEntry: TimelineEntry {
  let date: Date
  let configuration: ListWidgetConfigurationIntent
  let copiedSnippetId: String?
}

#Preview(as: .systemSmall) {
  ListWidget()
} timeline: {
  ListWidgetTimelineEntry(date: .now, configuration: .defaultValue, copiedSnippetId: nil)
}

#Preview(as: .systemMedium) {
  ListWidget()
} timeline: {
  ListWidgetTimelineEntry(date: .now, configuration: .defaultValue, copiedSnippetId: nil)
}

#Preview(as: .systemLarge) {
  ListWidget()
} timeline: {
  ListWidgetTimelineEntry(date: .now, configuration: .defaultValue, copiedSnippetId: nil)
}

#Preview(as: .systemExtraLarge) {
  ListWidget()
} timeline: {
  ListWidgetTimelineEntry(date: .now, configuration: .defaultValue, copiedSnippetId: nil)
}
