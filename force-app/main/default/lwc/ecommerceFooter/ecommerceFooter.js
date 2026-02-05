import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class EcommerceFooter extends NavigationMixin(LightningElement) {
    @api contactPhone = '+1 (555) 123-4567';
    @api contactEmail = 'support@eshop.com';
    @api contactAddress = '123 Commerce Street, Business City, BC 12345';
    @api showNewsletterSignup = true;
    @api showSocialMedia = true;
    @api showPaymentMethods = true;
    @api enableBackToTop = true;

    @track newsletterEmail = '';
    @track isSubscribing = false;
    @track showNewsletterMessage = false;
    @track newsletterMessage = '';
    @track newsletterMessageType = '';
    @track selectedLanguage = 'en-US';
    @track selectedCurrency = 'USD';
    @track showBackToTop = false;

    // Current year for copyright
    currentYear = new Date().getFullYear();

    // Language options
    languageOptions = [
        { label: 'English (US)', value: 'en-US' },
        { label: 'English (UK)', value: 'en-UK' },
        { label: 'Spanish', value: 'es-ES' },
        { label: 'French', value: 'fr-FR' },
        { label: 'German', value: 'de-DE' },
        { label: 'Italian', value: 'it-IT' },
        { label: 'Portuguese', value: 'pt-BR' },
        { label: 'Japanese', value: 'ja-JP' },
        { label: 'Chinese', value: 'zh-CN' }
    ];

    // Currency options
    currencyOptions = [
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'GBP (£)', value: 'GBP' },
        { label: 'CAD (C$)', value: 'CAD' },
        { label: 'AUD (A$)', value: 'AUD' },
        { label: 'JPY (¥)', value: 'JPY' }
    ];

    connectedCallback() {
        this.loadUserPreferences();
        this.setupScrollListener();
    }

    disconnectedCallback() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', this.handleScroll);
        }
    }

    // Getters
    get newsletterMessageClass() {
        const baseClass = 'newsletter-message';
        return this.newsletterMessageType === 'success'
            ? `${baseClass} success`
            : `${baseClass} error`;
    }

    get newsletterMessageIcon() {
        return this.newsletterMessageType === 'success'
            ? 'utility:success'
            : 'utility:error';
    }

    // Load user preferences
    loadUserPreferences() {
        try {
            const preferences = localStorage.getItem('ecommerce_preferences');
            if (preferences) {
                const prefs = JSON.parse(preferences);
                this.selectedLanguage = prefs.language || 'en-US';
                this.selectedCurrency = prefs.currency || 'USD';
            }
        } catch (error) {
            console.error('Error loading user preferences:', error);
        }
    }

    // Newsletter functionality
    handleEmailChange(event) {
        this.newsletterEmail = event.target.value;
        this.hideNewsletterMessage();
    }

    async handleNewsletterSignup() {
        if (!this.validateEmail(this.newsletterEmail)) {
            this.showNewsletterError('Please enter a valid email address.');
            return;
        }

        this.isSubscribing = true;

        try {
            // Simulate API call for newsletter signup
            await this.simulateNewsletterSignup(this.newsletterEmail);
            this.showNewsletterSuccess('Thank you for subscribing! Check your email for confirmation.');
            this.newsletterEmail = '';

            // Track newsletter signup event
            this.trackEvent('newsletter_signup', {
                email: this.newsletterEmail,
                source: 'footer'
            });
        } catch (error) {
            console.error('Newsletter signup error:', error);
            this.showNewsletterError('Subscription failed. Please try again later.');
        } finally {
            this.isSubscribing = false;
        }
    }

    simulateNewsletterSignup(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure (90% success rate)
                if (Math.random() > 0.1) {
                    resolve({ success: true, message: 'Subscribed successfully' });
                } else {
                    reject(new Error('Subscription failed'));
                }
            }, 1500);
        });
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNewsletterSuccess(message) {
        this.newsletterMessage = message;
        this.newsletterMessageType = 'success';
        this.showNewsletterMessage = true;
        this.hideMessageAfterDelay();
    }

    showNewsletterError(message) {
        this.newsletterMessage = message;
        this.newsletterMessageType = 'error';
        this.showNewsletterMessage = true;
        this.hideMessageAfterDelay();
    }

    hideNewsletterMessage() {
        this.showNewsletterMessage = false;
    }

    hideMessageAfterDelay() {
        setTimeout(() => {
            this.hideNewsletterMessage();
        }, 5000);
    }

    // Navigation handlers
    handleLinkClick(event) {
        event.preventDefault();
        const page = event.currentTarget.dataset.page;
        this.navigateToPage(page);
    }

    handleLegalClick(event) {
        event.preventDefault();
        const page = event.currentTarget.dataset.page;
        this.navigateToLegalPage(page);
    }

    handleSocialClick(event) {
        event.preventDefault();
        const platform = event.currentTarget.dataset.platform;
        this.openSocialMedia(platform);
    }

    navigateToPage(page) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/${page}`
            }
        });
    }

    navigateToLegalPage(page) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/legal/${page}`
            }
        });
    }

    openSocialMedia(platform) {
        const socialUrls = {
            facebook: 'https://facebook.com/eshop',
            twitter: 'https://twitter.com/eshop',
            instagram: 'https://instagram.com/eshop',
            linkedin: 'https://linkedin.com/company/eshop',
            youtube: 'https://youtube.com/eshop'
        };

        const url = socialUrls[platform];
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');

            // Track social media click
            this.trackEvent('social_click', {
                platform: platform,
                source: 'footer'
            });
        }
    }

    // Language and currency handlers
    handleLanguageChange(event) {
        const newLanguage = event.detail.value;
        this.selectedLanguage = newLanguage;
        this.saveUserPreferences();
        this.dispatchLanguageChange(newLanguage);
    }

    handleCurrencyChange(event) {
        const newCurrency = event.detail.value;
        this.selectedCurrency = newCurrency;
        this.saveUserPreferences();
        this.dispatchCurrencyChange(newCurrency);
    }

    saveUserPreferences() {
        try {
            const preferences = {
                language: this.selectedLanguage,
                currency: this.selectedCurrency,
                timestamp: Date.now()
            };
            localStorage.setItem('ecommerce_preferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    }

    dispatchLanguageChange(language) {
        this.dispatchEvent(new CustomEvent('languagechange', {
            detail: { language },
            bubbles: true,
            composed: true
        }));
    }

    dispatchCurrencyChange(currency) {
        this.dispatchEvent(new CustomEvent('currencychange', {
            detail: { currency },
            bubbles: true,
            composed: true
        }));
    }

    // Back to top functionality
    setupScrollListener() {
        if (this.enableBackToTop && typeof window !== 'undefined') {
            this.handleScroll = this.handleScroll.bind(this);
            window.addEventListener('scroll', this.handleScroll);
        }
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.showBackToTop = scrollTop > 500;
    }

    scrollToTop() {
        if (typeof window !== 'undefined') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            // Track back to top usage
            this.trackEvent('back_to_top_click', {
                scrollPosition: window.pageYOffset,
                source: 'footer'
            });
        }
    }

    // Analytics tracking
    trackEvent(eventName, properties = {}) {
        try {
            // Dispatch custom event for parent components to handle analytics
            this.dispatchEvent(new CustomEvent('footeranalytics', {
                detail: {
                    event: eventName,
                    properties: {
                        ...properties,
                        timestamp: Date.now(),
                        component: 'ecommerceFooter'
                    }
                },
                bubbles: true,
                composed: true
            }));
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    }

    // Public API methods
    @api
    updateContactInfo(phone, email, address) {
        this.contactPhone = phone;
        this.contactEmail = email;
        this.contactAddress = address;
    }

    @api
    setLanguage(language) {
        this.selectedLanguage = language;
        this.saveUserPreferences();
    }

    @api
    setCurrency(currency) {
        this.selectedCurrency = currency;
        this.saveUserPreferences();
    }

    @api
    showNewsletterConfirmation(message) {
        this.showNewsletterSuccess(message || 'Newsletter subscription confirmed!');
    }
}