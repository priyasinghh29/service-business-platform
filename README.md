# Oknitech Serve

> A full-stack professional-services platform that connects clients with professional services such as tax, accounting, legal, and business support while giving staff a centralized system to manage bookings, engagements, documents, invoices, payments, and client communication.

Oknitech Serve is built as a **three-surface application**:

* **Marketing Website & Client Portal** — Next.js
* **REST API** — Laravel + Sanctum
* **Staff Admin Panel** — Laravel Blade

The platform supports the complete client lifecycle:

**Discover → Book → Pay → Engage → Submit Documents → Track Progress → Invoice → Review**

---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Application Architecture](#application-architecture)
* [Technology Stack](#technology-stack)
* [Project Structure](#project-structure)
* [Public Website](#public-website)
* [Client Authentication](#client-authentication)
* [Client Portal](#client-portal)
* [Admin Panel](#admin-panel)
* [End-to-End Workflow](#end-to-end-workflow)
* [Authentication & Authorization](#authentication--authorization)
* [Payments](#payments)
* [API Architecture](#api-architecture)
* [Database & Infrastructure](#database--infrastructure)
* [Running the Project Locally](#running-the-project-locally)
* [Demo Accounts](#demo-accounts)
* [Production Deployment](#production-deployment)
* [Future Improvements](#future-improvements)

---

# Overview

**Oknitech Serve** is designed for professional-services businesses that need more than a simple marketing website.

Clients can:

* Discover services
* Compare service offerings
* Book consultations
* Make payments
* Track active engagements
* Communicate with staff
* Upload and manage documents
* View invoices
* Manage meetings
* Raise support tickets
* Submit reviews

Staff members operate the business through a dedicated Laravel administration panel where they can manage:

* Customers
* Services
* Bookings
* Staff
* Documents
* Invoices
* Payments
* Support
* Reviews
* CMS content
* Coupons
* Reports
* Notifications
* Audit logs

The platform therefore combines a **public-facing service marketplace**, **client relationship portal**, and **internal business management system**.

---

# Key Features

## Public Website

* Modern responsive landing page
* Service discovery
* Service categories
* Service search
* Service details
* Pricing
* Industry pages
* GST and other service-specific pages
* FAQs
* About page
* Contact page
* Privacy policy
* Terms and conditions
* CMS-managed pages
* Consultation booking
* Checkout flow
* Coupon support
* Payment success/failure pages

### Typical visitor journey

```text
Home
  ↓
Services
  ↓
Service Details
  ↓
Book Consultation
  ↓
Login / Register
  ↓
Checkout
  ↓
Payment
  ↓
Booking Confirmation
```

---

# Client Accounts

Clients can create and manage their accounts through the Next.js application.

### Authentication features

* Registration
* Login
* Logout
* Forgot password
* Password reset
* Session management
* Profile management
* Password change

Client authentication uses **Laravel Sanctum**.

The authenticated Sanctum token is maintained by the client application and used for authenticated API requests.

---

# Client Portal

Once authenticated, clients have access to a dedicated portal.

## Dashboard

The dashboard provides an overview of the client's relationship with the firm.

### Dashboard information

* Active services
* Documents
* Invoices
* Meetings
* Relationship manager
* Recent activity
* Quick actions

The dashboard acts as the primary starting point for authenticated users.

---

## Bookings

Clients can manage their service bookings.

### Features

* View bookings
* View booking details
* Cancel bookings
* Reschedule bookings
* View booking status
* View booking-related information

---

# My Services

The **My Services** section manages ongoing engagements.

Each engagement follows a defined workflow:

```text
Consult
   ↓
Proposal
   ↓
Submission
   ↓
Review
   ↓
Complete
```

Clients can access the workspace associated with an engagement.

### Engagement features

* Service information
* Current pipeline stage
* Workspace
* Engagement details
* Messages
* Documents
* Related invoices
* Related activity

This allows clients to understand exactly where their service currently stands.

---

# Messages

Clients can communicate directly with the firm through engagement-related message threads.

### Features

* Conversation threads
* Send messages
* View previous messages
* Engagement-specific communication

This keeps important client communication connected to the relevant service.

---

# Documents

The portal provides a secure document-management area.

### Features

* Document vault
* Folders
* Upload documents
* Download documents
* Share links
* Document requests
* Client submissions

A typical workflow is:

```text
Staff requests document
        ↓
Client receives request
        ↓
Client uploads document
        ↓
Staff reviews document
        ↓
Document becomes part of engagement
```

---

# Invoices & Payments

Clients can manage their financial records through the portal.

### Features

* Invoice vault
* Invoice details
* Statements
* Online payment
* Download invoices
* Saved payment methods
* Payment history

The platform is designed to support multiple payment providers.

### Payment providers

* Stripe
* PayPal
* Razorpay

Payment integrations are currently scaffolded for the platform.

---

# Calendar

Clients can manage meetings and events from their portal.

### Features

* View calendar events
* View meeting information
* RSVP
* Calendar integration toggles

This provides a centralized place for client appointments and service-related events.

---

# Support

Clients can access support directly from the portal.

### Features

* Create support tickets
* Reply to tickets
* Resolve tickets
* View ticket history
* Browse knowledge articles
* Contact form integration

The contact form can also create a support ticket, allowing website inquiries to enter the same support workflow.

---

# Reviews

Clients can interact with service reviews.

### Features

* View previous reviews
* Leave a review
* Review a completed service

Reviews can subsequently be moderated by staff through the admin panel.

---

# Notifications

Clients have access to a centralized notification system.

### Features

* View notifications
* Mark individual notifications as read
* Mark all notifications as read

Notifications can be used for important events such as:

* Booking updates
* Document requests
* Invoice creation
* Payment updates
* Messages
* Support updates

---

# Profile & Settings

Clients can manage their account information.

### Features

* View profile
* Update profile
* Change password
* Account settings

---

# Admin Panel

The admin panel is a **separate Laravel Blade application** designed for staff.

### URL

```text
/admin/login
```

The admin system does not use the client portal's authentication session.

Staff access is permission-based and can be controlled through roles.

---

# Admin Features

## Dashboard

Staff can monitor key business metrics and operational activity.

Possible dashboard information includes:

* Customers
* Bookings
* Services
* Revenue
* Invoices
* Payments
* Support tickets
* Engagement activity

---

## Catalog Management

Staff can manage the services offered through the platform.

### Categories

* Create categories
* Edit categories
* Delete categories
* Organize services

### Services

* Create services
* Edit services
* Manage pricing
* Manage service details
* Assign categories
* Manage service availability

### Providers

Staff can manage service providers associated with the catalog.

---

# Customer Management

Administrators can manage client accounts.

### Features

* View customers
* Customer details
* Customer activity
* Customer-related bookings
* Customer services
* Customer documents
* Customer invoices

---

# Staff & Roles

The administration system supports permission-based access.

### Staff management

* Create staff
* Manage staff
* Assign roles
* Manage permissions
* Update staff information

This allows different employees to access only the areas required for their responsibilities.

---

# Booking Management

Staff can manage the complete booking lifecycle.

### Features

* View bookings
* Update booking status
* Respond to bookings
* Manage booking details
* Manage related calendar events

### Example workflow

```text
Client submits booking
        ↓
Admin receives booking
        ↓
Staff reviews request
        ↓
Staff assigns/updates service
        ↓
Client receives update
```

---

# Support Ticket Management

Staff can manage client support requests.

### Features

* View tickets
* Reply to clients
* Update ticket status
* Resolve tickets
* Track ticket history

---

# Document Management

Staff can manage documents associated with customers and engagements.

### Features

* View documents
* Upload documents
* Manage document requests
* Organize documents
* Share documents
* Track document-related activity

---

# Quotes & Invoices

Staff can create and manage financial documents.

### Features

* Create quotes
* Manage quotes
* Create invoices
* Edit invoices
* View invoices
* Mark invoices as paid
* Track invoice status

---

# Payments

Staff can monitor payment activity.

### Features

* View payments
* Track payment status
* Associate payments with invoices
* Mark payments as paid where applicable
* Review payment records

---

# Coupons

The platform supports promotional coupon management.

Staff can manage:

* Coupon codes
* Discounts
* Coupon availability
* Coupon configuration

---

# Reviews Management

Staff can moderate client reviews.

### Features

* View reviews
* Approve reviews
* Manage review status

This provides moderation before reviews become publicly visible.

---

# CMS

The admin panel provides content-management capabilities for website content.

### CMS-managed content includes

* Pages
* Blogs
* Service content
* Industry content
* FAQs
* Subscription plans
* Branding
* Website settings

This reduces the need to modify application code for routine content changes.

---

# Settings

Administrators can manage application-level settings such as:

* Branding
* Notifications
* General configuration
* Platform preferences

---

# Reports

The administration system provides reporting capabilities for business operations.

Reports can be used to analyze areas such as:

* Bookings
* Customers
* Services
* Invoices
* Payments
* Operational activity

---

# Audit Logs

Important administrative actions can be tracked through audit logs.

This provides visibility into changes made by staff and helps maintain accountability across the administration system.

---

# End-to-End Client Workflow

The primary client journey is:

```text
                    ┌─────────────────┐
                    │  Public Website │
                    └────────┬────────┘
                             │
                             ▼
                    Browse Services
                             │
                             ▼
                    Select a Service
                             │
                             ▼
                   Register / Login
                             │
                             ▼
                    Book Consultation
                             │
                             ▼
                         Checkout
                             │
                             ▼
                         Payment
                             │
                             ▼
                    Booking Confirmed
                             │
                             ▼
                 ┌──────────────────────┐
                 │    Client Portal     │
                 └──────────┬───────────┘
                            │
                 ┌──────────┼───────────┐
                 ▼          ▼           ▼
             Documents   Messages    Meetings
                 │          │           │
                 └──────────┼───────────┘
                            ▼
                    Service Engagement
                            │
                            ▼
          Consult → Proposal → Submission
                            │
                            ▼
                          Review
                            │
                            ▼
                         Complete
                            │
                            ▼
                         Invoice
                            │
                            ▼
                         Payment
                            │
                            ▼
                          Review
```

---

# Staff Workflow

The corresponding staff workflow is:

```text
Client Books
     ↓
Admin receives booking
     ↓
Staff reviews request
     ↓
Assign service / staff
     ↓
Communicate with client
     ↓
Request documents
     ↓
Review submitted documents
     ↓
Update engagement status
     ↓
Issue quote / invoice
     ↓
Receive payment
     ↓
Complete service
     ↓
Request client review
```

---

# Application Architecture

Oknitech Serve uses a decoupled frontend/backend architecture.

```text
┌──────────────────────────────────────────────┐
│                Next.js Application            │
│                                              │
│  Marketing Website + Client Portal           │
│              localhost:3001                  │
└──────────────────────┬───────────────────────┘
                       │
                       │ REST API
                       │ /api/*
                       ▼
┌──────────────────────────────────────────────┐
│                 Laravel 11                   │
│                                              │
│  REST API + Sanctum                           │
│  localhost:8000                              │
└──────────────┬─────────────────┬─────────────┘
               │                 │
               ▼                 ▼
        ┌─────────────┐   ┌───────────────┐
        │    MySQL    │   │     Redis     │
        └─────────────┘   └───────────────┘

┌──────────────────────────────────────────────┐
│              Laravel Blade Admin             │
│                                              │
│              /admin/login                    │
│                 Staff                        │
└──────────────────────────────────────────────┘
```

---

# Technology Stack

## Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* Axios
* Modern responsive UI

## Backend

* Laravel 11
* PHP
* Laravel Sanctum
* REST API

## Admin

* Laravel Blade
* Laravel authentication
* Role/permission-based staff access

## Database

* MySQL

## Caching / Infrastructure

* Redis
* Docker
* Nginx

## Payments

* Stripe
* PayPal
* Razorpay

---

# Project Structure

A simplified architecture looks like:

```text
oknitech-serve/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   ├── Models/
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   │
│   ├── resources/
│   │   └── views/
│   │
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │
│   └── ...
│
├── docker/
├── nginx/
└── README.md
```

> The exact directory names may differ depending on the current repository structure.

---

# API Architecture

The Laravel application acts as the central backend for the client application.

The Next.js application communicates with Laravel through REST endpoints.

Example:

```text
Browser
   │
   ▼
Next.js
   │
   │ /api/*
   ▼
Laravel REST API
   │
   ├── Authentication
   ├── Services
   ├── Bookings
   ├── Engagements
   ├── Documents
   ├── Invoices
   ├── Payments
   ├── Messages
   ├── Calendar
   ├── Support
   ├── Reviews
   └── Notifications
```

The Next.js application proxies `/api/*` requests to the Laravel backend, allowing the frontend to interact with the API through a consistent interface.

---

# Authentication & Authorization

## Client Authentication

Client authentication is handled by **Laravel Sanctum**.

The flow is approximately:

```text
Client
  ↓
Login / Register
  ↓
Laravel Authentication API
  ↓
Sanctum Token
  ↓
Next.js stores session token
  ↓
Authenticated API requests
```

The client application uses the authenticated token when accessing protected resources.

---

## Admin Authentication

The admin panel uses a **separate Laravel authentication flow**.

```text
/admin/login
      ↓
Staff Login
      ↓
Laravel Session
      ↓
Role / Permission Check
      ↓
Admin Dashboard
```

Client authentication and staff authentication are intentionally separated.

---

# Payments

Oknitech Serve is structured to support multiple payment providers.

### Supported / scaffolded providers

```text
Stripe
PayPal
Razorpay
```

The intended payment workflow is:

```text
Client
  ↓
Checkout
  ↓
Payment Provider
  ↓
Payment Result
  ↓
Laravel
  ↓
Invoice / Booking Status
  ↓
Client Portal
```

Separate success and failure pages provide appropriate feedback to the client after checkout.

---

# Database

The Laravel backend uses **MySQL** as the primary relational database.

The database stores business entities such as:

* Users
* Staff
* Roles
* Permissions
* Categories
* Services
* Providers
* Bookings
* Engagements
* Messages
* Documents
* Document requests
* Invoices
* Quotes
* Payments
* Coupons
* Calendar events
* Support tickets
* Reviews
* Notifications
* CMS content
* Audit logs

Redis is used for supporting application infrastructure such as caching and other performance-related workloads.

---

# Running the Project Locally

Both applications need to be running for the complete client flow.

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PHP
* Composer
* MySQL
* Redis
* Laravel CLI (optional)
* Git

Docker can also be used for the full-stack environment.

---

# 1. Start Laravel Backend

Navigate to the Laravel application:

```bash
cd backend
```

Install PHP dependencies:

```bash
composer install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

Configure the database and other environment variables in `.env`.

Run migrations:

```bash
php artisan migrate
```

If seeders are available:

```bash
php artisan db:seed
```

Start Laravel:

```bash
php artisan serve
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

---

# 2. Start Next.js

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Configure the frontend environment variables according to the project's `.env.example`.

Start the development server:

```bash
npm run dev
```

The client application will normally be available at:

```text
http://localhost:3001
```

---

# 3. Access the Admin Panel

Once Laravel is running, open:

```text
http://127.0.0.1:8000/admin/login
```

The admin panel operates independently from the Next.js client portal.

---

# Local Development Architecture

For a complete local environment:

```text
Terminal 1
──────────
Laravel
php artisan serve
        │
        ├── REST API
        └── Admin Panel


Terminal 2
──────────
Next.js
npm run dev
        │
        ├── Marketing Website
        └── Client Portal


Infrastructure
──────────────
MySQL
Redis
```

Both the Laravel and Next.js applications should be running to test the complete client journey.

---

# Demo Accounts

## Client

```text
Email: demo@oknitech.serve
Password: Password123!
```

The client account can be used to test:

* Client dashboard
* Bookings
* Services
* Documents
* Messages
* Invoices
* Calendar
* Support
* Reviews
* Notifications
* Profile settings

## Admin

```text
Email: admin@oknitech.serve
Password: Admin@12345
```

The admin account can be used to test:

* Dashboard
* Catalog
* Customers
* Staff
* Bookings
* Documents
* Quotes
* Invoices
* Payments
* Coupons
* Reviews
* CMS
* Settings
* Reports
* Audit logs

> **Security:** These credentials are for local/demo environments only. Never use demo passwords in production.

---

# Environment Configuration

The project requires environment variables for configuration.

Typical configuration areas include:

### Laravel

```env
APP_NAME=
APP_URL=

DB_CONNECTION=mysql
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

REDIS_HOST=
REDIS_PORT=

SANCTUM_STATEFUL_DOMAINS=

STRIPE_KEY=
STRIPE_SECRET=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

### Next.js

```env
NEXT_PUBLIC_API_URL=
```

> Use the actual variable names present in the project's `.env.example` files when configuring the application.

Never commit `.env` files or production credentials to Git.

---

# Docker

The project includes Docker/Nginx support for full-stack deployment.

A production-style architecture can be represented as:

```text
                    Internet
                       │
                       ▼
                    Nginx
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
      Next.js                    Laravel
          │                         │
          │                         ├── MySQL
          │                         │
          │                         └── Redis
          │
          ▼
      Client UI
```

Nginx can act as the reverse proxy and route requests to the appropriate application service.

---

# Production Deployment

A production deployment should separate application configuration from development configuration.

Recommended components:

```text
                    Domain
                       │
                       ▼
                     Nginx
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
        Next.js               Laravel
            │                     │
            │                     ├── MySQL
            │                     ├── Redis
            │                     └── Storage
            │
            ▼
       Client Portal
```

Before deployment:

* Configure production environment variables
* Configure database credentials
* Configure Redis
* Configure storage
* Configure payment provider credentials
* Configure Sanctum domains
* Configure CORS
* Build the Next.js application
* Configure Laravel caching
* Configure queues where required
* Configure HTTPS
* Configure Nginx
* Disable debug mode
* Use strong production credentials

---

# Security Considerations

The application contains sensitive business information including:

* Client information
* Documents
* Invoices
* Payment information
* Staff communication
* Business records

Production deployments should therefore include:

* HTTPS
* Strong authentication
* Role-based authorization
* Secure password policies
* Protected document storage
* API rate limiting
* Input validation
* CSRF protection where applicable
* Secure CORS configuration
* Environment-based secrets
* Database backups
* Audit logging
* Secure payment-provider configuration

Demo credentials should never be used in a production environment.

---

# Complete Platform Flow

Oknitech Serve brings the marketing site, client portal, API, and staff operations together into one workflow:

```text
                    CLIENT
                      │
                      ▼
              Marketing Website
                      │
                      ▼
                Browse Services
                      │
                      ▼
                Book / Checkout
                      │
                      ▼
                Client Portal
                      │
       ┌──────────────┼───────────────┐
       ▼              ▼               ▼
   Documents       Messages        Calendar
       │              │               │
       └──────────────┼───────────────┘
                      ▼
                Active Engagement
                      │
                      ▼
              Invoice / Payment
                      │
                      ▼
                    Review


                    STAFF
                      │
                      ▼
                Admin Panel
                      │
       ┌──────────────┼───────────────┐
       ▼              ▼               ▼
    Bookings       Customers       Services
       │              │               │
       ├──────────────┼───────────────┤
       ▼              ▼               ▼
   Documents       Messages        Invoices
       │              │               │
       └──────────────┼───────────────┘
                      ▼
                Reports / Audit
```

---

# Future Improvements

Potential future enhancements include:

* Real-time messaging with WebSockets
* Advanced appointment scheduling
* Automated email and SMS notifications
* Full payment-provider production integrations
* Subscription-based services
* Advanced analytics dashboards
* Client document e-signatures
* Automated document verification
* CRM integrations
* Google/Outlook calendar synchronization
* Advanced search and filtering
* Multi-language support
* Multi-tenant architecture
* Mobile application
* AI-powered support and service recommendations

---

# License

This project is proprietary software developed for **Oknitech Serve**.

Unauthorized copying, redistribution, or commercial use is not permitted without appropriate authorization.

---

# Summary

**Oknitech Serve** is a full-stack professional-services platform combining:

* A public marketing website
* Service discovery and booking
* Online checkout
* Client authentication
* A complete client portal
* Engagement management
* Secure document workflows
* Messaging
* Invoices and payments
* Calendar management
* Support tickets
* Reviews and notifications
* A role-based staff administration panel
* CMS and business management tools
* Reporting and audit logging

The platform connects the complete service lifecycle in one system:

> **Discover → Book → Pay → Manage → Communicate → Complete → Review**
