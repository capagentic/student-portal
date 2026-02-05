import { LightningElement, api, track } from 'lwc';

/**
 * heroCarousel - Auto-rotating banner carousel component for featured content and promotions
 *
 * Features:
 * - Auto-rotation with configurable timing (default 5 seconds)
 * - Manual navigation controls (previous/next arrows)
 * - Slide indicator dots with click navigation
 * - Pause on hover functionality
 * - Touch/swipe support for mobile devices
 * - Accessible keyboard navigation with ARIA labels
 * - Smooth transitions between slides
 * - Analytics tracking for CTA button clicks
 */
export default class HeroCarousel extends LightningElement {

    //#region Public API Properties

    /**
     * Auto-rotation interval in milliseconds
     */
    @api rotationInterval = 5000;

    /**
     * Enable/disable auto-rotation
     */
    @api autoRotate = true;

    /**
     * Enable/disable pause on hover
     */
    @api pauseOnHover = true;

    /**
     * Show/hide navigation arrows
     */
    @api showNavigationArrows = true;

    /**
     * Show/hide slide indicators
     */
    @api showIndicators = true;

    /**
     * Show/hide play/pause control
     */
    @api showPlayPauseControl = true;

    /**
     * Maximum number of slides (1-8)
     */
    @api maxSlides = 8;

    //#endregion

    //#region Private Tracked Properties

    /**
     * Current active slide index
     */
    @track currentSlideIndex = 0;

    /**
     * Carousel loading state
     */
    @track isLoading = true;

    /**
     * Auto-rotation playing state
     */
    @track isPlaying = true;

    /**
     * Carousel is paused (hover or manual pause)
     */
    @track isPaused = false;

    /**
     * Screen reader announcement text
     */
    @track screenReaderAnnouncement = '';

    //#endregion

    //#region Private Properties

    /**
     * Auto-rotation timer reference
     */
    rotationTimer = null;

    /**
     * Touch/swipe handling properties
     */
    touchStartX = 0;
    touchEndX = 0;
    minSwipeDistance = 50;

    //#endregion

    //#region Computed Properties

    /**
     * Carousel slides data with computed properties
     */
    get carouselSlides() {
        return this.slidesData.map((slide, index) => ({
            ...slide,
            index: index,
            cssClass: `carousel-slide ${index === this.currentSlideIndex ? 'active' : ''}`,
            ariaHidden: index !== this.currentSlideIndex ? 'true' : 'false',
            slideLabel: `Slide ${index + 1} of ${this.slidesData.length}: ${slide.heading}`,
            backgroundStyle: `background-image: url('${slide.backgroundImage}'); background-size: cover; background-position: center;`
        }));
    }

    /**
     * Slide indicators data with computed states
     */
    get slideIndicators() {
        return this.slidesData.map((slide, index) => ({
            id: `indicator-${index}`,
            index: index,
            isActive: index === this.currentSlideIndex,
            cssClass: `carousel-indicator ${index === this.currentSlideIndex ? 'active' : ''}`,
            panelId: `slide-${index}`,
            ariaLabel: `Go to slide ${index + 1}`,
            tabIndex: index === this.currentSlideIndex ? '0' : '-1'
        }));
    }

    /**
     * Previous button disabled state
     */
    get isPreviousDisabled() {
        return this.currentSlideIndex === 0;
    }

    /**
     * Next button disabled state
     */
    get isNextDisabled() {
        return this.currentSlideIndex === this.slidesData.length - 1;
    }

    /**
     * Play/pause button icon
     */
    get playPauseIcon() {
        return this.isPlaying ? 'utility:pause' : 'utility:play';
    }

    /**
     * Play/pause button alternative text
     */
    get playPauseAltText() {
        return this.isPlaying ? 'Pause carousel' : 'Play carousel';
    }

    /**
     * Play/pause button title
     */
    get playPauseTitle() {
        return this.isPlaying ? 'Pause' : 'Play';
    }

    /**
     * Play/pause button ARIA label
     */
    get playPauseAriaLabel() {
        return this.isPlaying ? 'Pause automatic slide rotation' : 'Resume automatic slide rotation';
    }

