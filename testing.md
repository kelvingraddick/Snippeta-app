# **Snippeta - Regression Test Checklist**

## **1. App launch and initialization**
- [ ] App launches without crashes
- [ ] Splash screen displays correctly
- [ ] App initializes i18n and loads correct language
- [ ] Theme/appearance loads from storage
- [ ] App handles no stored credentials
- [ ] No initialization issues with critical 3rd parties (RevenueCat, OneSignal, Sentry, Firebase)
- [ ] Deep link handling on app launch works

## **2. Navigation and screens**

### **2.1 Snippets Screen**
- [ ] Main snippets list displays correctly
- [ ] Navigate into group (shows sub-snippets)
- [ ] Navigate into sub-group
- [ ] Back navigation works
- [ ] Pull-to-refresh works
- [ ] Section visibility toggle (On Device/Cloud) works
- [ ] Empty state displays when no snippets
- [ ] Tutorial snippets display for new users

### **2.2 Search Screen**
- [ ] Search opens from navigation
- [ ] Search filters snippets correctly
- [ ] Search works across groups
- [ ] Search works for cloud snippets
- [ ] Search works for on-device snippets
- [ ] Search results navigate correctly
- [ ] Deep link to search works

### **2.3 Settings Screen**
- [ ] Settings screen opens
- [ ] All settings sections display
- [ ] Settings persist after app restart

### **2.4 User Account Screens**
- [ ] Login screen displays
- [ ] Register screen displays (with subscription)
- [ ] Forgot password screen displays
- [ ] User screen displays when logged in

## **3. Snippet management (core features)**

**Test both ***On Device*** and ***Cloud*** snippets*

### **3.1 Create Snippets**
- [ ] Create single snippet from main screen
- [ ] Create group snippet from main screen
- [ ] Create sub-group within a group
- [ ] Snippet saves with correct title/content
- [ ] Snippet saves with selected color
- [ ] Snippet appears in correct order
- [ ] Snippet appears in correct section
- [ ] Widget updates after snippet creation
- [ ] Keyboard updates after snippet creation

### **3.2 Edit Snippets**
- [ ] Edit single snippet (title, content, color)
- [ ] Edit group snippet (title, color)
- [ ] Edit sub-group snippet
- [ ] Changes persist after app restart
- [ ] Widget updates after edit
- [ ] Keyboard updates after edit

### **3.3 Organize Snippets**
- [ ] Move snippet to top
- [ ] Move snippet up
- [ ] Move snippet down
- [ ] Move snippet to bottom
- [ ] Reordering persists after app restart
- [ ] Reordering works for groups and sub-groups

### **3.4 Copy & Share**
- [ ] Tap snippet copies to clipboard
- [ ] Copy confirmation banner appears
- [ ] Share snippet works
- [ ] Copied text is correct

### **3.5 Delete Snippets**
- [ ] Delete single snippet
- [ ] Delete group snippet (with confirmation)
- [ ] Delete sub-group snippet
- [ ] Deletion removes from list immediately
- [ ] Widget updates after deletion
- [ ] Keyboard updates after deletion
- [ ] Deletion persists after app restart

## **4. Authentication and user account**

### **4.1 Login**
- [ ] Login with email works
- [ ] Login with phone works
- [ ] Login with correct password works
- [ ] Login with incorrect password shows error
- [ ] Login credentials persist (auto-login)
- [ ] Login updates RevenueCat user ID
- [ ] Login updates OneSignal user ID
- [ ] Login updates Sentry user context
- [ ] Login updates analytics user ID

### **4.2 Registration**
- [ ] Register with email works
- [ ] Register with phone works
- [ ] Registration validation works
- [ ] Registration creates account successfully
- [ ] Registration auto-logs in user

### **4.3 Password Reset**
- [ ] Forgot password link works
- [ ] Password reset email sends
- [ ] Error handling for invalid email/phone

