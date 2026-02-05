import { LightningElement, api, track } from 'lwc';

export default class TrustBadges extends LightningElement {
    @api showTestimonials = true;
    @api showStatistics = true;

    get customerRatingStars() {
        return Array(5).fill().map((_, index) => ({ id: `star-${index}` }));
    }

    get testimonials() {
        return [
            {
                id: 'test-1',
                text: 'Amazing quality and fast delivery. Will definitely order again!',
                customerName: 'Sarah Johnson',
                stars: Array(5).fill().map((_, index) => ({ id: `star-${index}` }))
            },
            {
                id: 'test-2',
                text: 'Great customer service and easy returns. Highly recommended.',
                customerName: 'Mike Chen',
                stars: Array(5).fill().map((_, index) => ({ id: `star-${index}` }))
            },
            {
                id: 'test-3',
                text: 'Best online shopping experience I have had. Thank you!',
                customerName: 'Lisa Brown',
                stars: Array(5).fill().map((_, index) => ({ id: `star-${index}` }))
            }
        ];
    }
}