# Admin Dashboard Features & Flow

## Overview

The admin dashboard is a comprehensive management interface for platform administrators to oversee developers, properties, campaigns, revenue, and platform settings.

## Authentication & Access Control

### Admin Login (`/admin/login`)
- **Access**: Public route at `/admin/login`
- **Authentication Method**: 
  - Email-based authentication
  - Admin emails: `admin@realaist.com`, `superadmin@realaist.com`, `support@realaist.com`
  - Development mode: Any password works for admin emails
- **Authorization**: Uses `ProtectedRoute` with `requireAdmin={true}` flag
- **User Type Check**: Verifies `user.userType === 'admin'` in `AuthContext`

### Protected Routes
All admin routes are protected with `requireAdmin={true}`:
- `/admin` - Overview/Dashboard
- `/admin/developers` - Developer management
- `/admin/properties` - Property verification
- `/admin/analytics` - Platform analytics
- `/admin/revenue` - Revenue dashboard
- `/admin/messages` - Messages (placeholder)
- `/admin/reports` - Reports (placeholder)
- `/admin/settings` - Platform settings

## Admin Layout (`AdminLayout.tsx`)

### Navigation Structure
- **Sidebar Navigation** with 8 main sections:
  1. **Overview** (`/admin`) - Main dashboard
  2. **Developers** (`/admin/developers`) - Developer account management
  3. **All Properties** (`/admin/properties`) - Property verification
  4. **Analytics** (`/admin/analytics`) - Platform analytics
  5. **Revenue** (`/admin/revenue`) - Revenue tracking
  6. **Messages** (`/admin/messages`) - User messages (placeholder)
  7. **Reports** (`/admin/reports`) - Report generation (placeholder)
  8. **Settings** (`/admin/settings`) - Platform configuration

### Features
- Responsive design (mobile sidebar with overlay)
- Dark mode support
- Active route highlighting
- Badge notifications (e.g., unread messages)
- User profile display in sidebar
- Logout functionality

## Main Features

### 1. Overview/Dashboard (`AdminDashboard.tsx`)

**Purpose**: Main landing page showing platform statistics and developer overview

**Features**:
- **Statistics Cards**:
  - Total Developers count
  - Active Subscriptions count
  - Total Properties count
  - Total Revenue (currently mock data: $12,450)

- **Developer Management**:
  - Search functionality (by name, email, company)
  - Status filtering (All, Active, Inactive, Suspended)
  - Developer table with:
    - Developer name and email
    - Company name and license number
    - Properties count, views, scheduled visits
    - Subscription plan and status
    - Account status (active/inactive/suspended)
    - Last login date
    - Action buttons (View, More options)

- **Developer Detail Modal**:
  - Full developer information
  - Account details (license, join date, last login)
  - Performance metrics (properties, views, visits)
  - Action buttons (View Properties, Send Message, Suspend Account)

**Current Status**: Uses mock data for developers

---

### 2. Campaign Management (`CampaignManagement.tsx`)

**Purpose**: Review and approve/reject advertising campaigns from developers

**Features**:
- **Statistics Dashboard**:
  - Total Campaigns count
  - Pending Review count
  - Active campaigns count
  - Rejected campaigns count

- **Filtering**:
  - Filter tabs: All, Pending Review, Active, Rejected
  - Shows count for each filter

- **Campaign List**:
  - Campaign name and status badge
  - Budget (formatted in KES)
  - Duration (start - end dates)
  - Platforms (e.g., Google Ads)
  - Creation date
  - View Details button
  - Approve/Reject buttons (for pending campaigns)

- **Campaign Details Modal**:
  - Full campaign information:
    - Campaign name
    - Status
    - Budget (KES formatted)
    - Target locations
    - Target age group
    - Platforms
    - Audience interests (tags)
    - Campaign duration
    - Google Ads Campaign ID (if approved)
  - Approve/Reject actions (for pending campaigns)

**Workflow**:
1. Developer creates campaign → Status: `pending`
2. Admin reviews campaign details
3. Admin can:
   - **Approve**: 
     - Sets status to `active`
     - Generates Google Ads Campaign ID (`gads_${timestamp}_${userId}`)
     - Updates campaign in database
   - **Reject**: 
     - Sets status to `failed`
     - Optional rejection reason
     - Updates campaign in database

**Backend Functions** (`campaignsService.ts`):
- `getAllCampaignsForAdmin()`: Fetches all campaigns with user profile data
- `approveCampaign(id)`: Approves campaign and generates Google Ads ID
- `rejectCampaign(id, reason?)`: Rejects campaign with optional reason

**Note**: Currently missing from navigation - needs to be added to `AdminLayout` nav items

---

### 3. Revenue Dashboard (`RevenuePage.tsx`)

**Purpose**: Track platform revenue, ad spend, and profit from campaigns

**Features**:
- **Filters**:
  - Date range (From/To dates)
  - User email filter

- **Revenue Summary Cards**:
  - **Total Collected**: Sum of all `user_budget` values (KES formatted)
  - **Total Ad Spend**: Sum of all `ad_spend` values (KES formatted)
  - **Platform Profit**: Sum of all `platform_fee` values (KES formatted)
  - **Total Campaigns**: Count of all campaigns
  - **Active Campaigns**: Count of campaigns with `status = 'active'`

- **Campaign Details Table**:
  - Campaign name and user email
  - User budget (KES)
  - Ad spend (KES)
  - Platform fee (KES) - highlighted in green
  - Status badge (active/pending/failed)
  - Creation date

**Data Source**: Queries `campaigns` table directly with filters

