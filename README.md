# Salesforce Licensing Application Management System

This project contains the Salesforce metadata for the Licensing Application Management System using a configuration-first approach.

## Overview

The system enables Licensing Officers (LO) to process email-submitted applications and route them for approval to Approving Officers (AO). Upon approval, the system automatically generates certificates and sends them to applicants.

## Key Features

- **Application Management**: Custom Application__c object with comprehensive field tracking
- **Role-based Security**: Permission sets for Licensing Officers and Approving Officers
- **Approval Workflow**: Single-level approval process (LO → AO)
- **Document Management**: File upload capabilities for email approvals and company profiles
- **Certificate Generation**: Automated certificate creation with registration numbers
- **Email Integration**: Automated certificate distribution to applicants

## Project Structure

- `force-app/main/default/objects/` - Custom objects and their metadata
- `force-app/main/default/permissionsets/` - Permission sets for user access
- `force-app/main/default/layouts/` - Page layouts
- `manifest/` - Package manifests for deployment

## Deployment

Use the Salesforce CLI to deploy this metadata to your org:

```bash
sf project deploy start --manifest manifest/package.xml
```

## Configuration Approach

This solution prioritizes declarative configuration over custom code:

- **Custom Objects**: Application__c and Company_Profile__c
- **Security Model**: Permission sets (never modify standard profiles)
- **Validation Rules**: Data integrity enforcement
- **List Views**: User-friendly data access
- **Page Layouts**: Optimized user experience

## Custom Development Justification

Custom Apex code is only used where declarative solutions are insufficient:

1. **PDF Certificate Generation**: Complex document formatting requires custom code
2. **Registration Number Generation**: Unique identifier logic
3. **Email Integration**: Advanced email templating and delivery

All other functionality uses Salesforce's declarative features (Flows, Process Builder, Validation Rules, etc.).