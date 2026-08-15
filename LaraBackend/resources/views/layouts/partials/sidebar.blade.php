<nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
    <div class="sb-sidenav-menu">
        <div class="nav">
            <div class="sb-sidenav-menu-heading">Core</div>
            <a class="nav-link" href="{{ route('admin.dashboard') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-tachometer-alt"></i></div>
                Dashboard
            </a>
            <a class="nav-link" href="{{ route('admin.calendar.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-calendar"></i></div>
                Calendar
            </a>
            <a class="nav-link" href="{{ route('admin.calendar-events.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-calendar-plus"></i></div>
                Calendar Events
            </a>
            <a class="nav-link" href="{{ route('admin.reports.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-chart-bar"></i></div>
                Reports
            </a>

            <div class="sb-sidenav-menu-heading">Catalog</div>
            <a class="nav-link" href="{{ route('admin.categories.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-folder"></i></div>
                Categories
            </a>
            <a class="nav-link" href="{{ route('admin.services.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-list"></i></div>
                Services
            </a>
            <a class="nav-link" href="{{ route('admin.providers.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-user-tie"></i></div>
                Service Providers
            </a>

            <div class="sb-sidenav-menu-heading">People</div>
            <a class="nav-link" href="{{ route('admin.customers.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-users"></i></div>
                Customers
            </a>
            <a class="nav-link" href="{{ route('admin.staff.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-id-badge"></i></div>
                Staff
            </a>
            <a class="nav-link" href="{{ route('admin.roles.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-user-shield"></i></div>
                Roles & Permissions
            </a>

            <div class="sb-sidenav-menu-heading">Operations</div>
            <a class="nav-link" href="{{ route('admin.bookings.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-calendar-check"></i></div>
                Bookings
            </a>
            <a class="nav-link" href="{{ route('admin.support-tickets.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-life-ring"></i></div>
                Support Tickets
            </a>
            <a class="nav-link" href="{{ route('admin.documents.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-folder-open"></i></div>
                Documents
            </a>
            <a class="nav-link" href="{{ route('admin.quotes.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-file-signature"></i></div>
                Quotes
            </a>
            <a class="nav-link" href="{{ route('admin.invoices.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-file-invoice"></i></div>
                Invoices
            </a>
            <a class="nav-link" href="{{ route('admin.payments.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-credit-card"></i></div>
                Payments
            </a>
            <a class="nav-link" href="{{ route('admin.coupons.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-ticket-alt"></i></div>
                Coupons
            </a>
            <a class="nav-link" href="{{ route('admin.reviews.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-star"></i></div>
                Reviews
            </a>

            <div class="sb-sidenav-menu-heading">Content</div>
            <a class="nav-link" href="{{ route('admin.cms-pages.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-file-alt"></i></div>
                CMS Pages
            </a>
            <a class="nav-link" href="{{ route('admin.blogs.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-blog"></i></div>
                Blogs
            </a>
            <a class="nav-link" href="{{ route('admin.notifications.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-bell"></i></div>
                Notifications
            </a>

            <div class="sb-sidenav-menu-heading">Platform</div>
            <a class="nav-link" href="{{ route('admin.subscription-plans.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-crown"></i></div>
                Subscription Plans
            </a>
            <a class="nav-link" href="{{ route('admin.settings.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-cog"></i></div>
                Settings
            </a>
            <a class="nav-link" href="{{ route('admin.audit-logs.index') }}">
                <div class="sb-nav-link-icon"><i class="fas fa-history"></i></div>
                Audit Logs
            </a>
        </div>
    </div>
</nav>
