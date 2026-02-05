import { LightningElement, api, track } from 'lwc';

/**
 * featuredCategories - Grid display of product categories with visual representation
 *
 * Features:
 * - Responsive grid layout (2 columns mobile, 3-4 columns desktop)
 * - Category cards with image, title, and product count
 * - Hover effects and visual feedback
 * - Click navigation to category pages
 * - Support for up to 12 featured categories
 * - Fallback images for categories without images
 * - Loading states and empty state handling
 */
export default class FeaturedCategories extends LightningElement {

    //#region Public API Properties

    /**
     * Maximum number of categories to display
     */
    @api maxCategories = 12;

    /**
     * Show quick action buttons (favorite, share)
     */
    @api showQuickActions = false;

    /**
     * Enable category descriptions
     */
    @api showDescriptions = true;

    /**
     * Show "View All Categories" button when more categories available
     */
    @api showViewAllButton = true;

    /**
     * Custom section title
     */
    @api sectionTitle = 'Shop by Category';

    /**
     * Custom section subtitle
     */
    @api sectionSubtitle = 'Discover our most popular product categories';

    //#endregion

    //#region Private Tracked Properties

    /**
     * Loading state for categories
     */
    @track isLoading = true;

    /**
     * Array of category data
     */
    @track categoriesData = [];

    /**
     * Error state for failed data loading
     */
    @track hasError = false;

    /**
     * Error message
     */
    @track errorMessage = '';

    //#endregion

    //#region Computed Properties

    /**
     * Categories to display based on maxCategories limit
     */
    get displayedCategories() {
        return this.categoriesData.slice(0, this.maxCategories).map(category => ({
            ...category,
            ariaLabel: `View ${category.title} category with ${category.productCount} products`,
            productCountDisplay: this.formatProductCount(category.productCount),
            badgeClass: this.getBadgeClass(category.badge),
            fallbackIcon: this.getCategoryIcon(category.type),
            imageAlt: `${category.title} category image`
        }));
    }

    /**
     * Check if there are more categories than displayed
     */
    get hasMoreCategories() {
        return this.showViewAllButton && this.categoriesData.length > this.maxCategories;
    }

    /**
     * Show empty state when no categories and not loading
     */
    get showEmptyState() {
        return !this.isLoading && this.categoriesData.length === 0 && !this.hasError;
    }

    /**
     * Loading skeleton placeholders
     */
    get loadingSkeletons() {
        return Array(8).fill().map((_, index) => ({ id: `skeleton-${index}` }));
    }

    //#endregion

    //#region Lifecycle Hooks

    /**
     * Component initialization
     */
    connectedCallback() {
        this.loadCategoriesData();
    }

    //#endregion

    //#region Data Loading