### **4.4 Logout**
- [ ] Logout clears credentials
- [ ] Logout clears OneSignal user
- [ ] Logout clears Sentry user
- [ ] Logout resets analytics
- [ ] Logout returns to snippets screen
- [ ] Logout persists (no auto-login)

## **5. Custom keyboard**

### **5.1 Keyboard Setup**
- [ ] Keyboard installation instructions display
- [ ] Keyboard can be enabled in iOS Settings
- [ ] Keyboard can be enabled in Android Settings
- [ ] Keyboard appears when switching to it

### **5.2 Keyboard Functionality**
- [ ] Keyboard displays snippets correctly
- [ ] Tap snippet pastes text
- [ ] Navigate groups/sub-groups in keyboard
- [ ] Space button works
- [ ] Delete button works
- [ ] Keyboard theme matches app theme
- [ ] Keyboard updates when snippets change
- [ ] Keyboard works in different apps (Messages, Notes, etc.)

### **5.3 Keyboard Screen (In-App)**
- [ ] Keyboard screen opens as modal
- [ ] Keyboard screen shows snippets
- [ ] Navigation in keyboard screen works
- [ ] Copy from keyboard screen works

## **6. Widgets**

### **6.1 Widget Setup**
- [ ] Widget installation instructions display
- [ ] Widget can be added to home screen (iOS)
- [ ] Widget can be added to home screen (Android)
- [ ] Widget displays correctly

### **6.2 Widget Functionality**
- [ ] Widget shows snippets
- [ ] Tap snippet in widget copies to clipboard
- [ ] Widget updates when snippets change
- [ ] Widget theme matches app theme
- [ ] Widget works after app restart
- [ ] Widget screen (in-app) displays correctly

## **7. Snippeta Pro subscription**

- [ ] Cloud view (ad) displays when not subscribed
- [ ] Can only create sub-groups if subscribed
- [ ] Can only create account if subscribed
- [ ] Subscription status displays correctly
- [ ] Pro features gated correctly
- [ ] RevenueCat paywall displays
- [ ] Purchase subscription works
- [ ] Restore purchases works
- [ ] Subscription status updates after purchase
- [ ] Entitlements update correctly
- [ ] Snippeta Cloud subscription detection works

## **8. Themes and appearance**

### **8.1 Theme Selection**
- [ ] All themes display in settings
- [ ] Select theme applies immediately
- [ ] Theme persists after app restart
- [ ] Pro themes require subscription
- [ ] Theme preview works (60-second timer)
- [ ] Theme preview auto-reverts

### **8.2 Appearance Mode**
- [ ] System appearance mode works
- [ ] Light appearance mode works
- [ ] Dark appearance mode works
- [ ] Appearance mode persists after app restart
- [ ] Appearance mode syncs with system (when set to System)

## **9. Internationalization (i18n)**

### **9.1 Language Support**
- [ ] English displays correctly
- [ ] German displays correctly
- [ ] Spanish displays correctly
- [ ] French displays correctly
- [ ] Portuguese displays correctly
- [ ] Language change applies immediately
- [ ] Language persists after app restart
- [ ] Device language auto-detection works

## **10. Deep links**

### **10.1 Deep Link Handling**
- [ ] Deep link to snippet (`snippeta://snippets/{id}`) works
- [ ] Deep link to copy (`snippeta://copy/{id}`) works
- [ ] Deep link to search (`snippeta://search`) works
- [ ] Deep link to add (`snippeta://add`) works
- [ ] Deep link from app launch works
- [ ] Deep link while app running works
- [ ] Invalid deep link handled gracefully

## **11. Push notifications**

### **11.1 Notification Handling**
- [ ] Notification permission request works
- [ ] Notification click navigates to snippet
- [ ] Notification click opens settings
- [ ] Notification click opens search
- [ ] Notification click opens add snippet
- [ ] Foreground notification handling works
- [ ] Notification analytics tracked

## **12. Error handling and edge cases**

