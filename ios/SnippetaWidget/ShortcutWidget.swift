import AppIntents
import SwiftUI
import WidgetKit

struct ShortcutWidget: Widget {
  let kind: String = "ShortcutWidget"
  var body: some WidgetConfiguration {
    AppIntentConfiguration(kind: kind, intent: ShortcutWidgetConfigurationIntent.self, provider: ShortcutWidgetAppIntentTimelineProvider()) {
      entry in ShortcutWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Shortcuts")
    .description("Add shortcuts for snippet lists, adding a snippet, and search.")
  }
}

struct ShortcutWidgetEntryView : View {
  var entry: ShortcutWidgetAppIntentTimelineProvider.Entry
  @Environment(\.widgetFamily) var widgetFamily

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
        
      if widgetFamily == .systemSmall {
        getSnippetsListButton(snippetList: entry.configuration.snippetList1!)
      } else if widgetFamily == .systemMedium {
        HStack(alignment: .center) {
          getSnippetsListButton(snippetList: entry.configuration.snippetList1!)
          Rectangle().frame(width: 1).foregroundColor(.primary.opacity(0.10))
          getSnippetsListButton(snippetList: entry.configuration.snippetList2!)
        }
        .frame(maxWidth: .infinity)
      } else { // .systemLarge or larger
        VStack(alignment: .leading, spacing: 0) {
          HStack(alignment: .top) {
            getSnippetsListButton(snippetList: entry.configuration.snippetList1!).padding(.top, 10)
            Rectangle().frame(width: 1).foregroundColor(.primary.opacity(0.10))
            getSnippetsListButton(snippetList: entry.configuration.snippetList2!).padding(.top, 10)
          }
          .frame(maxWidth: .infinity)
          Rectangle().frame(height: 1).foregroundColor(.primary.opacity(0.10))
          HStack(alignment: .top) {
            getSnippetsListButton(snippetList: entry.configuration.snippetList3!).padding(.top, 10)
            Rectangle().frame(width: 1).foregroundColor(.primary.opacity(0.10))
            getSnippetsListButton(snippetList: entry.configuration.snippetList4!).padding(.top, 10)
          }
          .frame(maxWidth: .infinity)
        }
        .frame(maxHeight: .infinity)
      }
        
      Spacer()
        
      HStack(alignment: .center) {
        Link(destination: URL(string: "snippeta://search")!) {
          Button(action: {}) {
            Image(systemName: "magnifyingglass")
              .foregroundColor(.primary)
              .frame(maxWidth: .infinity, maxHeight: 30)
              .opacity(0.5)
          }
          .buttonStyle(.plain)
          .background(Color.primary.opacity(0.10))
          .cornerRadius(8)
        }
        
        Link(destination: URL(string: "snippeta://add")!) {
          Button(action: {}) {
            Image(systemName: "plus")
              .foregroundColor(.primary)
              .frame(maxWidth: .infinity, maxHeight: 30)
              .opacity(0.5)
          }
          .buttonStyle(.plain)
          .background(Color.primary.opacity(0.10))
          .cornerRadius(8)
        }
      }
      .frame(maxWidth: .infinity)
    }
    .containerBackground(for: .widget) {
      Color(.systemBackground)
    }
  }
}

private func getSnippetsListButton(snippetList: SnippetList) -> some View {
  return
    Link(destination: URL(string: "snippeta://snippets/\(snippetList.id)")!) {
      HStack(alignment: .center, spacing: 7) {
        Image(systemName: "rectangle.stack.fill")
          .resizable()
          .aspectRatio(contentMode: .fit)
          .frame(height: 20)
          .foregroundStyle(Color(hex: snippetList.colorHexCode) ?? Color.primary)
        
        Text(snippetList.title)
          .font(.footnote)
          .bold()
          .frame(maxWidth: .infinity, alignment: .leading)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
    }
}

struct ShortcutWidgetAppIntentTimelineProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> ShortcutWidgetTimelineEntry {
    ShortcutWidgetTimelineEntry(date: Date(), configuration: ShortcutWidgetConfigurationIntent())
  }
  
  func snapshot(for configuration: ShortcutWidgetConfigurationIntent, in context: Context) async -> ShortcutWidgetTimelineEntry {
    ShortcutWidgetTimelineEntry(date: Date(), configuration: configuration)
  }
  
  func timeline(for configuration: ShortcutWidgetConfigurationIntent, in context: Context) async -> Timeline<ShortcutWidgetTimelineEntry> {
    var entries: [ShortcutWidgetTimelineEntry] = []
    
    // Generate a timeline consisting of five entries an hour apart, starting from the current date.
    let currentDate = Date()
    for hourOffset in 0 ..< 5 {
      let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
      let entry = ShortcutWidgetTimelineEntry(date: entryDate, configuration: configuration)
      entries.append(entry)
    }
    
    return Timeline(entries: entries, policy: .atEnd)
  }
}

struct ShortcutWidgetTimelineEntry: TimelineEntry {
  let date: Date
  let configuration: ShortcutWidgetConfigurationIntent
}

#Preview(as: .systemSmall) {
  ShortcutWidget()
} timeline: {
  ShortcutWidgetTimelineEntry(date: .now, configuration: .defaultValue)
}

#Preview(as: .systemMedium) {
  ShortcutWidget()
} timeline: {
  ShortcutWidgetTimelineEntry(date: .now, configuration: .defaultValue)
}

#Preview(as: .systemLarge) {
  ShortcutWidget()
} timeline: {
  ShortcutWidgetTimelineEntry(date: .now, configuration: .defaultValue)
}

#Preview(as: .systemExtraLarge) {
  ShortcutWidget()
} timeline: {
  ShortcutWidgetTimelineEntry(date: .now, configuration: .defaultValue)
}
