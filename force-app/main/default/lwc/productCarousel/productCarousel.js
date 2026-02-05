import { LightningElement, api, track } from 'lwc';

export default class ProductCarousel extends LightningElement {
    @api carouselTitle = 'Featured Products';
    @api carouselSubtitle = 'Discover our top picks';
    @api carouselType = 'featured'; // featured, new-arrivals, best-sellers
    @api maxProducts = 8;
    @api showNavigation = true;

    @track products = [];
    @track currentStartIndex = 0;
    @track isLoading = true;

    get sectionAriaLabel() {
        return `${this.carouselTitle} product carousel`;
    }

    get hasProducts() {
        return !this.isLoading && this.products.length > 0;
    }

    get visibleProducts() {
        const itemsPerPage = 4;
        return this.products.slice(this.currentStartIndex, this.currentStartIndex + itemsPerPage)
            .map(product => ({
                ...product,
                ratingStars: this.generateRatingStars(product.rating),
                imageAlt: `${product.name} product image`
            }));
    }

    get isPreviousDisabled() {
        return this.currentStartIndex === 0;
    }

    get isNextDisabled() {
        const itemsPerPage = 4;
        return this.currentStartIndex + itemsPerPage >= this.products.length;
    }

    get loadingItems() {
        return Array(4).fill().map((_, index) => ({ id: `loading-${index}` }));
    }

    connectedCallback() {
        this.loadProducts();
    }

    async loadProducts() {
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            this.products = this.getMockProducts();
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            this.isLoading = false;
        }
    }

    getMockProducts() {
        return [
            {
                id: 'prod-1',
                name: 'Wireless Bluetooth Headphones',
                currentPrice: '89.99',
                originalPrice: '119.99',
                imageUrl: '/resource/product-1.jpg',
                rating: 4.5,
                reviewCount: 234,
                isOnSale: true
            },
            {
                id: 'prod-2',
                name: 'Smart Watch Pro',
                currentPrice: '299.99',
                imageUrl: '/resource/product-2.jpg',
                rating: 4.8,
                reviewCount: 567,
                isOnSale: false
            },
            {
                id: 'prod-3',
                name: 'Laptop Backpack',
                currentPrice: '49.99',
                originalPrice: '69.99',
                imageUrl: '/resource/product-3.jpg',
                rating: 4.2,
                reviewCount: 123,
                isOnSale: true
            },
            {
                id: 'prod-4',
                name: 'Wireless Mouse',
                currentPrice: '24.99',
                imageUrl: '/resource/product-4.jpg',
                rating: 4.0,
                reviewCount: 89,
                isOnSale: false
            },
            {
                id: 'prod-5',
                name: 'USB-C Hub',
                currentPrice: '39.99',
                imageUrl: '/resource/product-5.jpg',
                rating: 4.3,
                reviewCount: 156,
                isOnSale: false
            },
            {
                id: 'prod-6',
                name: 'Phone Stand',
                currentPrice: '14.99',
                originalPrice: '19.99',
                imageUrl: '/resource/product-6.jpg',
                rating: 4.1,
                reviewCount: 67,
                isOnSale: true
            }
        ];
    }

    generateRatingStars(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push({
                id: `star-${i}`,
                icon: 'utility:favorite',
                class: 'star-filled'
            });
        }

        if (hasHalfStar) {
            stars.push({
                id: `star-half`,
                icon: 'utility:favorite',
                class: 'star-half'
            });
        }

        const remainingStars = 5 - stars.length;
        for (let i = 0; i < remainingStars; i++) {
            stars.push({
                id: `star-empty-${i}`,
                icon: 'utility:favorite',
                class: 'star-empty'
            });
        }

        return stars;
    }

    handlePrevious() {
        this.currentStartIndex = Math.max(0, this.currentStartIndex - 4);
    }

    handleNext() {
        this.currentStartIndex = Math.min(this.products.length - 4, this.currentStartIndex + 4);
    }

    handleProductClick(event) {
        const productId = event.currentTarget.dataset.productId;
        this.dispatchEvent(new CustomEvent('productclick', {
            detail: { productId },
            bubbles: true,
            composed: true
        }));
    }

    handleAddToCart(event) {
        event.stopPropagation();
        const productId = event.currentTarget.dataset.productId;
        this.dispatchEvent(new CustomEvent('addtocart', {
            detail: { productId },
            bubbles: true,
            composed: true
        }));
    }

    handleAddToWishlist(event) {
        event.stopPropagation();
        const productId = event.currentTarget.dataset.productId;
        this.dispatchEvent(new CustomEvent('addtowishlist', {
            detail: { productId },
            bubbles: true,
            composed: true
        }));
    }

    handleViewAll() {
        this.dispatchEvent(new CustomEvent('viewall', {
            detail: { carouselType: this.carouselType },
            bubbles: true,
            composed: true
        }));
    }
}