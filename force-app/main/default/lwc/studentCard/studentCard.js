import { LightningElement, api, track } from 'lwc';

/**
 * StudentCard Lightning Web Component
 * Displays student information in a card layout with responsive design
 * Supports displaying student name, ID, and email
 */
export default class StudentCard extends LightningElement {
    // Public properties that can be set by parent components
    @api studentName = 'John Smith';
    @api studentId = 'STU001';
    @api studentEmail = 'john.smith@education.gov';

    // Reactive properties for component state
    @track isLoading = false;
    @track hasError = false;
    @track errorMessage = '';

    /**
     * Getter for formatted student ID display
     * @returns {string} Formatted student ID with prefix
     */
    get formattedStudentId() {
        return this.studentId ? `ID: ${this.studentId}` : 'ID: Not Available';
    }

    /**
     * Getter for student email display
     * @returns {string} Student email or default message
     */
    get displayEmail() {
        return this.studentEmail || 'Email not provided';
    }

    /**
     * Getter for student name display
     * @returns {string} Student name or default message
     */
    get displayName() {
        return this.studentName || 'Student Name';
    }

    /**
     * Getter for email href
     * @returns {string} Email href for mailto link
     */
    get emailHref() {
        return this.studentEmail ? `mailto:${this.studentEmail}` : '#';
    }

    /**
     * Getter for card CSS classes
     * @returns {string} CSS classes for the card container
     */
    get cardCssClass() {
        return `student-card slds-card slds-p-around_medium ${this.hasError ? 'error-state' : ''}`;
    }

    /**
     * Lifecycle hook - component connected to DOM
     */
    connectedCallback() {
        this.validateStudentData();
    }

    /**
     * Validates student data and sets error state if needed
     */
    validateStudentData() {
        try {
            this.hasError = false;
            this.errorMessage = '';

            // Basic validation
            if (!this.studentName || !this.studentId) {
                this.hasError = true;
                this.errorMessage = 'Missing required student information';
            }

            // Email format validation (basic)
            if (this.studentEmail && !this.isValidEmail(this.studentEmail)) {
                this.hasError = true;
                this.errorMessage = 'Invalid email format';
            }
        } catch (error) {
            this.hasError = true;
            this.errorMessage = 'Error validating student data';
            console.error('StudentCard validation error:', error);
        }
    }

    /**
     * Basic email validation
     * @param {string} email - Email to validate
     * @returns {boolean} True if email format is valid
     */
    isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

    /**
     * Handle card click events
     * @param {Event} event - Click event
     */
    handleCardClick(event) {
        try {
            // Prevent default if needed
            event.preventDefault();

            // Dispatch custom event for parent components
            const selectEvent = new CustomEvent('studentselect', {
                detail: {
                    studentId: this.studentId,
                    studentName: this.studentName,
                    studentEmail: this.studentEmail
                }
            });

            this.dispatchEvent(selectEvent);
        } catch (error) {
            console.error('Error handling card click:', error);
        }
    }

    /**
     * Handle refresh action
     */
    handleRefresh() {
        this.isLoading = true;

        // Simulate refresh action
        setTimeout(() => {
            this.validateStudentData();
            this.isLoading = false;
        }, 1000);
    }
}