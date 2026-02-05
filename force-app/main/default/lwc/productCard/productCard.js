import { LightningElement, api, track } from 'lwc';

export default class ProductCard extends LightningElement {
    @api product;
    @api showDescription = true;
    @api cardSize = 'medium'; // small, medium, large

    @track isFavorite = false;

    get productAriaLabel() {
        return `${this.product?.name} - $${this.product?.currentPrice}${this.product?.isOnSale ? ' on sale' : ''}`;
    }

    get ratingStars() {
        if (!this.product?.rating) return [];

        const rating = this.product.rating;
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push({ id: `star-${i}`, class: 'star-filled' });
        }

        if (hasHalfStar) {
            stars.push({ id: 'star-half', class: 'star-half' });
        }

        const remainingStars = 5 - stars.length;
        for (let i = 0; i < remainingStars; i++) {
            stars.push({ id: `star-empty-${i}`, class: 'star-empty' });
        }

        return stars;
    }

    get favoriteIcon() {
        return this.isFavorite ? 'utility:favorite' : 'utility:favorite_alt';
    }

    get favoriteClass() {
        return `favorite-btn ${this.isFavorite ? 'favorited' : ''}`;
    }

    handleCardClick() {
        this.dispatchEvent(new CustomEvent('productclick', {
            detail: {
                productId: this.product?.id,
                product: this.product
            },
            bubbles: true,
            composed: true
        }));
    }

    handleKeyDown(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            event.preventDefault();
            this.handleCardClick();
        }
    }

    handleAddToCart(event) {
        event.stopPropagation();

        this.dispatchEvent(new CustomEvent('addtocart', {
            detail: {
                productId: this.product?.id,
                product: this.product,
                quantity: 1
            },
            bubbles: true,
            composed: true
        }));
    }

    handleToggleFavorite(event) {
        event.stopPropagation();

        this.isFavorite = !this.isFavorite;

        this.dispatchEvent(new CustomEvent('togglefavorite', {
            detail: {
                productId: this.product?.id,
                product: this.product,
                isFavorite: this.isFavorite
            },
            bubbles: true,
            composed: true
        }));
    }
}