    /**
     * Mock slides data - TODO: Replace with actual data source
     */
    get slidesData() {
        return [
            {
                id: 'slide-1',
                heading: 'Summer Sale Collection',
                description: 'Discover amazing deals on our latest summer collection. Up to 50% off on selected items.',
                backgroundImage: '/resource/hero-slide-1.jpg',
                backgroundAlt: 'Summer fashion collection with bright colors',
                ctaButton: {
                    label: 'Shop Now',
                    variant: 'brand',
                    url: '/products/summer-collection'
                }
            },
            {
                id: 'slide-2',
                heading: 'New Arrivals',
                description: 'Check out the latest trends and newest products just added to our catalog.',
                backgroundImage: '/resource/hero-slide-2.jpg',
                backgroundAlt: 'New product arrivals display',
                ctaButton: {
                    label: 'View Collection',
                    variant: 'neutral',
                    url: '/products/new-arrivals'
                }
            },
            {
                id: 'slide-3',
                heading: 'Free Shipping',
                description: 'Enjoy free shipping on all orders over $75. Fast delivery to your doorstep.',
                backgroundImage: '/resource/hero-slide-3.jpg',
                backgroundAlt: 'Delivery truck with packages',
                ctaButton: {
                    label: 'Learn More',
                    variant: 'brand-outline',
                    url: '/shipping-info'
                }
            }
        ];
    }

    //#endregion

    //#region Lifecycle Hooks

    /**
     * Component initialization
     */
    connectedCallback() {
        this.initializeCarousel();
    }

    /**
     * Component rendered callback
     */
    renderedCallback() {
        if (this.isLoading) {
            // Simulate loading delay
            setTimeout(() => {
                this.isLoading = false;
                this.startAutoRotation();
            }, 500);
        }
    }

    /**
     * Component cleanup
     */
    disconnectedCallback() {
        this.stopAutoRotation();
    }

    //#endregion

    //#region Initialization

    /**
     * Initialize carousel settings and event listeners
     */
    initializeCarousel() {
        // Set initial playing state based on autoRotate setting
        this.isPlaying = this.autoRotate;

        // Add touch event listeners for mobile swipe support
        // TODO: Implement touch event handling in renderedCallback
        // this.addTouchEventListeners();
    }

    //#endregion

    //#region Auto-rotation Management

    /**
     * Start auto-rotation timer
     */
    startAutoRotation() {
        if (!this.autoRotate || this.isPaused || !this.isPlaying) return;

        this.stopAutoRotation(); // Clear existing timer

        this.rotationTimer = setInterval(() => {
            this.goToNextSlide();
        }, this.rotationInterval);
    }

