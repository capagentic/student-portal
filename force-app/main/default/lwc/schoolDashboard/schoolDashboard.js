import { LightningElement, track, api } from 'lwc';

/**
 * School Dashboard Component
 * Main landing page for the Student Behaviour Management Solution
 * Features responsive design with Queensland DoE branding
 *
 * @author Student Portal Team
 * @version 1.0
 */
export default class SchoolDashboard extends LightningElement {
    // Public API properties
    @api recordId; // For potential future use with specific school records

    // Tracked properties for reactive data
    @track isLoading = false;
    @track errorMessage = '';
    @track isMobileView = false;
    @track sidebarVisible = true;

    // Dashboard metrics
    @track totalIncidents = 0;
    @track pendingCases = 0;
    @track urgentCases = 0;
    @track activeCarePlans = 0;
    @track recentlyUpdatedPlans = 0;
    @track suspensionsExclusions = 0;
    @track activeSuspensions = 0;
    @track totalExclusions = 0;
    @track incidentsChangePercent = 0;
    @track incidentsTrend = 'neutral';

    // Search and filter properties
    @track searchTerm = '';
    @track searchResults = [];
    @track recentIncidentsData = [];
    @track pendingTasks = [];
    @track sortedBy = 'dateCreated';
    @track sortedDirection = 'desc';

