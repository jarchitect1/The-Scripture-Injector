# The Scripture Injector - User Experience Flow

## Primary User Journey

```mermaid
flowchart TD
    A[Pastor working on sermon notes] --> B[Presses Ctrl/Cmd+P]
    B --> C[Types "Insert Bible Verse"]
    C --> D[Selects command from palette]
    D --> E[Verse Selection Modal appears]
    E --> F[Types Bible reference<br/>(e.g., "John 3:16")]
    F --> G[Selects translation<br/>(ESV or NET)]
    G --> H[Clicks "Fetch Verse"]
    H --> I{API Request Successful?}
    I -->|Yes| J[Verse formatted and inserted]
    I -->|No| K[Error message displayed]
    J --> L[Pastor continues writing]
    K --> M[Pastor can try again]
    M --> F
```

## Modal Interface Design

### Initial State
```
┌─────────────────────────────────────┐
│ Enter Bible Reference               │
│ ┌─────────────────────────────────┐ │
│ │ John 3:16                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Select Translation                  │
│ ┌─────────────────────────────────┐ │
│ │ English Standard Version (ESV) ▼ │ │
│ └─────────────────────────────────┘ │
│                                     │
│            [ Fetch Verse ]          │
└─────────────────────────────────────┘
```

### After Successful Fetch
The modal closes and the verse is inserted at the cursor position:

```
[!quote]- 📖 John 3:16 (ESV)
For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.
```

## Error Handling UX

### Network Error
```
┌─────────────────────────────────────┐
│ ❌ Error                            │
│                                     │
│ Unable to connect to Bible API.     │
│ Please check your internet          │
│ connection and try again.           │
│                                     │
│              [ OK ]                  │
└─────────────────────────────────────┘
```

### Invalid Reference
```
┌─────────────────────────────────────┐
│ ❌ Invalid Reference                 │
│                                     │
│ "John 99:99" is not a valid         │
│ Bible reference. Please check       │
│ and try again.                      │
│                                     │
│              [ OK ]                  │
└─────────────────────────────────────┘
```

### Missing ESV API Key
```
┌─────────────────────────────────────┐
│ ⚠️ ESV API Key Required             │
│                                     │
│ To use the ESV translation,         │
│ please add your API key in          │
│ Settings → The Scripture Injector.  │
│                                     │
│        [ Open Settings ]  [ Cancel ] │
└─────────────────────────────────────┘
```

## Settings Interface

### Main Settings Tab
```
┌─────────────────────────────────────┐
│ The Scripture Injector Settings     │
│                                     │
│ Default Translation                 │
│ ┌─────────────────────────────────┐ │
│ │ English Standard Version (ESV) ▼ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ESV API Key                         │
│ ┌─────────────────────────────────┐ │
│ │ [your-api-key-here]            │ │
│ └─────────────────────────────────┘ │
│ Get your key at api.esv.org        │
│                                     │
│ ☑ Show Translation Name            │
│ ☑ Show Reference                   │
│                                     │
│            [ Save ]                 │
└─────────────────────────────────────┘
```

## Keyboard Shortcuts & Efficiency

### Command Palette Flow
1. **Ctrl/Cmd+P** - Open command palette
2. **Type "bible"** - Filter to "Insert Bible Verse" command
3. **Enter** - Select command
4. **Type reference** - Input Bible reference (e.g., "rom 8:28")
5. **Tab** - Move to translation dropdown
6. **Arrow keys** - Select translation
7. **Enter** - Fetch and insert verse

### Power User Features (Future Enhancements)
- **Quick reference format**: "john3:16" (auto-detect book)
- **Recent verses**: Quick access to last 5 inserted verses
- **Favorite verses**: Pre-configured list of go-to verses
- **Bulk insert**: Insert multiple verses at once

## Mobile Experience

### Touch Interface Adaptations
- Larger touch targets for buttons
- Simplified modal layout
- Swipe gestures for translation selection
- Voice input support for reference entry

### Mobile Modal Layout
```
┌─────────────────────────┐
│ Enter Bible Reference   │
│ ┌─────────────────────┐ │
│ │ John 3:16          │ │
│ └─────────────────────┘ │
│                         │
│ Translation             │
│ ┌─────────────────────┐ │
│ │ ESV ●   NET ○      │ │
│ └─────────────────────┘ │
│                         │
│      [ Fetch Verse ]    │
└─────────────────────────┘
```

## Accessibility Considerations

### Screen Reader Support
- Proper ARIA labels for all interactive elements
- Semantic HTML structure
- Keyboard navigation for all features
- High contrast mode support

### Visual Accessibility
- Clear focus indicators
- Sufficient color contrast ratios
- Scalable text sizes
- Clear error messaging

## Performance Optimization

### Loading States
- Loading spinner during API requests
- Progressive loading for long passages
- Offline indication when no connectivity

### Caching Strategy
- Cache recently fetched verses
- Store translation preferences locally
- Implement smart refresh for updated API content

This user experience flow ensures that pastors can quickly and efficiently insert Bible verses into their notes with minimal disruption to their workflow, while providing clear feedback and error handling when issues occur.