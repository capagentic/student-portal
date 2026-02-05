import { LightningElement, track, api } from 'lwc';

/**
 * Parent Student Portal Component
 * Mobile-first responsive portal for parents to access student information,
 * communicate with school staff, and manage appeals processes
 *
 * @author Student Portal Team
 * @version 1.0
 */
export default class ParentStudentPortal extends LightningElement {
    // Public API properties
    @api recordId;
    @api parentId;

    // Component state
    @track isLoading = false;
    @track errorMessage = '';
    @track loadingMessage = 'Loading portal...';
    @track activeTab = 'behavior';

    // User data
    @track parentName = '';
    @track studentName = '';
    @track timeOfDay = '';

    // Student data
    @track studentData = [];
    @track behaviorData = {};
    @track incidentData = [];
    @track messagesData = [];
    @track appealsData = [];
    @track progressData = {};
    @track supportResources = [];

    // Message filtering
    @track messageCategories = [
        { label: 'All Messages', value: 'all', selected: true },
        { label: 'Behavior Updates', value: 'behavior', selected: false },
        { label: 'Academic', value: 'academic', selected: false },
        { label: 'General', value: 'general', selected: false },
        { label: 'Urgent', value: 'urgent', selected: false }
    ];

    // Lifecycle hooks
    connectedCallback() {
        this.initializePortal();
        this.loadPortalData();
    }

    // Computed properties
    get hasPositiveBehaviors() {
        return this.behaviorData.positiveBehaviors && this.behaviorData.positiveBehaviors.length > 0;
    }

    get hasGrowthAreas() {
        return this.behaviorData.growthAreas && this.behaviorData.growthAreas.length > 0;
    }

    get hasIncidents() {
        return this.incidentData && this.incidentData.length > 0;
    }

    get hasMessages() {
        return this.messagesData && this.messagesData.length > 0;
    }

    get hasActiveAppeals() {
        return this.appealsData && this.appealsData.length > 0;
    }

    // Event handlers
    handleTabChange(event) {
        this.activeTab = event.target.value;
        this.loadTabData();
    }

    handleQuickCheckin() {
        // Navigate to quick check-in form
        this.dispatchEvent(new CustomEvent('quickcheckin', {
            bubbles: true,
            composed: true
        }));
    }

    handleRequestMeeting() {
        this.dispatchEvent(new CustomEvent('requestmeeting', {
            detail: { type: 'behavior_discussion' },
            bubbles: true,
            composed: true
        }));
    }

    handleViewIncident(event) {
        const incidentId = event.target.dataset.incidentId;
        this.dispatchEvent(new CustomEvent('viewincident', {
            detail: { incidentId: incidentId },
            bubbles: true,
            composed: true
        }));
    }

    handleDiscussIncident(event) {
        const incidentId = event.target.dataset.incidentId;
        this.dispatchEvent(new CustomEvent('discussincident', {
            detail: { incidentId: incidentId },
            bubbles: true,
            composed: true
        }));
    }

    handleNewMessage() {
        this.dispatchEvent(new CustomEvent('composemessage', {
            bubbles: true,
            composed: true
        }));
    }

    handleCategoryFilter(event) {
        const selectedCategory = event.target.name;

        // Update category selection
        this.messageCategories = this.messageCategories.map(cat => ({
            ...cat,
            selected: cat.value === selectedCategory
        }));

        // Filter messages
        this.filterMessages(selectedCategory);
    }

    handleReadMessage(event) {
        const messageId = event.target.dataset.messageId;
        this.readMessage(messageId);
    }

    handleReplyMessage(event) {
        const messageId = event.target.dataset.messageId;
        this.dispatchEvent(new CustomEvent('replymessage', {
            detail: { messageId: messageId },
            bubbles: true,
            composed: true
        }));
    }

    handleNewAppeal() {
        this.dispatchEvent(new CustomEvent('startappeal', {
            bubbles: true,
            composed: true
        }));
    }

    handleResourceAction(event) {
        const resourceId = event.target.dataset.resourceId;
        this.accessResource(resourceId);
    }

    handleDownloadProgress() {
        this.downloadProgressReport();
    }

    retryLoadData() {
        this.errorMessage = '';
        this.loadPortalData();
    }

