import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class EcommerceHeader extends NavigationMixin(LightningElement) {
    @api showSearchBar = true;
    @api showCartIcon = true;
    @api showUserAccount = true;
    @api logoText = 'eShop';
    @api enableStickyHeader = true;

    @track searchQuery = '';
    @track mobileSearchQuery = '';
    @track isSticky = false;
    @track showMobileMenu = false;
    @track showSearchSuggestions = false;
    @track searchSuggestions = [];
    @track cartItemCount = 0;
    @track isLoggedIn = false;

    // Navigation items data
    navigationItems = [
        {
            id: '1',
            label: 'Electronics',
            category: 'electronics',
            hasChildren: true,
            children: [
                { id: '1-1', label: 'Smartphones', category: 'smartphones' },
                { id: '1-2', label: 'Laptops', category: 'laptops' },
                { id: '1-3', label: 'Tablets', category: 'tablets' },
                { id: '1-4', label: 'Audio', category: 'audio' }
            ]
        },
        {
            id: '2',
            label: 'Fashion',
            category: 'fashion',
            hasChildren: true,
            children: [
                { id: '2-1', label: 'Men\'s Clothing', category: 'mens-clothing' },
                { id: '2-2', label: 'Women\'s Clothing', category: 'womens-clothing' },
                { id: '2-3', label: 'Shoes', category: 'shoes' },
                { id: '2-4', label: 'Accessories', category: 'accessories' }
            ]
        },
        {
            id: '3',
            label: 'Home & Garden',
            category: 'home-garden',
            hasChildren: true,
            children: [
                { id: '3-1', label: 'Furniture', category: 'furniture' },
                { id: '3-2', label: 'Kitchen', category: 'kitchen' },
                { id: '3-3', label: 'Garden', category: 'garden' },
                { id: '3-4', label: 'Decor', category: 'decor' }
            ]
        },
        {
            id: '4',
            label: 'Sports & Fitness',
            category: 'sports-fitness',
            hasChildren: false
        },
        {
            id: '5',
            label: 'Books & Media',
            category: 'books-media',
            hasChildren: false
        },
        {
            id: '6',
            label: 'Sale',
            category: 'sale',
            hasChildren: false
        }
    ];

    connectedCallback() {
        this.loadUserData();
        this.loadCartData();

        if (this.enableStickyHeader) {
            this.setupStickyHeader();
        }
    }

    disconnectedCallback() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('scroll', this.handleScroll);
            window.removeEventListener('resize', this.handleResize);
        }
    }

    // Getters
    get navigationClasses() {
        return this.showMobileMenu ? 'mobile-open' : '';
    }

    // User data loading
    loadUserData() {
        try {
            // Check if user is logged in (localStorage simulation)
            const userData = localStorage.getItem('ecommerce_user');
            this.isLoggedIn = userData ? true : false;
        } catch (error) {
            console.error('Error loading user data:', error);
            this.isLoggedIn = false;
        }
    }

    // Cart data loading
    loadCartData() {
        try {
            // Load cart count from localStorage simulation
            const cartData = localStorage.getItem('ecommerce_cart');
            if (cartData) {
                const cart = JSON.parse(cartData);
                this.cartItemCount = cart.items ? cart.items.length : 0;
            }
        } catch (error) {
            console.error('Error loading cart data:', error);
            this.cartItemCount = 0;
        }
    }

    // Sticky header functionality
    setupStickyHeader() {
        if (typeof window !== 'undefined') {
            this.handleScroll = this.handleScroll.bind(this);
            window.addEventListener('scroll', this.handleScroll);
        }
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.isSticky = scrollTop > 100;
    }

    // Navigation handlers
    navigateToHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/home'
            }
        });
    }

    handleNavigation(event) {
        event.preventDefault();
        const category = event.currentTarget.dataset.category;

        if (category) {
            this.navigateToCategory(category);
        }
    }

    handleMobileNavigation(event) {
        event.preventDefault();
        const category = event.currentTarget.dataset.category;

        if (category) {
            this.closeMobileMenu();
            this.navigateToCategory(category);
        }
    }

    navigateToCategory(category) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/products?category=${category}`
            }
        });
    }

    // Search functionality
    handleSearchInput(event) {
        this.searchQuery = event.target.value;
        this.debouncedSearch();
    }

    handleMobileSearch(event) {
        this.mobileSearchQuery = event.target.value;
    }

    handleSearchKeyup(event) {
        if (event.key === 'Enter') {
            this.performSearch();
        }
    }

    debouncedSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.getSearchSuggestions();
        }, 300);
    }

    getSearchSuggestions() {
        if (this.searchQuery.length > 2) {
            // Mock search suggestions
            this.searchSuggestions = [
                { id: '1', name: `${this.searchQuery} in Electronics` },
                { id: '2', name: `${this.searchQuery} in Fashion` },
                { id: '3', name: `${this.searchQuery} in Home & Garden` }
            ];
            this.showSearchSuggestions = true;
        } else {
            this.showSearchSuggestions = false;
        }
    }

    selectSuggestion(event) {
        const suggestion = event.currentTarget.dataset.suggestion;
        this.searchQuery = suggestion;
        this.showSearchSuggestions = false;
        this.performSearch();
    }

    performSearch() {
        if (this.searchQuery.trim()) {
            this.showSearchSuggestions = false;
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: `/search?q=${encodeURIComponent(this.searchQuery)}`
                }
            });
        }
    }

    // Mobile menu functionality
    toggleMobileMenu() {
        this.showMobileMenu = !this.showMobileMenu;
        this.toggleBodyScroll();
    }

    closeMobileMenu() {
        this.showMobileMenu = false;
        this.toggleBodyScroll();
    }

    stopPropagation(event) {
        event.stopPropagation();
    }

    toggleBodyScroll() {
        if (typeof document !== 'undefined') {
            if (this.showMobileMenu) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    // Cart functionality
    openCart() {
        this.dispatchEvent(new CustomEvent('opencart', {
            bubbles: true,
            composed: true
        }));
    }

    // Account functionality
    navigateToProfile() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/profile'
            }
        });
    }

    navigateToOrders() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/orders'
            }
        });
    }

    navigateToWishlist() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/wishlist'
            }
        });
    }

    navigateToLogin() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/login'
            }
        });
    }

    navigateToRegister() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/register'
            }
        });
    }

    handleLogout() {
        try {
            localStorage.removeItem('ecommerce_user');
            this.isLoggedIn = false;
            this.dispatchEvent(new CustomEvent('userlogout', {
                bubbles: true,
                composed: true
            }));
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    // Utility navigation handlers
    handleCustomerService() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/support'
            }
        });
    }

    handleTrackOrder() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/track-order'
            }
        });
    }

    // Public methods for parent components
    @api
    updateCartCount(count) {
        this.cartItemCount = count;
    }

    @api
    updateUserStatus(isLoggedIn) {
        this.isLoggedIn = isLoggedIn;
    }

    @api
    performHeaderSearch(query) {
        this.searchQuery = query;
        this.performSearch();
    }
}