/**
 * Assignmento Custom Consent Management System
 * Handles cookie consent and integrates with Google Analytics
 */

class ConsentManager {
    constructor() {
        this.consentKey = 'assignmento-consent';
        this.consentData = this.getStoredConsent();
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.bindEvents();
        this.checkConsentStatus();
    }

    getStoredConsent() {
        const stored = localStorage.getItem(this.consentKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                // Check if consent is older than 1 year
                if (data.timestamp) {
                    const consentDate = new Date(data.timestamp);
                    const oneYearAgo = new Date();
                    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                    
                    if (consentDate < oneYearAgo) {
                        // Consent is old, remove it and ask again
                        localStorage.removeItem(this.consentKey);
                        return null;
                    }
                }
                return data;
            } catch (e) {
                console.error('Error parsing consent data:', e);
                return null;
            }
        }
        return null;
    }

    saveConsent(data) {
        const consentData = {
            ...data,
            timestamp: new Date().toISOString(),
            version: '1.0',
            userAgent: navigator.userAgent.substring(0, 100) // Store limited UA for debugging
        };
        
        try {
            localStorage.setItem(this.consentKey, JSON.stringify(consentData));
            this.consentData = consentData;
            this.updateGoogleConsent(data);
            
            // Dispatch custom event for other scripts to listen to
            window.dispatchEvent(new CustomEvent('consentUpdated', { 
                detail: consentData 
            }));
            
        } catch (e) {
            console.error('Error saving consent data:', e);
        }
    }

    updateGoogleConsent(data) {
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': data.analytics ? 'granted' : 'denied',
                'ad_storage': data.advertising ? 'granted' : 'denied',
                'ad_user_data': data.advertising ? 'granted' : 'denied',
                'ad_personalization': data.advertising ? 'granted' : 'denied'
            });
            
            console.log('Google consent updated:', data);
        } else {
            console.warn('gtag function not available for consent update');
        }
    }

    checkConsentStatus() {
        if (!this.consentData) {
            // Delay showing banner to ensure page is loaded
            setTimeout(() => this.showBanner(), 1000);
        } else {
            // Apply stored consent
            this.updateGoogleConsent(this.consentData);
        }
    }

    showBanner() {
        const banner = document.getElementById('consent-banner');
        if (banner) {
            banner.style.display = 'block';
            banner.setAttribute('aria-hidden', 'false');
        }
    }

    hideBanner() {
        const banner = document.getElementById('consent-banner');
        if (banner) {
            banner.style.display = 'none';
            banner.setAttribute('aria-hidden', 'true');
        }
    }

    showModal() {
        const modal = document.getElementById('consent-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            
            // Set current preferences
            const analyticsCheckbox = document.getElementById('analytics-consent');
            const advertisingCheckbox = document.getElementById('advertising-consent');
            
            if (this.consentData) {
                if (analyticsCheckbox) analyticsCheckbox.checked = this.consentData.analytics;
                if (advertisingCheckbox) advertisingCheckbox.checked = this.consentData.advertising;
            } else {
                // Default to checked for new users
                if (analyticsCheckbox) analyticsCheckbox.checked = true;
                if (advertisingCheckbox) advertisingCheckbox.checked = true;
            }
            
            // Focus management for accessibility
            const closeBtn = document.getElementById('consent-modal-close');
            if (closeBtn) closeBtn.focus();
        }
    }

    hideModal() {
        const modal = document.getElementById('consent-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    acceptAll() {
        const consent = {
            essential: true,
            analytics: true,
            advertising: true
        };
        this.saveConsent(consent);
        this.hideBanner();
        this.trackConsentAction('accept_all');
    }

    rejectAll() {
        const consent = {
            essential: true,
            analytics: false,
            advertising: false
        };
        this.saveConsent(consent);
        this.hideBanner();
        this.trackConsentAction('reject_all');
    }

    saveCustomPreferences() {
        const analyticsCheckbox = document.getElementById('analytics-consent');
        const advertisingCheckbox = document.getElementById('advertising-consent');
        
        const consent = {
            essential: true,
            analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
            advertising: advertisingCheckbox ? advertisingCheckbox.checked : false
        };
        
        this.saveConsent(consent);
        this.hideModal();
        this.hideBanner();
        this.trackConsentAction('custom_preferences');
    }

    trackConsentAction(action) {
        // Track consent actions (only if analytics consent is given)
        if (this.consentData && this.consentData.analytics && typeof gtag === 'function') {
            gtag('event', 'consent_action', {
                'event_category': 'Privacy',
                'event_label': action,
                'value': 1
            });
        }
    }

    bindEvents() {
        // Banner buttons
        const acceptBtn = document.getElementById('consent-accept-all');
        const rejectBtn = document.getElementById('consent-reject-all');
        const customizeBtn = document.getElementById('consent-customize');
        
        if (acceptBtn) acceptBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.acceptAll();
        });
        
        if (rejectBtn) rejectBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.rejectAll();
        });
        
        if (customizeBtn) customizeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal();
        });

        // Modal buttons
        const closeBtn = document.getElementById('consent-modal-close');
        const saveBtn = document.getElementById('consent-save-preferences');
        const modal = document.getElementById('consent-modal');
        
        if (closeBtn) closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal();
        });
        
        if (saveBtn) saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveCustomPreferences();
        });
        
        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        // Handle escape key for modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('consent-modal');
                if (modal && modal.style.display === 'flex') {
                    this.hideModal();
                }
            }
        });
    }

    // Public method to show preferences (can be called from privacy policy page)
    showPreferences() {
        this.showModal();
    }

    // Public method to get current consent status
    getConsent() {
        return this.consentData;
    }

    // Public method to revoke all consent
    revokeConsent() {
        localStorage.removeItem(this.consentKey);
        this.consentData = null;
        
        // Reset Google consent to denied
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
            });
        }
        
        this.showBanner();
    }

    // Check if a specific consent type is granted
    hasConsent(type) {
        if (!this.consentData) return false;
        return this.consentData[type] === true;
    }
}

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    // Initialize consent manager
    window.consentManager = new ConsentManager();

    // Expose global functions
    window.showConsentPreferences = () => {
        if (window.consentManager) {
            window.consentManager.showPreferences();
        }
    };

    window.revokeConsent = () => {
        if (window.consentManager) {
            window.consentManager.revokeConsent();
        }
    };

    window.getConsent = () => {
        if (window.consentManager) {
            return window.consentManager.getConsent();
        }
        return null;
    };
}