    // Private methods
    initializePortal() {
        // Set greeting based on time of day
        const hour = new Date().getHours();
        if (hour < 12) {
            this.timeOfDay = 'Morning';
        } else if (hour < 17) {
            this.timeOfDay = 'Afternoon';
        } else {
            this.timeOfDay = 'Evening';
        }

        // Set parent and student names (would come from user context)
        this.parentName = 'Sarah Johnson';
        this.studentName = 'Emma Johnson';
    }

    async loadPortalData() {
        this.isLoading = true;
        this.loadingMessage = 'Loading your student portal...';

        try {
            await Promise.all([
                this.loadStudentData(),
                this.loadBehaviorData(),
                this.loadSupportResources()
            ]);

            // Load initial tab data
            await this.loadTabData();

        } catch (error) {
            this.errorMessage = this.reduceError(error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadStudentData() {
        await this.simulateApiCall(600);

        this.studentData = [
            {
                id: 'student001',
                name: 'Emma Johnson',
                grade: '9',
                schoolName: 'Brisbane High School',
                behaviorScore: '8.5/10',
                behaviorStatus: 'good',
                attendancePercent: 94,
                recentIncidents: 1,
                hasAlerts: true,
                alerts: [
                    {
                        id: 'alert001',
                        type: 'positive',
                        iconName: 'utility:success',
                        message: 'Great improvement in Mathematics this week!'
                    }
                ]
            }
        ];
    }

    async loadBehaviorData() {
        await this.simulateApiCall(500);

        this.behaviorData = {
            improvementPercent: 15,
            progressSummary: 'Emma has shown excellent progress in emotional regulation and peer interactions this month. She has been actively participating in conflict resolution and demonstrating leadership qualities.',
            positiveBehaviors: [
                {
                    id: 'pos001',
                    title: 'Helped resolve peer conflict in playground',
                    date: 'Jan 15, 2024'
                },
                {
                    id: 'pos002',
                    title: 'Demonstrated excellent teamwork in group project',
                    date: 'Jan 12, 2024'
                },
                {
                    id: 'pos003',
                    title: 'Showed initiative in organizing class event',
                    date: 'Jan 10, 2024'
                }
            ],
            growthAreas: [
                {
                    id: 'growth001',
                    title: 'Time Management',
                    description: 'Emma sometimes struggles with completing assignments on time.',
                    supportStrategy: 'Using a planner and regular check-ins with teachers to improve organization skills.'
                }
            ]
        };
    }

    async loadTabData() {
        switch (this.activeTab) {
            case 'behavior':
                await this.loadIncidentData();
                break;
            case 'communications':
                await this.loadMessagesData();
                break;
            case 'appeals':
                await this.loadAppealsData();
                break;
            case 'progress':
                await this.loadProgressData();
                break;
            default:
                break;
        }
    }

    async loadIncidentData() {
        await this.simulateApiCall(400);

        this.incidentData = [
            {
                id: 'inc001',
                date: 'Jan 8, 2024',
                type: 'Minor Disruption',
                parentFriendlyDescription: 'Emma had difficulty focusing during math class and needed redirection. The teacher worked with her to identify strategies for staying on task.',
                outcome: 'Emma practiced the new focusing techniques and showed improvement in the following classes.',
                canDiscuss: true
            }
        ];
    }

    async loadMessagesData() {
        await this.simulateApiCall(700);

        this.messagesData = [
            {
                id: 'msg001',
                fromName: 'Ms. Thompson',
                fromRole: 'Math Teacher',
                subject: 'Emma\'s Great Progress This Week',
                preview: 'I wanted to share some positive news about Emma\'s improvements in mathematics...',
                formattedDate: 'Jan 15, 2024',
                isRead: false,
                isUrgent: false,
                requiresResponse: false,
                canReply: true,
                category: 'academic'
            },
            {
                id: 'msg002',
                fromName: 'Mr. Davis',
                fromRole: 'School Counselor',
                subject: 'Monthly Behavior Support Update',
                preview: 'Emma has been doing wonderfully in our weekly sessions. Here\'s her progress update...',
                formattedDate: 'Jan 12, 2024',
                isRead: true,
                isUrgent: false,
                requiresResponse: true,
                canReply: true,
                category: 'behavior'
            },
            {
                id: 'msg003',
                fromName: 'School Office',
                fromRole: 'Administration',
                subject: 'Parent-Teacher Conference Scheduling',
                preview: 'Parent-teacher conferences are coming up next month. Please select your preferred times...',
                formattedDate: 'Jan 10, 2024',
                isRead: false,
                isUrgent: true,
                requiresResponse: true,
                canReply: false,
                category: 'general'
            }
        ];
    }

    async loadAppealsData() {
        await this.simulateApiCall(300);

        // Mock empty appeals for demonstration
        this.appealsData = [];
    }

    async loadProgressData() {
        await this.simulateApiCall(500);

        this.progressData = {
            behaviorProgress: 85,
            academicProgress: 78,
            socialProgress: 92,
            insights: [
                {
                    id: 'insight001',
                    iconName: 'utility:trending',
                    text: 'Emma\'s social skills have improved significantly over the past month'
                },
                {
                    id: 'insight002',
                    iconName: 'utility:success',
                    text: 'Consistent attendance is supporting her academic progress'
                },
                {
                    id: 'insight003',
                    iconName: 'utility:target',
                    text: 'On track to meet all behavior goals by the end of term'
                }
            ],
            goals: [
                {
                    id: 'goal001',
                    title: 'Improve Emotional Regulation',
                    description: 'Practice deep breathing and mindfulness techniques when feeling overwhelmed',
                    progressPercent: 85,
                    targetDate: 'Feb 29, 2024',
                    nextReview: 'Jan 25, 2024'
                },
                {
                    id: 'goal002',
                    title: 'Enhance Peer Communication',
                    description: 'Use "I" statements and active listening during peer interactions',
                    progressPercent: 78,
                    targetDate: 'Mar 15, 2024',
                    nextReview: 'Feb 1, 2024'
                },
                {
                    id: 'goal003',
                    title: 'Academic Organization',
                    description: 'Maintain organized binder and complete assignments on time',
                    progressPercent: 65,
                    targetDate: 'Apr 1, 2024',
                    nextReview: 'Jan 30, 2024'
                }
            ]
        };
    }

    async loadSupportResources() {
        await this.simulateApiCall(200);

        this.supportResources = [
            {
                id: 'resource001',
                title: 'Family Support Services',
                description: 'Access to counseling and family support programs',
                iconName: 'utility:groups',
                actionLabel: 'Learn More'
            },
            {
                id: 'resource002',
                title: 'Educational Materials',
                description: 'Resources to support learning and behavior at home',
                iconName: 'utility:education',
                actionLabel: 'Browse Resources'
            },
            {
                id: 'resource003',
                title: 'Parent Support Groups',
                description: 'Connect with other parents in similar situations',
                iconName: 'utility:people',
                actionLabel: 'Join Group'
            },
            {
                id: 'resource004',
                title: 'Crisis Support',
                description: '24/7 crisis support and mental health resources',
                iconName: 'utility:shield',
                actionLabel: 'Get Help'
            }
        ];
    }

    filterMessages(category) {
        if (category === 'all') {
            // Show all messages - reload original data
            this.loadMessagesData();
            return;
        }

        // Filter messages by category
        const filteredMessages = this.messagesData.filter(msg =>
            msg.category === category || (category === 'urgent' && msg.isUrgent)
        );

        // Update displayed messages
        this.messagesData = filteredMessages;
    }

    async readMessage(messageId) {
        // Mark message as read
        this.messagesData = this.messagesData.map(msg =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
        );

        // In production, would update server
        await this.simulateApiCall(200);

        // Dispatch event to open message details
        this.dispatchEvent(new CustomEvent('openmessage', {
            detail: { messageId: messageId },
            bubbles: true,
            composed: true
        }));
    }

    accessResource(resourceId) {
        // Handle resource access
        console.log('Accessing resource:', resourceId);

        this.dispatchEvent(new CustomEvent('accessresource', {
            detail: { resourceId: resourceId },
            bubbles: true,
            composed: true
        }));
    }

    downloadProgressReport() {
        // Generate and download progress report
        console.log('Downloading progress report');

        this.dispatchEvent(new CustomEvent('downloadreport', {
            detail: { type: 'progress', studentId: this.studentData[0]?.id },
            bubbles: true,
            composed: true
        }));
    }

    // Utility methods
    simulateApiCall(delay = 1000) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    reduceError(error) {
        if (Array.isArray(error)) {
            return error.map(err => err.message).join(', ');
        }
        return error.message || 'An unexpected error occurred while loading your portal';
    }
}