import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class ShoppingCart extends NavigationMixin(LightningElement) {
    @api isCompactView = false;
    @api showCheckoutProgress = true;
    @api enableCoupons = true;
    @api showTax = true;
    @api freeShippingThreshold = 50;

    @track cartItems = [];
    @track isLoading = false;
    @track couponCode = '';
    @track appliedCoupon = null;
    @track showCouponInput = false;
    @track isApplyingCoupon = false;
    @track couponMessage = '';
    @track couponMessageType = '';
    @track recentItems = [];

    // Mock data for demonstration
    mockCartItems = [
        {
            id: '1',
            productId: 'prod-1',
            name: 'Wireless Bluetooth Headphones',
            brand: 'TechSound',
            sku: 'TS-WBH-001',
            variant: 'Black, Noise Cancelling',
            price: 129.99,
            originalPrice: 149.99,
            quantity: 1,
            maxQuantity: 10,
            imageUrl: '/resource/product_headphones',
            available: true,
            totalPrice: 129.99
        },
        {
            id: '2',
            productId: 'prod-2',
            name: 'Smart Fitness Watch',
            brand: 'FitTech',
            sku: 'FT-SFW-002',
            variant: 'Silver, 42mm',
            price: 249.99,
            quantity: 2,
            maxQuantity: 5,
            imageUrl: '/resource/product_watch',
            available: true,
            totalPrice: 499.98
        }
    ];

    connectedCallback() {
        this.loadCartData();
        this.loadRecentItems();
    }

    // Getters
    get hasItems() {
        return this.cartItems && this.cartItems.length > 0;
    }

    get cartItemCount() {
        return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    get subtotal() {
        const total = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
        return total.toFixed(2);
    }

    get shippingCost() {
        const subtotalAmount = parseFloat(this.subtotal);
        return subtotalAmount >= this.freeShippingThreshold ? 0 : 9.99;
    }

    get shippingText() {
        return this.shippingCost === 0 ? 'FREE' : `$${this.shippingCost.toFixed(2)}`;
    }

    get tax() {
        const subtotalAmount = parseFloat(this.subtotal);
        const taxRate = 0.08; // 8% tax rate
        return (subtotalAmount * taxRate).toFixed(2);
    }

    get discount() {
        if (this.appliedCoupon) {
            const subtotalAmount = parseFloat(this.subtotal);
            if (this.appliedCoupon.type === 'percentage') {
                return (subtotalAmount * this.appliedCoupon.value / 100).toFixed(2);
            } else if (this.appliedCoupon.type === 'fixed') {
                return this.appliedCoupon.value.toFixed(2);
            }
        }
        return 0;
    }

    get total() {
        const subtotalAmount = parseFloat(this.subtotal);
        const shippingAmount = this.shippingCost;
        const taxAmount = this.showTax ? parseFloat(this.tax) : 0;
        const discountAmount = parseFloat(this.discount);

        const totalAmount = subtotalAmount + shippingAmount + taxAmount - discountAmount;
        return Math.max(0, totalAmount).toFixed(2);
    }

    get canCheckout() {
        return this.hasItems && this.cartItems.every(item => item.available);
    }

    get hasRecentItems() {
        return this.recentItems && this.recentItems.length > 0;
    }

    get couponMessageClass() {
        const baseClass = 'coupon-message';
        return this.couponMessageType === 'success'
            ? `${baseClass} success`
            : `${baseClass} error`;
    }

    get couponMessageIcon() {
        return this.couponMessageType === 'success'
            ? 'utility:success'
            : 'utility:error';
    }

    // Data loading methods
    loadCartData() {
        try {
            // Load cart from localStorage or API
            const savedCart = localStorage.getItem('ecommerce_cart');
            if (savedCart) {
                const cartData = JSON.parse(savedCart);
                this.cartItems = this.processCartItems(cartData.items || []);
            } else {
                // Use mock data for demonstration
                this.cartItems = this.processCartItems(this.mockCartItems);
            }
        } catch (error) {
            console.error('Error loading cart data:', error);
            this.cartItems = [];
        }
    }

    loadRecentItems() {
        try {
            const recentItemsData = localStorage.getItem('ecommerce_recent_items');
            if (recentItemsData) {
                this.recentItems = JSON.parse(recentItemsData).slice(0, 4);
            }
        } catch (error) {
            console.error('Error loading recent items:', error);
            this.recentItems = [];
        }
    }

    processCartItems(items) {
        return items.map(item => ({
            ...item,
            totalPrice: (item.price * item.quantity).toFixed(2),
            availabilityClass: item.available ? 'availability in-stock' : 'availability out-of-stock',
            availabilityIcon: item.available ? 'utility:success' : 'utility:warning',
            availabilityText: item.available ? 'In Stock' : 'Out of Stock',
            errorMessage: item.available ? '' : 'This item is currently out of stock'
        }));
    }

    // Quantity management
    increaseQuantity(event) {
        const itemId = event.currentTarget.dataset.itemId;
        this.updateItemQuantity(itemId, 1);
    }

    decreaseQuantity(event) {
        const itemId = event.currentTarget.dataset.itemId;
        this.updateItemQuantity(itemId, -1);
    }

    updateQuantity(event) {
        const itemId = event.currentTarget.dataset.itemId;
        const newQuantity = parseInt(event.target.value, 10);

        if (newQuantity > 0) {
            this.setItemQuantity(itemId, newQuantity);
        }
    }

    updateItemQuantity(itemId, quantityChange) {
        const item = this.cartItems.find(cartItem => cartItem.id === itemId);
        if (item) {
            const newQuantity = item.quantity + quantityChange;
            if (newQuantity > 0 && newQuantity <= item.maxQuantity) {
                this.setItemQuantity(itemId, newQuantity);
            }
        }
    }

    async setItemQuantity(itemId, newQuantity) {
        this.isLoading = true;

        try {
            // Update item quantity
            this.cartItems = this.cartItems.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        quantity: newQuantity,
                        totalPrice: (item.price * newQuantity).toFixed(2)
                    };
                }
                return item;
            });

            await this.saveCartData();
            this.dispatchCartUpdate();

        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showError('Failed to update quantity. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    // Item management
    async removeItem(event) {
        const itemId = event.currentTarget.dataset.itemId;

        try {
            this.isLoading = true;

            this.cartItems = this.cartItems.filter(item => item.id !== itemId);
            await this.saveCartData();
            this.dispatchCartUpdate();

            this.dispatchEvent(new CustomEvent('itemremoved', {
                detail: { itemId },
                bubbles: true,
                composed: true
            }));

        } catch (error) {
            console.error('Error removing item:', error);
            this.showError('Failed to remove item. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }

    async moveToWishlist(event) {
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.cartItems.find(cartItem => cartItem.id === itemId);

        if (item) {
            try {
                this.isLoading = true;

                // Add to wishlist
                await this.addToWishlist(item);

                // Remove from cart
                this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== itemId);
                await this.saveCartData();
                this.dispatchCartUpdate();

                this.showSuccess('Item moved to wishlist');

            } catch (error) {
                console.error('Error moving to wishlist:', error);
                this.showError('Failed to move item to wishlist.');
            } finally {
                this.isLoading = false;
            }
        }
    }

    async addToWishlist(item) {
        try {
            const wishlist = JSON.parse(localStorage.getItem('ecommerce_wishlist') || '[]');
            const existingItem = wishlist.find(wishItem => wishItem.productId === item.productId);

            if (!existingItem) {
                wishlist.push({
                    id: Date.now().toString(),
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    dateAdded: new Date().toISOString()
                });
                localStorage.setItem('ecommerce_wishlist', JSON.stringify(wishlist));
            }
        } catch (error) {
            throw new Error('Failed to add item to wishlist');
        }
    }

    // Coupon functionality
    showCouponField() {
        this.showCouponInput = true;
    }

    handleCouponInput(event) {
        this.couponCode = event.target.value.toUpperCase();
        this.clearCouponMessage();
    }

    async applyCoupon() {
        if (!this.couponCode.trim()) {
            this.showCouponError('Please enter a coupon code.');
            return;
        }

        this.isApplyingCoupon = true;
        this.clearCouponMessage();

        try {
            const coupon = await this.validateCoupon(this.couponCode);

            if (coupon) {
                this.appliedCoupon = coupon;
                this.couponCode = '';
                this.showCouponInput = false;
                this.showCouponSuccess(`Coupon applied! You saved $${this.discount}`);

                this.dispatchEvent(new CustomEvent('couponapplied', {
                    detail: { coupon },
                    bubbles: true,
                    composed: true
                }));
            } else {
                this.showCouponError('Invalid or expired coupon code.');
            }

        } catch (error) {
            console.error('Error applying coupon:', error);
            this.showCouponError('Failed to apply coupon. Please try again.');
        } finally {
            this.isApplyingCoupon = false;
        }
    }

    async validateCoupon(code) {
        // Mock coupon validation
        const mockCoupons = {
            'SAVE10': { code: 'SAVE10', type: 'percentage', value: 10, minOrder: 0 },
            'WELCOME20': { code: 'WELCOME20', type: 'percentage', value: 20, minOrder: 100 },
            'FREESHIP': { code: 'FREESHIP', type: 'fixed', value: 9.99, minOrder: 0 }
        };

        return new Promise((resolve) => {
            setTimeout(() => {
                const coupon = mockCoupons[code];
                const subtotalAmount = parseFloat(this.subtotal);

                if (coupon && subtotalAmount >= coupon.minOrder) {
                    resolve(coupon);
                } else {
                    resolve(null);
                }
            }, 1000);
        });
    }

    removeCoupon() {
        this.appliedCoupon = null;
        this.clearCouponMessage();

        this.dispatchEvent(new CustomEvent('couponremoved', {
            bubbles: true,
            composed: true
        }));
    }

    // Message helpers
    showCouponSuccess(message) {
        this.couponMessage = message;
        this.couponMessageType = 'success';
        this.clearMessageAfterDelay();
    }

    showCouponError(message) {
        this.couponMessage = message;
        this.couponMessageType = 'error';
        this.clearMessageAfterDelay();
    }

    clearCouponMessage() {
        this.couponMessage = '';
        this.couponMessageType = '';
    }

    clearMessageAfterDelay() {
        setTimeout(() => {
            this.clearCouponMessage();
        }, 5000);
    }

    showSuccess(message) {
        this.dispatchEvent(new CustomEvent('showtoast', {
            detail: {
                title: 'Success',
                message,
                variant: 'success'
            },
            bubbles: true,
            composed: true
        }));
    }

    showError(message) {
        this.dispatchEvent(new CustomEvent('showtoast', {
            detail: {
                title: 'Error',
                message,
                variant: 'error'
            },
            bubbles: true,
            composed: true
        }));
    }

    // Navigation methods
    continueShopping() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/products'
            }
        });
    }

    startShopping() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/products'
            }
        });
    }

    viewProduct(event) {
        const productId = event.currentTarget.dataset.productId;
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/product/${productId}`
            }
        });
    }

    proceedToCheckout() {
        if (this.canCheckout) {
            this.dispatchEvent(new CustomEvent('proceedcheckout', {
                detail: {
                    cartItems: this.cartItems,
                    total: this.total,
                    appliedCoupon: this.appliedCoupon
                },
                bubbles: true,
                composed: true
            }));

            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: '/checkout'
                }
            });
        }
    }

    // Recent items
    addRecentItemToCart(event) {
        const productId = event.currentTarget.dataset.productId;
        const recentItem = this.recentItems.find(item => item.id === productId);

        if (recentItem) {
            this.dispatchEvent(new CustomEvent('addtocart', {
                detail: { product: recentItem },
                bubbles: true,
                composed: true
            }));
        }
    }

    // Data persistence
    async saveCartData() {
        try {
            const cartData = {
                items: this.cartItems,
                timestamp: Date.now(),
                appliedCoupon: this.appliedCoupon
            };
            localStorage.setItem('ecommerce_cart', JSON.stringify(cartData));
        } catch (error) {
            console.error('Error saving cart data:', error);
        }
    }

    dispatchCartUpdate() {
        this.dispatchEvent(new CustomEvent('cartupdate', {
            detail: {
                itemCount: this.cartItemCount,
                total: this.total,
                items: this.cartItems
            },
            bubbles: true,
            composed: true
        }));
    }

    // Public API methods
    @api
    addItem(product, quantity = 1) {
        const existingItem = this.cartItems.find(item => item.productId === product.id);

        if (existingItem) {
            this.setItemQuantity(existingItem.id, existingItem.quantity + quantity);
        } else {
            const newItem = {
                id: Date.now().toString(),
                productId: product.id,
                name: product.name,
                brand: product.brand,
                sku: product.sku,
                price: product.price,
                originalPrice: product.originalPrice,
                quantity: quantity,
                maxQuantity: product.maxQuantity || 10,
                imageUrl: product.imageUrl,
                available: product.available !== false,
                variant: product.selectedVariant || '',
                totalPrice: (product.price * quantity).toFixed(2)
            };

            this.cartItems = [...this.cartItems, this.processCartItems([newItem])[0]];
            this.saveCartData();
            this.dispatchCartUpdate();
        }
    }

    @api
    clearCart() {
        this.cartItems = [];
        this.appliedCoupon = null;
        this.saveCartData();
        this.dispatchCartUpdate();
    }

    @api
    getCartSummary() {
        return {
            itemCount: this.cartItemCount,
            subtotal: this.subtotal,
            shipping: this.shippingCost,
            tax: this.tax,
            discount: this.discount,
            total: this.total,
            appliedCoupon: this.appliedCoupon
        };
    }
}