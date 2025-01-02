import AppIntents
import SwiftUI
import WidgetKit

struct GroupWidget: Widget {
  let kind: String = "GroupWidget"
  var body: some WidgetConfiguration {
    AppIntentConfiguration(kind: kind, intent: GroupWidgetConfigurationIntent.self, provider: GroupWidgetAppIntentTimelineProvider()) {
      entry in GroupWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Snippet Group")
    .description("Select a group of snippets for quick copying to clipboard")
  }
}

struct GroupWidgetEntryView : View {
  var entry: GroupWidgetAppIntentTimelineProvider.Entry
  @Environment(\.widgetFamily) var widgetFamily
  
  var body: some View {
    VStack(alignment: .leading, spacing: 5) {
        
      Text(entry.configuration.snippetGroup?.title ?? "Text")
        .font(.footnote)
        .bold()
        .truncationMode(.tail).multilineTextAlignment(.leading)
        .frame(maxWidth: .infinity, alignment: .leading)
      
      Spacer().frame(height: 0)
      
      if let snippets = entry.configuration.snippetGroup!.snippets?
        .sorted(by: { return $0.source != $1.source ?
          $0.source > $1.source : // Descending order for .source ("On device", then "Cloud")
          $0.order_index < $1.order_index // Ascending order for .order_index
        }) {
        let maxSnippets = (widgetFamily == .systemSmall || widgetFamily == .systemMedium) ? 3 : 8;
        ForEach((0...min((maxSnippets - 1), (snippets.count - 1))), id: \.self) {
          getSnippetGroupButton(snippetGroup: snippets[$0], themer: entry.themer)
        }
      }
    }
    .containerBackground(for: .widget) {
      Color(.systemGray6)
    }
  }
}

private func getSnippetGroupButton(snippetGroup: SnippetGroup, themer: Themer) -> some View {
  let url = snippetGroup.type == SnippetType.SINGLE.rawValue ? "snippeta://copy/\(snippetGroup.id)" : "snippeta://snippets/\(snippetGroup.id)"
  return
    Link(destination: URL(string: url)!) {
      HStack(alignment: .center, spacing: 5) {
        
        HStack(alignment: .center) {
          Text(snippetGroup.title)
            .bold()
            .font(.caption).foregroundColor(.primary)
            .lineLimit(1).truncationMode(.tail)
            .padding(5)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(2)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(LinearGradient(colors: themer.getColors(id: snippetGroup.color_id), startPoint: .leading, endPoint: .trailing))
      .cornerRadius(5)
    }
    .buttonStyle(.borderless)
}

struct GroupWidgetAppIntentTimelineProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> GroupWidgetTimelineEntry {
    let themer = Themer()
    return GroupWidgetTimelineEntry(date: Date(), configuration: GroupWidgetConfigurationIntent(), themer: themer)
  }
  
  func snapshot(for configuration: GroupWidgetConfigurationIntent, in context: Context) async -> GroupWidgetTimelineEntry {
    let themer = Themer()
    return GroupWidgetTimelineEntry(date: Date(), configuration: configuration, themer: themer)
  }
  
  func timeline(for configuration: GroupWidgetConfigurationIntent, in context: Context) async -> Timeline<GroupWidgetTimelineEntry> {
    let themer = Themer()
    let entry = GroupWidgetTimelineEntry(date: Date(), configuration: configuration, themer: themer)
    return Timeline(entries: [entry], policy: .never)
  }
}

struct GroupWidgetTimelineEntry: TimelineEntry {
  let date: Date
  let configuration: GroupWidgetConfigurationIntent
  let themer: Themer
}

#Preview(as: .systemSmall) {
  GroupWidget()
} timeline: {
  GroupWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}

#Preview(as: .systemMedium) {
  GroupWidget()
} timeline: {
  GroupWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}

#Preview(as: .systemLarge) {
  GroupWidget()
} timeline: {
  GroupWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}

#Preview(as: .systemExtraLarge) {
  GroupWidget()
} timeline: {
  GroupWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}
