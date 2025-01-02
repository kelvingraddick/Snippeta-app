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
    .description("Add shortcuts for snippet groups, adding a snippet, and search.")
  }
}

struct ShortcutWidgetEntryView : View {
  var entry: ShortcutWidgetAppIntentTimelineProvider.Entry
  @Environment(\.widgetFamily) var widgetFamily

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
        
      if widgetFamily == .systemSmall {
        getSnippetsGroupButton(snippetGroup: entry.configuration.snippetGroup1!, themer: entry.themer)
      } else if widgetFamily == .systemMedium {
        HStack(alignment: .center) {
          getSnippetsGroupButton(snippetGroup: entry.configuration.snippetGroup1!, themer: entry.themer)
          Rectangle().frame(width: 1).foregroundColor(.primary.opacity(0.10))
          getSnippetsGroupButton(snippetGroup: entry.configuration.snippetGroup2!, themer: entry.themer)
        }
        .frame(maxWidth: .infinity)
      } else { // .systemLarge or larger
        VStack(alignment: .leading, spacing: 0) {
          HStack(alignment: .top) {
            getSnippetsGroupButton(snippetGroup: entry.configuration.snippetGroup1!, themer: entry.themer).padding(.top, 10)
            Rectangle().frame(width: 1).foregroundColor(.primary.opacity(0.10))
            getSnippetsGroupButton(snippetGroup: entry.configuration.snippetGroup2!, themer: entry.themer).padding(.top, 10)
          }
          .frame(maxWidth: .infinity)
          Rectangle().frame(height: 1).foregroundColor(.primary.opacity(0.10))
          HStack(alignment: .top) {
            getSnippetsGroupButton(snippetGroup: entry.configuration.snippetGroup3!, themer: entry.themer).padding(.top, 10)
            Rectangle().frame(width: 1).foregroundColor(.primary.opacity(0.10))
            getSnippetsGroupButton(snippetGroup: entry.configuration.snippetGroup4!, themer: entry.themer).padding(.top, 10)
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

private func getSnippetsGroupButton(snippetGroup: SnippetGroup, themer: Themer) -> some View {
  return
    Link(destination: URL(string: "snippeta://snippets/\(snippetGroup.id)")!) {
      HStack(alignment: .center, spacing: 7) {
        Image(systemName: "rectangle.stack.fill")
          .resizable()
          .aspectRatio(contentMode: .fit)
          .frame(height: 20)
          .foregroundStyle(themer.getColor(id: snippetGroup.color_id))
        
        Text(snippetGroup.title)
          .font(.footnote)
          .bold()
          .frame(maxWidth: .infinity, alignment: .leading)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
    }
}

struct ShortcutWidgetAppIntentTimelineProvider: AppIntentTimelineProvider {
  func placeholder(in context: Context) -> ShortcutWidgetTimelineEntry {
    let themer = Themer()
    return ShortcutWidgetTimelineEntry(date: Date(), configuration: ShortcutWidgetConfigurationIntent(), themer: themer)
  }
  
  func snapshot(for configuration: ShortcutWidgetConfigurationIntent, in context: Context) async -> ShortcutWidgetTimelineEntry {
    let themer = Themer()
    return ShortcutWidgetTimelineEntry(date: Date(), configuration: configuration, themer: themer)
  }
  
  func timeline(for configuration: ShortcutWidgetConfigurationIntent, in context: Context) async -> Timeline<ShortcutWidgetTimelineEntry> {
    let themer = Themer()
    let entry = ShortcutWidgetTimelineEntry(date: Date(), configuration: configuration, themer: themer)
    return Timeline(entries: [entry], policy: .never)
  }
}

struct ShortcutWidgetTimelineEntry: TimelineEntry {
  let date: Date
  let configuration: ShortcutWidgetConfigurationIntent
  let themer: Themer
}

#Preview(as: .systemSmall) {
  ShortcutWidget()
} timeline: {
  ShortcutWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}

#Preview(as: .systemMedium) {
  ShortcutWidget()
} timeline: {
  ShortcutWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}

#Preview(as: .systemLarge) {
  ShortcutWidget()
} timeline: {
  ShortcutWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}

#Preview(as: .systemExtraLarge) {
  ShortcutWidget()
} timeline: {
  ShortcutWidgetTimelineEntry(date: .now, configuration: .defaultValue, themer: Themer())
}