    /**
     * Stop auto-rotation timer
     */
    stopAutoRotation() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = null;
        }
    }

    /**
     * Pause auto-rotation
     */
    pauseAutoRotation() {
        this.isPaused = true;
        this.stopAutoRotation();
    }

    /**
     * Resume auto-rotation
     */
    resumeAutoRotation() {
        this.isPaused = false;
        if (this.isPlaying) {
            this.startAutoRotation();
        }
    }

    //#endregion

    //#region Navigation Methods

    /**
     * Navigate to next slide
     */
    goToNextSlide() {
        const nextIndex = (this.currentSlideIndex + 1) % this.slidesData.length;
        this.goToSlide(nextIndex);
    }

    /**
     * Navigate to previous slide
     */
    goToPreviousSlide() {
        const prevIndex = this.currentSlideIndex === 0
            ? this.slidesData.length - 1
            : this.currentSlideIndex - 1;
        this.goToSlide(prevIndex);
    }

    /**
     * Navigate to specific slide by index
     */
    goToSlide(slideIndex) {
        if (slideIndex < 0 || slideIndex >= this.slidesData.length) return;

        const previousIndex = this.currentSlideIndex;
        this.currentSlideIndex = slideIndex;

        // Update screen reader announcement
        const currentSlide = this.slidesData[slideIndex];
        this.screenReaderAnnouncement =
            `Showing slide ${slideIndex + 1} of ${this.slidesData.length}: ${currentSlide.heading}`;

        // Dispatch slide change event
        this.dispatchSlideChangeEvent(previousIndex, slideIndex);

        // Restart auto-rotation if playing
        if (this.isPlaying && !this.isPaused) {
            this.startAutoRotation();
        }
    }

    //#endregion

    //#region Event Handlers

    /**
     * Handle next button click
     */
    handleNextSlide() {
        this.goToNextSlide();
        this.pauseAutoRotation(); // Pause when user manually navigates

        // Resume after a delay
        setTimeout(() => this.resumeAutoRotation(), 3000);
    }

    /**
     * Handle previous button click
     */
    handlePreviousSlide() {
        this.goToPreviousSlide();
        this.pauseAutoRotation(); // Pause when user manually navigates

        // Resume after a delay
        setTimeout(() => this.resumeAutoRotation(), 3000);
    }

    /**
     * Handle slide indicator click
     */
    handleIndicatorClick(event) {
        const slideIndex = parseInt(event.currentTarget.dataset.slideIndex, 10);
        this.goToSlide(slideIndex);
        this.pauseAutoRotation(); // Pause when user manually navigates

        // Resume after a delay
        setTimeout(() => this.resumeAutoRotation(), 3000);
    }

    /**
     * Handle play/pause toggle
     */
    handlePlayPauseToggle() {
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            this.resumeAutoRotation();
        } else {
            this.pauseAutoRotation();
        }

        // Announce state change to screen readers
        this.screenReaderAnnouncement = this.isPlaying
            ? 'Carousel auto-rotation resumed'
            : 'Carousel auto-rotation paused';

        // Dispatch play/pause event
        this.dispatchEvent(new CustomEvent('carouselplaypause', {
            detail: {
                isPlaying: this.isPlaying,
                currentSlide: this.currentSlideIndex
            },
            bubbles: true,
            composed: true
        }));
    }

    /**
     * Handle CTA button clicks
     */
    handleCtaClick(event) {
        const slideId = event.currentTarget.dataset.slideId;
        const ctaUrl = event.currentTarget.dataset.ctaUrl;

        // Dispatch CTA click event for analytics
        this.dispatchEvent(new CustomEvent('carouselctaclick', {
            detail: {
                slideId: slideId,
                url: ctaUrl,
                slideIndex: this.currentSlideIndex,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        }));

        // TODO: Implement navigation logic
        console.log(`CTA clicked: ${slideId} -> ${ctaUrl}`);
    }

    /**
     * Handle carousel hover (pause on hover)
     */
    handleCarouselHover() {
        if (this.pauseOnHover) {
            this.pauseAutoRotation();
        }
    }

    /**
     * Handle carousel mouse leave (resume auto-rotation)
     */
    handleCarouselLeave() {
        if (this.pauseOnHover && this.isPlaying) {
            this.resumeAutoRotation();
        }
    }

    //#endregion

    //#region Touch/Swipe Support

    /**
     * Handle touch start for swipe detection
     * TODO: Implement touch event handling
     */
    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
    }

    /**
     * Handle touch end for swipe detection
     * TODO: Implement touch event handling
     */
    handleTouchEnd(event) {
        this.touchEndX = event.changedTouches[0].clientX;
        this.handleSwipeGesture();
    }

    /**
     * Process swipe gesture
     * TODO: Implement swipe gesture processing
     */
    handleSwipeGesture() {
        const swipeDistance = this.touchEndX - this.touchStartX;

        if (Math.abs(swipeDistance) > this.minSwipeDistance) {
            if (swipeDistance > 0) {
                // Swipe right - previous slide
                this.goToPreviousSlide();
            } else {
                // Swipe left - next slide
                this.goToNextSlide();
            }

            // Pause and resume auto-rotation
            this.pauseAutoRotation();
            setTimeout(() => this.resumeAutoRotation(), 3000);
        }
    }

    //#endregion

    //#region Event Dispatching

    /**
     * Dispatch slide change event
     */
    dispatchSlideChangeEvent(previousIndex, currentIndex) {
        this.dispatchEvent(new CustomEvent('slidechange', {
            detail: {
                previousSlide: previousIndex,
                currentSlide: currentIndex,
                totalSlides: this.slidesData.length,
                slideData: this.slidesData[currentIndex]
            },
            bubbles: true,
            composed: true
        }));
    }

    //#endregion
}