**Calculations**:
- All amounts stored in database as numbers (not cents)
- Displayed using `formatKES()` utility
- Platform profit = 30% of user budget (hidden fee)

---

### 4. Properties Management (`PropertiesPage.tsx`)

**Purpose**: Verify and manage all properties on the platform

**Features**:
- **Property List**:
  - Property title
  - Developer name (company name or full name)
  - Status (PENDING, LIVE, SOLD)
  - Verification status (isVerified checkbox)
  - Verify button for unverified properties

**Workflow**:
1. Admin views all properties
2. Admin can verify a property:
   - Sets `is_verified = true`
   - Sets `status = 'LIVE'`
   - Updates property in database

**Backend Functions** (`adminService.ts`):
- `verifyPropertyAsAdmin(propertyId)`: Verifies property and sets status to LIVE
- **Authorization**: Checks admin email whitelist:
  - `admin@realaist.tech`
  - `admin@realaist.com`
  - `superadmin@realaist.com`
  - `support@realaist.com`

**Component**: Uses `AdminTable` component for display

---

### 5. Settings (`SettingsPage.tsx`)

**Purpose**: Configure platform settings, especially Google Ads API integration

**Features**:
- **Google Ads API Configuration**:
  - **Developer Token** (required):
    - Password field with show/hide toggle
    - Masked display option
    - Links to Google Ads API documentation
  - **MCC Customer ID** (optional):
    - Manager Account Customer ID for multi-account management
  - **Login Customer ID** (optional):
    - Customer ID for authentication

- **Current Configuration Display**:
  - Shows masked tokens
  - Displays all configured values

- **Save Functionality**:
  - Saves configuration (currently logs to console)
  - Success/error status indicators
  - Test phase warning banner

**Current Status**: 
- Loads from environment variables (`VITE_GADS_*`)
- Save functionality is placeholder (needs backend implementation)

---

### 6. Messages (`MessagesPage.tsx`)

**Status**: Placeholder - Not implemented
- Shows "This is a placeholder for the admin Messages module"

---

### 7. Reports (`ReportsPage.tsx`)

**Status**: Placeholder - Not implemented
- Shows "This is a placeholder for the admin Reports module"

---

### 8. Analytics (`/admin/analytics`)

**Status**: Routes to `AdminDashboard` component
- Currently shows the same developer overview as main dashboard
- Needs dedicated analytics implementation

---

## Data Flow

### Campaign Approval Flow

```
Developer creates campaign
    ↓
Campaign saved with status='pending'
    ↓
Admin views campaign in Campaign Management
    ↓
Admin reviews campaign details
    ↓
Admin approves/rejects:
    ↓
If APPROVED:
    - Status → 'active'
    - Google Ads Campaign ID generated
    - Campaign updated in database
    - Campaign becomes active

If REJECTED:
    - Status → 'failed'
    - Optional reason stored
    - Campaign updated in database
```

### Payment & Campaign Status Flow

```
Developer creates campaign
    ↓
Payment initialized via Paystack
    ↓
Payment status: 'pending'
    ↓
User completes payment
    ↓
Paystack webhook → payment_status: 'success'
    ↓
Campaign payment_status: 'success'
    ↓
Admin can now approve campaign
    ↓
Admin approves → status: 'active'
```

**Note**: Campaign approval should ideally check for `payment_status = 'success'` before allowing approval.

---

## Database Queries

### Campaigns
- `getAllCampaignsForAdmin()`: Fetches all campaigns with user profile join
- Includes: `payment_status`, `payment_id` (after recent fix)

### Properties
- `getPropertiesDirect()`: Fetches all properties with developer information
- Used for property verification page

### Revenue
- Direct query to `campaigns` table with date/user filters
- Aggregates: `user_budget`, `ad_spend`, `platform_fee`

---

## Missing Features / Improvements Needed

1. **Campaign Management Navigation**: Not in sidebar navigation - needs to be added
2. **Payment Status Check**: Campaign approval should verify payment status
3. **Messages Module**: Placeholder - needs implementation
4. **Reports Module**: Placeholder - needs implementation
5. **Analytics Module**: Currently shows developer dashboard - needs dedicated analytics
6. **Settings Save**: Google Ads config save is placeholder - needs backend API
7. **Developer Management**: Currently uses mock data - needs real database integration
8. **Admin Authentication**: Development mode - needs proper Supabase auth integration
9. **Real-time Updates**: Could benefit from Supabase Realtime for campaign/property updates
10. **Campaign Details**: Missing payment status display in campaign details modal

---

## Key Files

- `src/pages/AdminDashboard.tsx` - Main dashboard
- `src/pages/admin/CampaignManagement.tsx` - Campaign approval
- `src/pages/admin/RevenuePage.tsx` - Revenue tracking
- `src/pages/admin/PropertiesPage.tsx` - Property verification
- `src/pages/admin/SettingsPage.tsx` - Platform settings
- `src/components/dashboard/AdminLayout.tsx` - Admin layout wrapper
- `src/services/campaignsService.ts` - Campaign backend functions
- `src/services/adminService.ts` - Admin-specific functions
- `src/components/auth/ProtectedRoute.tsx` - Route protection

---

## Security Considerations

1. **Admin Email Whitelist**: Currently hardcoded in multiple places
2. **Property Verification**: Checks admin email before allowing verification
3. **Route Protection**: Uses `requireAdmin` flag in `ProtectedRoute`
4. **Development Mode**: Admin login bypasses password check - needs production auth

---

## Currency Handling

- All monetary values use KES (Kenyan Shillings)
- Displayed using `formatKES()` utility function
- Amounts stored as numbers (not cents) in campaigns table
- Payment amounts stored in cents in payments table

