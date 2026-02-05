import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HeroCarousel extends NavigationMixin(LightningElement) {
    @api autoPlay = true;
    @api autoPlayInterval = 5000;
    @api showNavigation = true;
    @api showIndicators = true;
    @api showProgressBar = false;
    @api loop = true;
    @api animationType = 'slide'; // slide, fade
    @api slidesData = [];

    @track currentSlideIndex = 0;
    @track isLoading = true;
    @track carouselSlides = [];
    @track isPlaying = false;
    @track progressBarWidth = 0;

    // Internal state
    autoPlayTimer;
    progressTimer;
    isUserInteracting = false;

    // Default slides data (fallback)
    defaultSlides = [
        {
            id: '1',
            title: 'Summer Collection 2024',
            subtitle: 'New Arrivals',
            description: 'Discover our latest summer styles with up to 50% off selected items.',
            backgroundImage: '/resource/carousel_slide_1',
            primaryAction: { label: 'Shop Now', url: '/products?category=summer-collection' },
            secondaryAction: { label: 'Learn More', url: '/collections/summer-2024' }
        },
        {
            id: '2',
            title: 'Electronics Sale',
            subtitle: 'Tech Deals',
            description: 'Unbeatable prices on smartphones, laptops, and accessories.',
            backgroundImage: '/resource/carousel_slide_2',
            primaryAction: { label: 'View Deals', url: '/products?category=electronics&sale=true' }
        },
        {
            id: '3',
            title: 'Free Shipping',
            subtitle: 'On Orders Over $50',
            description: 'Enjoy free shipping on all orders above $50. Limited time offer!',
            backgroundImage: '/resource/carousel_slide_3',
            primaryAction: { label: 'Start Shopping', url: '/products' }
        }
    ];

    connectedCallback() {
        this.initializeCarousel();
    }

    disconnectedCallback() {
        this.clearTimers();
    }

    // Getters
    get showNoDataMessage() {
        return !this.isLoading && this.carouselSlides.length === 0;
    }

    get carouselTrackStyle() {
        const translateX = -this.currentSlideIndex * 100;
        return `transform: translateX(${translateX}%); transition: transform 0.5s ease-in-out;`;
    }

    get progressBarStyle() {
        return `width: ${this.progressBarWidth}%;`;
    }

    get isPrevDisabled() {
        return !this.loop && this.currentSlideIndex === 0;
    }

    get isNextDisabled() {
        return !this.loop && this.currentSlideIndex === this.carouselSlides.length - 1;
    }

    // Initialize carousel
    async initializeCarousel() {
        try {
            await this.loadSlides();
            this.setupCarousel();
            this.isLoading = false;

            if (this.autoPlay && this.carouselSlides.length > 1) {
                this.startAutoPlay();
            }
        } catch (error) {
            console.error('Error initializing carousel:', error);
            this.isLoading = false;
        }
    }

    async loadSlides() {
        try {
            // Use provided slides data or fallback to defaults
            const slidesData = this.slidesData && this.slidesData.length > 0
                ? this.slidesData
                : this.defaultSlides;

            this.carouselSlides = slidesData.map((slide, index) => ({
                ...slide,
                slideClass: `carousel-slide ${index === 0 ? 'active' : ''}`,
                indicatorClass: `indicator ${index === 0 ? 'active' : ''}`,
                indicatorLabel: `Go to slide ${index + 1}`,
                backgroundStyle: slide.backgroundImage
                    ? `background-image: url(${slide.backgroundImage}); background-size: cover; background-position: center;`
                    : 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
                hasActions: slide.primaryAction || slide.secondaryAction,
                titleAnimation: `slide-in-${index % 3}`,
                subtitleAnimation: `slide-in-${(index + 1) % 3}`,
                descriptionAnimation: `slide-in-${(index + 2) % 3}`,
                actionsAnimation: `slide-in-${(index + 3) % 3}`
            }));
        } catch (error) {
            console.error('Error loading slides:', error);
            this.carouselSlides = [];
        }
    }

    setupCarousel() {
        this.currentSlideIndex = 0;
        this.updateSlideClasses();
    }

    updateSlideClasses() {
        this.carouselSlides = this.carouselSlides.map((slide, index) => ({
            ...slide,
            slideClass: `carousel-slide ${index === this.currentSlideIndex ? 'active' : ''}`,
            indicatorClass: `indicator ${index === this.currentSlideIndex ? 'active' : ''}`
        }));
    }

    // Navigation methods
    nextSlide() {
        this.pauseAutoPlay();
        this.moveToNextSlide();
        this.resumeAutoPlayAfterDelay();
    }

    previousSlide() {
        this.pauseAutoPlay();
        this.moveToPreviousSlide();
        this.resumeAutoPlayAfterDelay();
    }

    goToSlide(event) {
        const targetIndex = parseInt(event.currentTarget.dataset.slideIndex, 10);
        this.pauseAutoPlay();
        this.moveToSlide(targetIndex);
        this.resumeAutoPlayAfterDelay();
    }

    moveToNextSlide() {
        if (this.currentSlideIndex < this.carouselSlides.length - 1) {
            this.currentSlideIndex++;
        } else if (this.loop) {
            this.currentSlideIndex = 0;
        }
        this.updateSlideClasses();
        this.resetProgressBar();
    }

    moveToPreviousSlide() {
        if (this.currentSlideIndex > 0) {
            this.currentSlideIndex--;
        } else if (this.loop) {
            this.currentSlideIndex = this.carouselSlides.length - 1;
        }
        this.updateSlideClasses();
        this.resetProgressBar();
    }

    moveToSlide(index) {
        if (index >= 0 && index < this.carouselSlides.length) {
            this.currentSlideIndex = index;
            this.updateSlideClasses();
            this.resetProgressBar();
        }
    }

    // Action handlers
    handlePrimaryAction(event) {
        const slideId = event.currentTarget.dataset.slideId;
        const actionUrl = event.currentTarget.dataset.actionUrl;
        this.handleSlideAction(slideId, actionUrl, 'primary');
    }

    handleSecondaryAction(event) {
        const slideId = event.currentTarget.dataset.slideId;
        const actionUrl = event.currentTarget.dataset.actionUrl;
        this.handleSlideAction(slideId, actionUrl, 'secondary');
    }

    handleSlideAction(slideId, actionUrl, actionType) {
        try {
            // Track the click event
            this.dispatchEvent(new CustomEvent('slideaction', {
                detail: {
                    slideId,
                    actionType,
                    actionUrl,
                    slideIndex: this.currentSlideIndex
                },
                bubbles: true,
                composed: true
            }));

            // Navigate to the URL
            if (actionUrl) {
                this.navigateToUrl(actionUrl);
            }
        } catch (error) {
            console.error('Error handling slide action:', error);
        }
    }

    navigateToUrl(url) {
        if (url.startsWith('http') || url.startsWith('//')) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: url
                }
            });
        }
    }

    // Auto-play functionality
    startAutoPlay() {
        if (this.autoPlay && this.carouselSlides.length > 1 && !this.isPlaying) {
            this.isPlaying = true;
            this.autoPlayTimer = setInterval(() => {
                if (!this.isUserInteracting) {
                    this.moveToNextSlide();
                }
            }, this.autoPlayInterval);

            if (this.showProgressBar) {
                this.startProgressBar();
            }
        }
    }

    pauseAutoPlay() {
        this.isUserInteracting = true;
        this.isPlaying = false;
        clearInterval(this.autoPlayTimer);
        clearInterval(this.progressTimer);
    }

    resumeAutoPlayAfterDelay() {
        setTimeout(() => {
            this.isUserInteracting = false;
            if (this.autoPlay) {
                this.startAutoPlay();
            }
        }, 3000);
    }

    startProgressBar() {
        this.progressBarWidth = 0;
        const progressInterval = 50; // Update every 50ms
        const progressStep = (100 * progressInterval) / this.autoPlayInterval;

        this.progressTimer = setInterval(() => {
            this.progressBarWidth += progressStep;
            if (this.progressBarWidth >= 100) {
                this.resetProgressBar();
            }
        }, progressInterval);
    }

    resetProgressBar() {
        this.progressBarWidth = 0;
        clearInterval(this.progressTimer);
        if (this.isPlaying && this.showProgressBar) {
            this.startProgressBar();
        }
    }

    clearTimers() {
        clearInterval(this.autoPlayTimer);
        clearInterval(this.progressTimer);
        this.isPlaying = false;
    }

    // Touch/Swipe support (basic implementation)
    @api
    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.pauseAutoPlay();
    }

    @api
    handleTouchEnd(event) {
        if (!this.touchStartX) return;

        const touchEndX = event.changedTouches[0].clientX;
        const touchDiff = this.touchStartX - touchEndX;
        const minSwipeDistance = 50;

        if (Math.abs(touchDiff) > minSwipeDistance) {
            if (touchDiff > 0) {
                this.moveToNextSlide();
            } else {
                this.moveToPreviousSlide();
            }
        }

        this.touchStartX = null;
        this.resumeAutoPlayAfterDelay();
    }

    // Keyboard navigation
    @api
    handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousSlide();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextSlide();
                break;
            case ' ':
            case 'Enter':
                event.preventDefault();
                if (this.isPlaying) {
                    this.pauseAutoPlay();
                } else {
                    this.startAutoPlay();
                }
                break;
        }
    }

    // Public API methods
    @api
    play() {
        this.startAutoPlay();
    }

    @api
    pause() {
        this.pauseAutoPlay();
    }

    @api
    goTo(index) {
        this.moveToSlide(index);
    }

    @api
    next() {
        this.nextSlide();
    }

    @api
    previous() {
        this.previousSlide();
    }

    @api
    updateSlides(newSlidesData) {
        this.slidesData = newSlidesData;
        this.initializeCarousel();
    }
}