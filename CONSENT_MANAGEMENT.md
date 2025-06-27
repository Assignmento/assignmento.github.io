# Custom Consent Management System

This document explains the custom cookie consent management system implemented for Assignmento.

## Overview

The custom consent management system replaces CookieHub and provides:
- GDPR-compliant cookie consent banner
- Granular consent controls (Essential, Analytics, Advertising)
- Integration with Google Analytics consent API
- Local storage of consent preferences
- Accessibility features

## Features

### 1. Consent Banner
- Appears for new visitors or when consent has expired (1 year)
- Three action buttons: Accept All, Reject All, Customize
- Responsive design that works on mobile and desktop

### 2. Consent Modal
- Detailed preferences with toggle switches
- Clear descriptions of each cookie category
- Save preferences functionality

### 3. Integration
- Automatically updates Google Analytics consent state
- Stores consent in localStorage with timestamp
- Provides global JavaScript functions for other scripts

### 4. Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Implementation Files

### JavaScript
- `js/consent-manager.js` - Main consent management logic
- Loaded in `index.html` in the head section

### CSS
- Consent styles are included in `css/index.css`
- Uses CSS variables for theming (supports dark/light mode)

### HTML
- Consent banner and modal HTML in `index.html`
- "Cookie Settings" link in footer

## API Reference

### Global Functions
```javascript
// Show consent preferences modal
showConsentPreferences()

// Get current consent status
getConsent()

// Revoke all consent (resets and shows banner)
revokeConsent()
```

### Events
```javascript
// Listen for consent updates
window.addEventListener('consentUpdated', (event) => {
    console.log('Consent updated:', event.detail);
});
```

### Consent Object Structure
```javascript
{
    essential: true,    // Always true (required cookies)
    analytics: boolean, // Google Analytics
    advertising: boolean, // AdSense and advertising
    timestamp: "2025-06-27T...", // ISO timestamp
    version: "1.0",     // Schema version
    userAgent: "..."    // Truncated user agent (for debugging)
}
```

## Google Analytics Integration

The system automatically updates Google Analytics consent state:

```javascript
gtag('consent', 'update', {
    'analytics_storage': 'granted'/'denied',
    'ad_storage': 'granted'/'denied',
    'ad_user_data': 'granted'/'denied',
    'ad_personalization': 'granted'/'denied'
});
```

## Storage

Consent preferences are stored in localStorage with the key `assignmento-consent`.

### Expiration
- Consent expires after 1 year
- Expired consent is automatically removed
- User will see banner again after expiration

## Customization

### Adding New Cookie Categories
1. Add HTML in the consent modal
2. Update the ConsentManager class to handle the new category
3. Update Google Analytics mapping if needed

### Styling
- Modify CSS variables in `:root` and `body.dark`
- Consent styles are at the bottom of `css/index.css`

### Behavior
- Modify timing, storage key, or expiration in `js/consent-manager.js`

## Testing

To test the consent system:

1. **Fresh visitor**: Clear localStorage and reload page
2. **Returning visitor**: Consent should be remembered
3. **Expired consent**: Manually set timestamp to old date
4. **Settings access**: Click "Cookie Settings" in footer
5. **Responsive**: Test on mobile devices

```javascript
// Clear consent for testing
localStorage.removeItem('assignmento-consent');
location.reload();
```

## Compliance Notes

### GDPR Compliance
- ✅ Clear consent before tracking
- ✅ Granular consent options
- ✅ Easy withdrawal of consent
- ✅ Consent expiration (1 year)
- ✅ Record of consent with timestamp

### Best Practices
- ✅ Consent-first approach (no tracking until consent)
- ✅ Clear language about cookie usage
- ✅ Essential cookies clearly marked as required
- ✅ Easy access to preferences
- ✅ Accessibility compliant

## Browser Support

- Modern browsers with localStorage support
- ES6+ features (Chrome 51+, Firefox 54+, Safari 10+)
- Graceful degradation for older browsers

## Troubleshooting

### Common Issues

1. **Banner not showing**: Check browser console for JavaScript errors
2. **Consent not saving**: Verify localStorage is available
3. **Google Analytics not updating**: Ensure gtag is loaded before consent script
4. **Styling issues**: Check CSS conflicts with existing styles

### Debug Commands

```javascript
// Check current consent
console.log(getConsent());

// Check if consent manager is loaded
console.log(window.consentManager);

// Force show banner (for testing)
localStorage.removeItem('assignmento-consent');
window.consentManager.checkConsentStatus();
```
