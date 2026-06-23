# Supply Chain Alert Agent

## Overview
A real-time supply chain monitoring system designed to eliminate manual order tracking inefficiencies. This tool detects order anomalies (stock/amount risk) and triggers automated alerts while maintaining high data security standards.

## Key Features
- **Intelligent Anomaly Detection**: Uses Pandas to process order data and filter high-risk transactions.
- **Security-First Pipeline**: Implements a PII (Personally Identifiable Information) masking layer using RegEx to anonymize sensitive customer data before triggering external workflows.
- **Automated Orchestration**: Integrated with n8n to manage real-time alerts via Slack and Email.
- **Management Dashboard**: A React-based interface for operational decision-making, designed for bi-directional data updates.

## Architecture
```mermaid
graph LR
    A[Orders.csv] --> B[Python Engine]
    B -->|PII Masking| C{Risk Engine}
    C -->|Webhook| D[n8n Automation]
    D --> E[Slack/Email Alert]
    B -->|API| F[React Dashboard]
