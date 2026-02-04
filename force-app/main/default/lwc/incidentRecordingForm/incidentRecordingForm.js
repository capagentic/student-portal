import { LightningElement, track, api } from 'lwc';

/**
 * Incident Recording Form Component
 * Multi-step wizard interface for recording student behaviour incidents
 * Features auto-save functionality, validation, and mobile-optimized design
 *
 * @author Student Portal Team
 * @version 1.0
 */
export default class IncidentRecordingForm extends LightningElement {
    // Public API properties
    @api recordId; // For creating related records
    @api studentId; // Pre-populate with specific student

    // Form state tracking
    @track currentStep = 'step1';
    @track isLoading = false;
    @track errorMessage = '';
    @track loadingMessage = 'Processing...';
    @track showAutoSaveIndicator = false;

    // Form data object
    @track formData = {
        // Step 1: Student & Details
        studentId: '',
        incidentDateTime: '',
        location: '',
        incidentType: '',
        severityLevel: '',

        // Step 2: Description
        incidentDescription: '',
        antecedents: '',
        observedBehaviours: '',
        environmentalFactors: [],
        environmentalContext: '',

        // Step 3: Participants
        otherStudents: [],
        staffMembers: [],
        witnesses: '',
        parentsNotified: false,
        notificationDateTime: '',
        notificationMethod: '',
        notificationNotes: '',

        // Step 4: Response
        immediateResponse: '',
        interventions: [],
        consequences: [],
        interventionDetails: '',
        safetyMeasures: [],
        safetyNotes: '',

        // Step 5: Follow-up
        followupActions: [],
        followupDetails: '',
        followupDueDate: '',
        assignedTo: '',
        escalationLevel: '',
        escalationJustification: '',

        // Step 6: Review
        approverId: '',
        submissionNotes: ''
    };

    // Additional state
    @track selectedStudentInfo = null;
    @track uploadedFiles = [];
    @track validationErrors = [];
    @track autoSaveTimer = null;

    // Form options - these would typically come from custom metadata or configuration
    locationOptions = [
        { label: 'Classroom', value: 'classroom' },
        { label: 'Playground', value: 'playground' },
        { label: 'Cafeteria', value: 'cafeteria' },
        { label: 'Hallway', value: 'hallway' },
        { label: 'Library', value: 'library' },
        { label: 'Gymnasium', value: 'gymnasium' },
        { label: 'School Bus', value: 'bus' },
        { label: 'Other', value: 'other' }
    ];

    incidentTypeOptions = [
        { label: 'Physical Altercation', value: 'physical_altercation' },
        { label: 'Verbal Abuse', value: 'verbal_abuse' },
        { label: 'Disruption', value: 'disruption' },
        { label: 'Defiance', value: 'defiance' },
        { label: 'Inappropriate Language', value: 'inappropriate_language' },
        { label: 'Property Damage', value: 'property_damage' },
        { label: 'Bullying', value: 'bullying' },
        { label: 'Harassment', value: 'harassment' },
        { label: 'Other', value: 'other' }
    ];

    severityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Critical', value: 'Critical' }
    ];

    environmentalFactorOptions = [
        { label: 'Crowded space', value: 'crowded' },
        { label: 'Noisy environment', value: 'noisy' },
        { label: 'Transition time', value: 'transition' },
        { label: 'Unstructured time', value: 'unstructured' },
        { label: 'Academic pressure', value: 'academic_pressure' },
        { label: 'Peer conflict', value: 'peer_conflict' },
        { label: 'Staff change', value: 'staff_change' },
        { label: 'Weather conditions', value: 'weather' }
    ];

    interventionOptions = [
        { label: 'Verbal redirection', value: 'verbal_redirection' },
        { label: 'Time out', value: 'timeout' },
        { label: 'Removal from class', value: 'removal' },
        { label: 'De-escalation techniques', value: 'deescalation' },
        { label: 'Peer mediation', value: 'peer_mediation' },
        { label: 'Parent contact', value: 'parent_contact' },
        { label: 'Counselor referral', value: 'counselor_referral' },
        { label: 'Administrative referral', value: 'admin_referral' }
    ];

    consequenceOptions = [
        { label: 'Warning', value: 'warning' },
        { label: 'Detention', value: 'detention' },
        { label: 'Loss of privileges', value: 'loss_privileges' },
        { label: 'Suspension', value: 'suspension' },
        { label: 'Exclusion', value: 'exclusion' },
        { label: 'Restorative action', value: 'restorative' },
        { label: 'Community service', value: 'community_service' },
        { label: 'Behavioral contract', value: 'behavioral_contract' }
    ];

    safetyMeasureOptions = [
        { label: 'Immediate supervision', value: 'supervision' },
        { label: 'Separation of students', value: 'separation' },
        { label: 'First aid administered', value: 'first_aid' },
        { label: 'Security notified', value: 'security' },
        { label: 'Parent pickup required', value: 'parent_pickup' },
        { label: 'Medical attention sought', value: 'medical' },
        { label: 'Safe space provided', value: 'safe_space' },
        { label: 'Crisis team activated', value: 'crisis_team' }
    ];

    followupActionOptions = [
        { label: 'Behavioral support plan', value: 'behavior_plan' },
        { label: 'Counseling referral', value: 'counseling' },
        { label: 'Parent conference', value: 'parent_conference' },
        { label: 'IEP review', value: 'iep_review' },
        { label: 'Functional behavior assessment', value: 'fba' },
        { label: 'Peer mediation', value: 'mediation' },
        { label: 'Restorative justice', value: 'restorative_justice' },
        { label: 'Academic support', value: 'academic_support' }
    ];

    escalationOptions = [
        { label: 'None', value: 'none' },
        { label: 'Supervisor Review', value: 'supervisor' },
        { label: 'Principal Review', value: 'principal' },
        { label: 'District Office', value: 'district' },
        { label: 'External Agencies', value: 'external' }
    ];

    notificationMethodOptions = [
        { label: 'Phone Call', value: 'phone' },
        { label: 'Email', value: 'email' },
        { label: 'SMS', value: 'sms' },
        { label: 'Letter', value: 'letter' },
        { label: 'In Person', value: 'in_person' }
    ];

    // Lifecycle hooks
    connectedCallback() {
        this.initializeForm();
        this.setupAutoSave();
    }

    disconnectedCallback() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
    }

    // Computed properties
    get currentStepNumber() {
        const stepMap = {
            'step1': 1, 'step2': 2, 'step3': 3,
            'step4': 4, 'step5': 5, 'step6': 6
        };
        return stepMap[this.currentStep] || 1;
    }

    get currentDateTime() {
        return new Date().toISOString().slice(0, 16);
    }

    get currentDate() {
        return new Date().toISOString().slice(0, 10);
    }

    get isStep1() { return this.currentStep === 'step1'; }
    get isStep2() { return this.currentStep === 'step2'; }
    get isStep3() { return this.currentStep === 'step3'; }
    get isStep4() { return this.currentStep === 'step4'; }
    get isStep5() { return this.currentStep === 'step5'; }
    get isStep6() { return this.currentStep === 'step6'; }

    get isNotLastStep() { return this.currentStep !== 'step6'; }
    get isLastStep() { return this.currentStep === 'step6'; }

    get isPreviousDisabled() {
        return this.currentStep === 'step1' || this.isLoading;
    }

    get isNextDisabled() {
        return this.isLoading || !this.isCurrentStepValid();
    }

    get isSubmitDisabled() {
        return this.isLoading || this.hasValidationErrors || !this.isFormValid();
    }

    get hasOtherStudents() {
        return this.formData.otherStudents && this.formData.otherStudents.length > 0;
    }

    get hasStaffMembers() {
        return this.formData.staffMembers && this.formData.staffMembers.length > 0;
    }

    get hasFollowupActions() {
        return this.formData.followupActions && this.formData.followupActions.length > 0;
    }

    get requiresEscalation() {
        return this.formData.escalationLevel && this.formData.escalationLevel !== 'none';
    }

    get requiresApproval() {
        return this.formData.severityLevel === 'High' ||
               this.formData.severityLevel === 'Critical' ||
               this.requiresEscalation;
    }

    get hasUploadedFiles() {
        return this.uploadedFiles && this.uploadedFiles.length > 0;
    }

    get hasValidationErrors() {
        return this.validationErrors && this.validationErrors.length > 0;
    }

    get formattedDateTime() {
        if (!this.formData.incidentDateTime) return '';
        return new Date(this.formData.incidentDateTime).toLocaleString();
    }

    // Event handlers
    handleFieldChange(event) {
        const field = event.target.dataset.field || event.detail.name;
        let value;

        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } else if (event.target.type === 'checkbox-group' || event.detail.value) {
            value = event.detail.value;
        } else {
            value = event.target.value;
        }

        this.formData = {
            ...this.formData,
            [field]: value
        };

        this.triggerAutoSave();
        this.clearFieldValidationError(field);
    }

    handleStudentChange(event) {
        this.formData.studentId = event.detail.recordId;
        this.loadStudentInfo(event.detail.recordId);
        this.triggerAutoSave();
    }

    handleAddStudent(event) {
        const studentId = event.detail.recordId;
        if (studentId && !this.formData.otherStudents.find(s => s.id === studentId)) {
            // In production, you'd fetch actual student data
            const newStudent = {
                id: studentId,
                name: `Student ${studentId}`, // This would come from actual record
                role: 'Participant'
            };

            this.formData.otherStudents = [...this.formData.otherStudents, newStudent];
            this.triggerAutoSave();
        }
    }

    handleRemoveStudent(event) {
        const studentId = event.target.dataset.studentId;
        this.formData.otherStudents = this.formData.otherStudents.filter(s => s.id !== studentId);
        this.triggerAutoSave();
    }

    handleAddStaff(event) {
        const staffId = event.detail.recordId;
        if (staffId && !this.formData.staffMembers.find(s => s.id === staffId)) {
            // In production, you'd fetch actual staff data
            const newStaff = {
                id: staffId,
                name: `Staff ${staffId}`, // This would come from actual record
                title: 'Teacher'
            };

            this.formData.staffMembers = [...this.formData.staffMembers, newStaff];
            this.triggerAutoSave();
        }
    }

    handleRemoveStaff(event) {
        const staffId = event.target.dataset.staffId;
        this.formData.staffMembers = this.formData.staffMembers.filter(s => s.id !== staffId);
        this.triggerAutoSave();
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.uploadedFiles = [...this.uploadedFiles, ...uploadedFiles.map(file => ({
            documentId: file.documentId,
            name: file.name
        }))];
        this.triggerAutoSave();
    }

    handleRemoveFile(event) {
        const fileId = event.target.dataset.fileId;
        this.uploadedFiles = this.uploadedFiles.filter(f => f.documentId !== fileId);
        this.triggerAutoSave();
    }

    // Navigation handlers
    handlePrevious() {
        const steps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'];
        const currentIndex = steps.indexOf(this.currentStep);
        if (currentIndex > 0) {
            this.currentStep = steps[currentIndex - 1];
        }
    }

    handleNext() {
        if (this.isCurrentStepValid()) {
            const steps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6'];
            const currentIndex = steps.indexOf(this.currentStep);
            if (currentIndex < steps.length - 1) {
                this.currentStep = steps[currentIndex + 1];
                this.validateCurrentStep();
            }
        }
    }

    async handleSubmit() {
        this.isLoading = true;
        this.loadingMessage = 'Submitting incident report...';

        try {
            if (!this.isFormValid()) {
                throw new Error('Please complete all required fields');
            }

            // Simulate submission process
            await this.submitIncident();

            // Show success message and redirect
            this.dispatchEvent(new CustomEvent('incidentsubmitted', {
                detail: {
                    success: true,
                    message: 'Incident report submitted successfully',
                    incidentId: 'INC-' + Date.now()
                },
                bubbles: true,
                composed: true
            }));

        } catch (error) {
            this.errorMessage = this.reduceError(error);
        } finally {
            this.isLoading = false;
        }
    }

    handleCancel() {
        // Show confirmation dialog
        if (this.hasUnsavedChanges()) {
            // In production, use a modal confirmation
            if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
                this.dispatchEvent(new CustomEvent('formcancelled', {
                    bubbles: true,
                    composed: true
                }));
            }
        } else {
            this.dispatchEvent(new CustomEvent('formcancelled', {
                bubbles: true,
                composed: true
            }));
        }
    }

    async handleSaveDraft() {
        this.isLoading = true;
        this.loadingMessage = 'Saving draft...';

        try {
            await this.saveDraft();
            this.showAutoSaveSuccess();
        } catch (error) {
            this.errorMessage = this.reduceError(error);
        } finally {
            this.isLoading = false;
        }
    }

    clearError() {
        this.errorMessage = '';
    }

    // Private methods
    initializeForm() {
        // Set default values
        this.formData.incidentDateTime = this.currentDateTime;

        // Pre-populate student if provided
        if (this.studentId) {
            this.formData.studentId = this.studentId;
            this.loadStudentInfo(this.studentId);
        }

        // Load any existing draft
        this.loadDraft();
    }

    async loadStudentInfo(studentId) {
        try {
            // In production, this would be a proper Salesforce query
            // Simulate student data loading
            await this.simulateApiCall(300);

            this.selectedStudentInfo = {
                id: studentId,
                name: `Student Name ${studentId}`,
                grade: 'Year 8',
                studentId: 'STU' + studentId.slice(-3),
                hasAlerts: Math.random() > 0.7 // Random for demo
            };
        } catch (error) {
            console.error('Error loading student info:', error);
        }
    }

    setupAutoSave() {
        // Set up auto-save functionality
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChanges()) {
                this.autoSaveDraft();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    triggerAutoSave() {
        // Debounce auto-save
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        this.autoSaveTimer = setTimeout(() => {
            this.autoSaveDraft();
        }, 2000); // Save 2 seconds after last change
    }

    async autoSaveDraft() {
        try {
            await this.saveDraft();
            this.showAutoSaveSuccess();
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    async saveDraft() {
        // Simulate saving draft to server
        await this.simulateApiCall(800);

        // In production, this would save to Salesforce
        localStorage.setItem('incident_draft', JSON.stringify({
            formData: this.formData,
            uploadedFiles: this.uploadedFiles,
            timestamp: new Date().toISOString()
        }));
    }

    loadDraft() {
        // Load draft from storage
        const draft = localStorage.getItem('incident_draft');
        if (draft) {
            try {
                const draftData = JSON.parse(draft);
                this.formData = { ...this.formData, ...draftData.formData };
                this.uploadedFiles = draftData.uploadedFiles || [];

                // Load student info if available
                if (this.formData.studentId) {
                    this.loadStudentInfo(this.formData.studentId);
                }
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }
    }

    async submitIncident() {
        // Simulate incident submission
        await this.simulateApiCall(2000);

        // Clear draft after successful submission
        localStorage.removeItem('incident_draft');

        // In production, this would create records in Salesforce
        console.log('Incident submitted:', this.formData);
    }

    showAutoSaveSuccess() {
        this.showAutoSaveIndicator = true;
        setTimeout(() => {
            this.showAutoSaveIndicator = false;
        }, 3000);
    }

    isCurrentStepValid() {
        switch (this.currentStep) {
            case 'step1':
                return this.formData.studentId &&
                       this.formData.incidentDateTime &&
                       this.formData.location &&
                       this.formData.incidentType &&
                       this.formData.severityLevel;
            case 'step2':
                return this.formData.incidentDescription &&
                       this.formData.incidentDescription.trim().length > 10;
            case 'step3':
                return true; // Optional step
            case 'step4':
                return this.formData.immediateResponse &&
                       this.formData.immediateResponse.trim().length > 5;
            case 'step5':
                return true; // Optional step
            case 'step6':
                return !this.requiresApproval || this.formData.approverId;
            default:
                return true;
        }
    }

    isFormValid() {
        // Comprehensive form validation
        const requiredFields = [
            'studentId', 'incidentDateTime', 'location',
            'incidentType', 'severityLevel', 'incidentDescription',
            'immediateResponse'
        ];

        const isBasicValid = requiredFields.every(field =>
            this.formData[field] && String(this.formData[field]).trim().length > 0
        );

        const isApprovalValid = !this.requiresApproval || this.formData.approverId;
        const isEscalationValid = !this.requiresEscalation || this.formData.escalationJustification;

        return isBasicValid && isApprovalValid && isEscalationValid;
    }

    validateCurrentStep() {
        this.validationErrors = [];

        // Add step-specific validation
        switch (this.currentStep) {
            case 'step6':
                this.validateFinalSubmission();
                break;
            default:
                break;
        }
    }

    validateFinalSubmission() {
        const errors = [];

        if (!this.formData.studentId) {
            errors.push({ id: 'student', message: 'Student selection is required' });
        }

        if (!this.formData.incidentDescription || this.formData.incidentDescription.trim().length < 10) {
            errors.push({ id: 'description', message: 'Detailed incident description is required (minimum 10 characters)' });
        }

        if (!this.formData.immediateResponse || this.formData.immediateResponse.trim().length < 5) {
            errors.push({ id: 'response', message: 'Immediate response details are required' });
        }

        if (this.requiresApproval && !this.formData.approverId) {
            errors.push({ id: 'approval', message: 'Approver selection is required for this severity level' });
        }

        if (this.requiresEscalation && !this.formData.escalationJustification) {
            errors.push({ id: 'escalation', message: 'Escalation justification is required' });
        }

        this.validationErrors = errors;
    }

    clearFieldValidationError(fieldName) {
        this.validationErrors = this.validationErrors.filter(error => error.id !== fieldName);
    }

    hasUnsavedChanges() {
        // Check if form has unsaved changes
        const draft = localStorage.getItem('incident_draft');
        if (!draft) return true;

        try {
            const draftData = JSON.parse(draft);
            return JSON.stringify(this.formData) !== JSON.stringify(draftData.formData);
        } catch {
            return true;
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