    // Data table columns configuration
    incidentsColumns = [
        {
            label: 'Student',
            fieldName: 'studentName',
            type: 'text',
            sortable: true
        },
        {
            label: 'Date',
            fieldName: 'dateCreated',
            type: 'date-local',
            sortable: true,
            typeAttributes: {
                month: 'numeric',
                day: 'numeric'
            }
        },
        {
            label: 'Type',
            fieldName: 'incidentType',
            type: 'text',
            sortable: true
        },
        {
            label: 'Severity',
            fieldName: 'severity',
            type: 'text',
            sortable: true,
            cellAttributes: {
                class: { fieldName: 'severityCssClass' }
            }
        },
        {
            label: 'Status',
            fieldName: 'status',
            type: 'text',
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'View', name: 'view' },
                    { label: 'Edit', name: 'edit' },
                    { label: 'Assign', name: 'assign' }
                ]
            }
        }
    ];

    // Lifecycle hooks
    connectedCallback() {
        this.checkMobileView();
        this.loadDashboardData();
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this.handleResize);
    }

    renderedCallback() {
        // Set up any DOM manipulations after render
        this.updateMetricTrendIcons();
    }

    // Computed properties
    get hasRecentIncidents() {
        return this.recentIncidentsData && this.recentIncidentsData.length > 0;
    }

    get hasSearchResults() {
        return this.searchResults && this.searchResults.length > 0;
    }

    get hasPendingTasks() {
        return this.pendingTasks && this.pendingTasks.length > 0;
    }

    get recentIncidentsCount() {
        return this.recentIncidentsData ? this.recentIncidentsData.length : 0;
    }

    get pendingTasksCount() {
        return this.pendingTasks ? this.pendingTasks.length : 0;
    }

    get incidentsTrendIcon() {
        switch (this.incidentsTrend) {
            case 'up':
                return 'utility:trending';
            case 'down':
                return 'utility:down';
            default:
                return 'utility:right';
        }
    }

    // Event handlers
    handleResize() {
        this.checkMobileView();
    }

    toggleMobileMenu() {
        this.sidebarVisible = !this.sidebarVisible;
    }

    handleNewIncident() {
        // Navigate to incident recording form
        this.dispatchEvent(new CustomEvent('navigatetoincidentform', {
            detail: { action: 'new' },
            bubbles: true,
            composed: true
        }));
    }

    handleStudentSearch() {
        // Focus on search input
        const searchInput = this.template.querySelector('.student-search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    handleGenerateReports() {
        // Navigate to reports section
        this.dispatchEvent(new CustomEvent('navigatetoreports', {
            detail: { action: 'generate' },
            bubbles: true,
            composed: true
        }));
    }

    handleReviewCases() {
        // Navigate to case management
        this.dispatchEvent(new CustomEvent('navigatetocases', {
            detail: { action: 'review' },
            bubbles: true,
            composed: true
        }));
    }

    handleCarePlanReview() {
        // Navigate to care plans
        this.dispatchEvent(new CustomEvent('navigatetocareplans', {
            detail: { action: 'review' },
            bubbles: true,
            composed: true
        }));
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length >= 2) {
            this.performStudentSearch();
        } else {
            this.searchResults = [];
        }
    }

    handleStudentSelect(event) {
        const studentId = event.currentTarget.dataset.studentId;
        // Navigate to student case management
        this.dispatchEvent(new CustomEvent('navigatetostudent', {
            detail: { studentId: studentId },
            bubbles: true,
            composed: true
        }));
    }

    handleSort(event) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        this.sortIncidentsData();
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;

        switch (action.name) {
            case 'view':
                this.viewIncident(row.id);
                break;
            case 'edit':
                this.editIncident(row.id);
                break;
            case 'assign':
                this.assignIncident(row.id);
                break;
            default:
                break;
        }
    }

    handleViewTask(event) {
        const taskId = event.currentTarget.dataset.taskId;
        this.viewTask(taskId);
    }

    handleCompleteTask(event) {
        const taskId = event.currentTarget.dataset.taskId;
        this.completeTask(taskId);
    }

    refreshQuickActions() {
        // Refresh quick actions data
        this.loadQuickActionsData();
    }

    refreshPendingTasks() {
        // Refresh pending tasks
        this.loadPendingTasks();
    }

    retryLoadData() {
        this.errorMessage = '';
        this.loadDashboardData();
    }

    // Private methods
    checkMobileView() {
        this.isMobileView = window.innerWidth < 768;
        this.sidebarVisible = !this.isMobileView;
    }

    async loadDashboardData() {
        this.isLoading = true;
        this.errorMessage = '';

        try {
            // Simulate API calls - replace with actual Salesforce data operations
            await Promise.all([
                this.loadMetricsData(),
                this.loadRecentIncidents(),
                this.loadPendingTasks()
            ]);
        } catch (error) {
            this.errorMessage = this.reduceError(error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadMetricsData() {
        // Simulate loading metrics data
        // In production, this would use Lightning Data Service or Apex calls
        await this.simulateApiCall(1000);

        this.totalIncidents = 42;
        this.pendingCases = 15;
        this.urgentCases = 3;
        this.activeCarePlans = 28;
        this.recentlyUpdatedPlans = 5;
        this.suspensionsExclusions = 8;
        this.activeSuspensions = 6;
        this.totalExclusions = 2;
        this.incidentsChangePercent = 12;
        this.incidentsTrend = 'up';
    }

    async loadRecentIncidents() {
        // Simulate loading recent incidents
        await this.simulateApiCall(800);

        this.recentIncidentsData = [
            {
                id: '001',
                studentName: 'John Smith',
                dateCreated: new Date().toISOString(),
                incidentType: 'Disruption',
                severity: 'Medium',
                severityCssClass: 'severity-medium',
                status: 'Open'
            },
            {
                id: '002',
                studentName: 'Emma Johnson',
                dateCreated: new Date(Date.now() - 86400000).toISOString(),
                incidentType: 'Physical Altercation',
                severity: 'High',
                severityCssClass: 'severity-high',
                status: 'In Progress'
            },
            {
                id: '003',
                studentName: 'Michael Brown',
                dateCreated: new Date(Date.now() - 172800000).toISOString(),
                incidentType: 'Inappropriate Language',
                severity: 'Low',
                severityCssClass: 'severity-low',
                status: 'Resolved'
            }
        ];
    }

    async loadPendingTasks() {
        // Simulate loading pending tasks
        await this.simulateApiCall(600);

        this.pendingTasks = [
            {
                id: 'task001',
                title: 'Review care plan for John Smith',
                dueDate: 'Today',
                type: 'Care Plan',
                priority: 'High'
            },
            {
                id: 'task002',
                title: 'Follow up with parent contact',
                dueDate: 'Tomorrow',
                type: 'Communication',
                priority: 'Medium'
            },
            {
                id: 'task003',
                title: 'Complete incident report',
                dueDate: 'Jan 15',
                type: 'Report',
                priority: 'Low'
            }
        ];
    }

    loadQuickActionsData() {
        // Refresh any dynamic quick actions data
        console.log('Refreshing quick actions data...');
    }

    async performStudentSearch() {
        // Simulate student search
        if (!this.searchTerm) return;

        await this.simulateApiCall(300);

        // Mock search results
        this.searchResults = [
            {
                id: 'student001',
                name: 'John Smith',
                studentId: 'STU001',
                grade: 'Year 8'
            },
            {
                id: 'student002',
                name: 'Emma Johnson',
                studentId: 'STU002',
                grade: 'Year 9'
            }
        ].filter(student =>
            student.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            student.studentId.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }

    sortIncidentsData() {
        const data = [...this.recentIncidentsData];
        data.sort((a, b) => {
            let aVal = a[this.sortedBy];
            let bVal = b[this.sortedBy];

            if (this.sortedBy === 'dateCreated') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (this.sortedDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
        this.recentIncidentsData = data;
    }

    updateMetricTrendIcons() {
        // Update trend indicators based on data
        const trendElements = this.template.querySelectorAll('[data-trend]');
        trendElements.forEach(element => {
            const trend = element.dataset.trend;
            element.classList.add(`trend-${trend}`);
        });
    }

    viewIncident(incidentId) {
        this.dispatchEvent(new CustomEvent('viewincident', {
            detail: { incidentId: incidentId },
            bubbles: true,
            composed: true
        }));
    }

    editIncident(incidentId) {
        this.dispatchEvent(new CustomEvent('editincident', {
            detail: { incidentId: incidentId },
            bubbles: true,
            composed: true
        }));
    }

    assignIncident(incidentId) {
        this.dispatchEvent(new CustomEvent('assignincident', {
            detail: { incidentId: incidentId },
            bubbles: true,
            composed: true
        }));
    }

    viewTask(taskId) {
        this.dispatchEvent(new CustomEvent('viewtask', {
            detail: { taskId: taskId },
            bubbles: true,
            composed: true
        }));
    }

    async completeTask(taskId) {
        try {
            // Simulate task completion
            await this.simulateApiCall(500);

            // Remove completed task from list
            this.pendingTasks = this.pendingTasks.filter(task => task.id !== taskId);

            // Show success message
            this.dispatchEvent(new CustomEvent('showtostmessage', {
                detail: {
                    title: 'Success',
                    message: 'Task completed successfully',
                    variant: 'success'
                },
                bubbles: true,
                composed: true
            }));
        } catch (error) {
            this.dispatchEvent(new CustomEvent('showtostmessage', {
                detail: {
                    title: 'Error',
                    message: 'Failed to complete task',
                    variant: 'error'
                },
                bubbles: true,
                composed: true
            }));
        }
    }

    // Utility methods
    simulateApiCall(delay = 1000) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    reduceError(error) {
        if (Array.isArray(error)) {
            return error.map(err => err.message).join(', ');
        }
        return error.message || 'An unexpected error occurred';
    }
}