### **12.1 Network Errors**
- [ ] App handles API errors gracefully
- [ ] Error messages display correctly
- [ ] App works offline (on-device snippets)
- [ ] Sync resumes when network returns

### **12.2 Data Integrity**
- [ ] App handles corrupted storage gracefully
- [ ] App handles missing data gracefully
- [ ] App handles invalid snippet data
- [ ] App handles empty states

### **12.3 Performance**
- [ ] App handles large number of snippets
- [ ] App handles deep nesting of groups
- [ ] App doesn't freeze during operations
- [ ] Memory usage is reasonable

## **13. Analytics and monitoring**

### **13.1 Analytics**
- [ ] Screen views tracked
- [ ] User events tracked
- [ ] User properties set correctly
- [ ] Analytics reset on logout

### **13.2 Error Tracking**
- [ ] Sentry captures errors
- [ ] Sentry captures exceptions
- [ ] User context set in Sentry
- [ ] Error attachments work

## **14. Platform-specific**

### **14.1 iOS Specific**
- [ ] iOS keyboard extension works
- [ ] iOS widget extension works
- [ ] iOS appearance modes work
- [ ] iOS safe area handling works
- [ ] iOS haptic feedback works
- [ ] iOS review prompt works (at milestones)

### **14.2 Android Specific**
- [ ] Android keyboard works
- [ ] Android widget works
- [ ] Android back button handling works
- [ ] Android notification handling works

## **15. Integration points**

### **15.1 RevenueCat**
- [ ] RevenueCat initializes
- [ ] RevenueCat login works
- [ ] Entitlements fetch works
- [ ] Package fetching works
- [ ] Purchase flow works

### **15.2 OneSignal**
- [ ] OneSignal initializes
- [ ] OneSignal login works
- [ ] OneSignal logout works
- [ ] User tags update correctly

### **15.3 Firebase Analytics**
- [ ] Firebase initializes
- [ ] Events tracked correctly
- [ ] User properties set correctly

## **16. UI/UX elements**

### **16.1 Visual Elements**
- [ ] All buttons are tappable
- [ ] All text is readable
- [ ] Colors display correctly
- [ ] Icons display correctly
- [ ] Loading states display
- [ ] Skeleton placeholders display

### **16.2 Interactions**
- [ ] Haptic feedback works
- [ ] Action sheets display correctly
- [ ] Flash messages display correctly
- [ ] Banner messages display correctly
- [ ] Pull-to-refresh works
- [ ] Scroll behavior is smooth

## **17. Data persistence**

### **17.1 Storage**
- [ ] Snippets persist after app restart
- [ ] Settings persist after app restart
- [ ] User preferences persist
- [ ] Theme selection persists
- [ ] Language selection persists

### **17.2 Sync**
- [ ] Cloud snippets sync correctly
- [ ] On-device snippets remain local
- [ ] Combined view works correctly
- [ ] Sync handles conflicts gracefully

## **18. Security and privacy**

### **18.1 Credentials**
- [ ] Credentials stored securely
- [ ] Credentials cleared on logout
- [ ] Authorization tokens work

### **18.2 Permissions**
- [ ] Keyboard permission request works
- [ ] Notification permission request works
- [ ] Widget permission request works

---

## **Additional testing notes**

**Test Environment:**
- iOS: Test on multiple iOS versions (latest and one previous)
- Android: Test on multiple Android versions (latest and one previous)
- Devices: Test on phones and tablets (iPad for iOS)

**Test Accounts:**
- New user (no account)
- Free user (logged in, no subscription)
- Pro user (with active subscription)
- Cloud user (Snippeta Cloud account)

**Priority Levels:**
- **P0 (Critical):** Core snippet management, keyboard, authentication
- **P1 (High):** Widgets, cloud sync, subscriptions
- **P2 (Medium):** Themes, i18n, deep links
- **P3 (Low):** Analytics, error tracking, edge cases

**Regression Test Frequency:**
- Before each release
- After major feature changes
- After dependency updates
- Monthly for critical paths