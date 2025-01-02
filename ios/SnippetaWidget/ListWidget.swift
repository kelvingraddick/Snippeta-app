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
        .font(.footnote)
        .bold()
        .truncationMode(.tail).multilineTextAlignment(.leading)
        .frame(maxWidth: .infinity, alignment: .leading)
      
      Spacer().frame(height: 0)
      
      if let snippets = entry.configuration.snippetList!.snippets?
        .sorted(by: { return $0.source != $1.source ?
          $0.source > $1.source : // Descending order for .source ("On device", then "Cloud")
          $0.order_index < $1.order_index // Ascending order for .order_index
        }) {
        let maxSnippets = (widgetFamily == .systemSmall || widgetFamily == .systemMedium) ? 3 : 8;
        ForEach((0...min((maxSnippets - 1), (snippets.count - 1))), id: \.self) {
          getSnippetListButton(snippetList: snippets[$0], themer: entry.themer)
        }
      }
    }
    .containerBackground(for: .widget) {
      Color(.systemGray6)
    }
  }
}

private func getSnippetListButton(snippetList: SnippetList, themer: Themer) -> some View {
  let url = snippetList.type == SnippetType.SINGLE.rawValue ? "snippeta://copy/\(snippetList.id)" : "snippeta://snippets/\(snippetList.id)"
  return
    Link(destination: URL(string: url)!) {
      HStack(alignment: .center, spacing: 5) {
        
        HStack(alignment: .center) {
          Text(snippetList.title)
            .bold()
            .font(.caption).foregroundColor(.primary)
            .lineLimit(1).truncationMode(.tail)
            .padding(5)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(2)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(LinearGradient(colors: themer.getColors(id: snippetList.color_id), startPoint: .leading, endPoint: .trailing))
      .cornerRadius(5)
    }
    .buttonStyle(.borderless)
}

struct ListWidgetAppIntentTimelineProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> ListWidgetTimelineEntry {
    let themer = Themer()
    return ListWidgetTimelineEntry(date: Date(), configuration: ListWidgetConfigurationIntent(), themer: themer)
  }
  
  func snapshot(for configuration: ListWidgetConfigurationIntent, in context: Context) async -> ListWidgetTimelineEntry {
    let themer = Themer()
    return ListWidgetTimelineEntry(date: Date(), configuration: configuration, themer: themer)
  }
  
  func timeline(for configuration: ListWidgetConfigurationIntent, in context: Context) async -> Timeline<ListWidgetTimelineEntry> {
    let themer = Themer()
    let entry = ListWidgetTimelineEntry(date: Date(), configuration: configuration, themer: themer)
    return Timeline(entries: [entry], policy: .never)
  }
}

struct ListWidgetTimelineEntry: TimelineEntry {
  let date: Date
  let configuration: ListWidgetConfigurationIntent
  let themer: Themer
}

#Preview(as: .systemSmall) {
  ListWidget()
} timeline: {
  ListWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}

#Preview(as: .systemMedium) {
  ListWidget()
} timeline: {
  ListWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}

#Preview(as: .systemLarge) {
  ListWidget()
} timeline: {
  ListWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}

#Preview(as: .systemExtraLarge) {
  ListWidget()
} timeline: {
  ListWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}
