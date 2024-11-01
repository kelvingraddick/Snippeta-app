//
//  SnippetaWidget.swift
//  SnippetaWidget
//
//  Created by Kelvin Graddick on 10/16/24.
//

import WidgetKit
import SwiftUI

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
      SimpleEntry(date: Date(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
          let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }

//    func relevances() async -> WidgetRelevances<ConfigurationAppIntent> {
//        // Generate a list containing the contexts this widget is relevant in.
//    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
}

struct SnippetaWidgetEntryView : View {
    var entry: Provider.Entry
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

func getSnippetsListButton(snippetList: SnippetList) -> some View {
  return
    Link(destination: URL(string: "snippeta://snippets/\(snippetList.id)")!) {
      HStack(alignment: .center, spacing: 7) {
        Image(systemName: "rectangle.stack.fill")
          .resizable()
          .aspectRatio(contentMode: .fit)
          .frame(height: 20)
          .foregroundStyle(Color(hex: snippetList.colorHexCode)!)
        
        Text(snippetList.title)
          .font(.footnote)
          .bold()
          .frame(maxWidth: .infinity, alignment: .leading)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
    }
}

/*
let backgroundGradient = LinearGradient(
    colors: [Color(hexStringToUIColor(hex: "fe9567")), Color(hexStringToUIColor(hex: "ff6264"))],
    startPoint: .topLeading, endPoint: .bottomTrailing)
*/

func hexStringToUIColor (hex:String) -> UIColor {
    var cString:String = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()

    if (cString.hasPrefix("#")) {
        cString.remove(at: cString.startIndex)
    }

    if ((cString.count) != 6) {
        return UIColor.gray
    }

    var rgbValue:UInt64 = 0
    Scanner(string: cString).scanHexInt64(&rgbValue)

    return UIColor(
        red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
        green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
        blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
        alpha: CGFloat(1.0)
    )
}

struct SnippetaWidget: Widget {
    let kind: String = "SnippetaWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            SnippetaWidgetEntryView(entry: entry)
        }
    }
}

extension ConfigurationAppIntent {
    fileprivate static var defaultSnippetList: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.snippetList1 = SnippetList(id: "-1", title: "Snippets", colorHexCode: "#5c63ff")
        intent.snippetList2 = SnippetList(id: "-1", title: "Snippets", colorHexCode: "#5c63ff")
        intent.snippetList3 = SnippetList(id: "-1", title: "Snippets", colorHexCode: "#5c63ff")
        intent.snippetList4 = SnippetList(id: "-1", title: "Snippets", colorHexCode: "#5c63ff")
        return intent
    }
}

extension Color {
    init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

        var rgb: UInt64 = 0

        var r: CGFloat = 0.0
        var g: CGFloat = 0.0
        var b: CGFloat = 0.0
        var a: CGFloat = 1.0

        let length = hexSanitized.count

        guard Scanner(string: hexSanitized).scanHexInt64(&rgb) else { return nil }

        if length == 6 {
            r = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
            g = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
            b = CGFloat(rgb & 0x0000FF) / 255.0

        } else if length == 8 {
            r = CGFloat((rgb & 0xFF000000) >> 24) / 255.0
            g = CGFloat((rgb & 0x00FF0000) >> 16) / 255.0
            b = CGFloat((rgb & 0x0000FF00) >> 8) / 255.0
            a = CGFloat(rgb & 0x000000FF) / 255.0

        } else {
            return nil
        }

        self.init(red: r, green: g, blue: b, opacity: a)
    }
}

#Preview(as: .systemSmall) {
    SnippetaWidget()
} timeline: {
  SimpleEntry(date: .now, configuration: .defaultSnippetList)
}

#Preview(as: .systemMedium) {
    SnippetaWidget()
} timeline: {
  SimpleEntry(date: .now, configuration: .defaultSnippetList)
}

#Preview(as: .systemLarge) {
    SnippetaWidget()
} timeline: {
  SimpleEntry(date: .now, configuration: .defaultSnippetList)
}

#Preview(as: .systemExtraLarge) {
    SnippetaWidget()
} timeline: {
  SimpleEntry(date: .now, configuration: .defaultSnippetList)
}