    /**
     * Load categories data
     * TODO: Replace with actual Salesforce data service or external API
     */
    async loadCategoriesData() {
        try {
            this.isLoading = true;
            this.hasError = false;

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock categories data - replace with actual service call
            this.categoriesData = this.getMockCategoriesData();

        } catch (error) {
            this.hasError = true;
            this.errorMessage = 'Failed to load categories. Please try again later.';
            console.error('Error loading categories:', error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Mock categories data
     * TODO: Replace with actual data from Salesforce or external service
     */
    getMockCategoriesData() {
        return [
            {
                id: 'cat-1',
                title: 'Electronics',
                description: 'Latest gadgets and technology',
                productCount: 1247,
                imageUrl: '/resource/category-electronics.jpg',
                url: '/products/electronics',
                type: 'electronics',
                badge: 'Hot',
                featured: true
            },
            {
                id: 'cat-2',
                title: 'Fashion',
                description: 'Trendy clothing and accessories',
                productCount: 892,
                imageUrl: '/resource/category-fashion.jpg',
                url: '/products/fashion',
                type: 'fashion',
                badge: 'New',
                featured: true
            },
            {
                id: 'cat-3',
                title: 'Home & Garden',
                description: 'Everything for your home and garden',
                productCount: 634,
                imageUrl: '/resource/category-home.jpg',
                url: '/products/home-garden',
                type: 'home',
                featured: true
            },
            {
                id: 'cat-4',
                title: 'Sports & Fitness',
                description: 'Gear for active lifestyles',
                productCount: 456,
                imageUrl: '/resource/category-sports.jpg',
                url: '/products/sports',
                type: 'sports',
                featured: true
            },
            {
                id: 'cat-5',
                title: 'Books & Media',
                description: 'Books, movies, and entertainment',
                productCount: 789,
                imageUrl: '/resource/category-books.jpg',
                url: '/products/books',
                type: 'books',
                featured: true
            },
            {
                id: 'cat-6',
                title: 'Automotive',
                description: 'Car parts and accessories',
                productCount: 312,
                imageUrl: '/resource/category-automotive.jpg',
                url: '/products/automotive',
                type: 'automotive',
                featured: true
            },
            {
                id: 'cat-7',
                title: 'Health & Beauty',
                description: 'Personal care and wellness',
                productCount: 523,
                imageUrl: '/resource/category-health.jpg',
                url: '/products/health-beauty',
                type: 'health',
                badge: 'Sale',
                featured: true
            },
            {
                id: 'cat-8',
                title: 'Toys & Games',
                description: 'Fun for all ages',
                productCount: 267,
                imageUrl: '/resource/category-toys.jpg',
                url: '/products/toys',
                type: 'toys',
                featured: true
            }
        ];
    }

    //#endregion

    //#region Event Handlers

    /**
     * Handle category card click navigation
     */
    handleCategoryClick(event) {
        const categoryId = event.currentTarget.dataset.categoryId;
        const categoryUrl = event.currentTarget.dataset.categoryUrl;

        this.navigateToCategory(categoryId, categoryUrl);
    }

    /**
     * Handle category card keyboard navigation
     */
    handleCategoryKeydown(event) {
        // Handle Enter and Space key presses
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            const categoryId = event.currentTarget.dataset.categoryId;
            const categoryUrl = event.currentTarget.dataset.categoryUrl;

            this.navigateToCategory(categoryId, categoryUrl);
        }
    }

    /**
     * Handle "View Products" button click
     */
    handleViewCategoryClick(event) {
        event.stopPropagation(); // Prevent parent card click
        const categoryId = event.currentTarget.dataset.categoryId;
        const categoryUrl = event.currentTarget.dataset.categoryUrl;

        this.navigateToCategory(categoryId, categoryUrl);
    }

    /**
     * Handle "View All Categories" button click
     */
    handleViewAllCategories() {
        this.dispatchEvent(new CustomEvent('viewallcategories', {
            detail: {
                totalCategories: this.categoriesData.length,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        }));

        // TODO: Navigate to all categories page
        console.log('Navigate to all categories page');
    }

    /**
     * Handle add to favorites action
     */
    handleAddToFavorites(event) {
        event.stopPropagation();
        const categoryId = event.currentTarget.dataset.categoryId;

        this.dispatchEvent(new CustomEvent('addcategorytofavorites', {
            detail: {
                categoryId: categoryId,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        }));

        // TODO: Implement add to favorites functionality
        console.log('Add category to favorites:', categoryId);
    }

    /**
     * Handle share category action
     */
    handleShareCategory(event) {
        event.stopPropagation();
        const categoryId = event.currentTarget.dataset.categoryId;

        this.dispatchEvent(new CustomEvent('sharecategory', {
            detail: {
                categoryId: categoryId,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            composed: true
        }));

        // TODO: Implement category sharing functionality
        console.log('Share category:', categoryId);
    }

    /**
     * Handle image loading error
     */
    handleImageError(event) {
        const categoryId = event.currentTarget.dataset.categoryId;

        // Find and update the category to remove the broken image
        this.categoriesData = this.categoriesData.map(category => {
            if (category.id === categoryId) {
                return { ...category, imageUrl: null };
            }
            return category;
        });

        console.log('Image failed to load for category:', categoryId);
    }

    //#endregion

    //#region Navigation

    /**
     * Navigate to category page
     */
    navigateToCategory(categoryId, categoryUrl) {
        // Dispatch navigation event
        this.dispatchEvent(new CustomEvent('categorynavigation', {
            detail: {
                categoryId: categoryId,
                url: categoryUrl,
                timestamp: new Date().toISOString(),
                source: 'featuredCategories'
            },
            bubbles: true,
            composed: true
        }));

        // TODO: Implement actual navigation logic
        console.log(`Navigate to category: ${categoryId} -> ${categoryUrl}`);
    }

    //#endregion

    //#region Utility Methods

    /**
     * Format product count for display
     */
    formatProductCount(count) {
        if (count === 1) {
            return '1 product';
        } else if (count < 1000) {
            return `${count} products`;
        } else if (count < 1000000) {
            return `${(count / 1000).toFixed(1)}k products`;
        } else {
            return `${(count / 1000000).toFixed(1)}M products`;
        }
    }

    /**
     * Get CSS class for category badge
     */
    getBadgeClass(badgeType) {
        const baseClass = 'slds-badge category-badge';

        switch (badgeType) {
            case 'Hot':
                return `${baseClass} badge-hot`;
            case 'New':
                return `${baseClass} badge-new`;
            case 'Sale':
                return `${baseClass} badge-sale`;
            default:
                return baseClass;
        }
    }

    /**
     * Get fallback icon based on category type
     */
    getCategoryIcon(categoryType) {
        const iconMap = {
            electronics: 'utility:desktop',
            fashion: 'utility:ribbon',
            home: 'utility:home',
            sports: 'utility:activity',
            books: 'utility:knowledge_base',
            automotive: 'utility:truck',
            health: 'utility:heart',
            toys: 'utility:diamond',
            default: 'utility:apps'
        };

        return iconMap[categoryType] || iconMap.default;
    }

    //#endregion

    //#region Public Methods

    /**
     * Refresh categories data
     * @api
     */
    @api
    refreshCategories() {
        this.loadCategoriesData();
    }

    /**
     * Get category by ID
     * @api
     */
    @api
    getCategoryById(categoryId) {
        return this.categoriesData.find(category => category.id === categoryId);
    }

    //#endregion
}