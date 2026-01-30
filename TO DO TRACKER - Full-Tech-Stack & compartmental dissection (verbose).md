TodoTracker Application - Comprehensive Technical Decomposition & Recreation Blueprint
Executive Summary
This document provides a complete investigatory analysis of the TodoTracker application, designed for recreation as a Personal TODO Tracker Page component within an ERP-CRM-PSA-Command Center ecosystem using Next.js + Supabase + Clerk stack with enterprise-grade coding standards.

1. APPLICATION ARCHITECTURE OVERVIEW
1.1 Page Structure & Routing Map
RoutePagePurpose/Landing PageMarketing/onboarding page with feature showcase/dashboard.phpDashboardMain user landing with KPIs, quick actions, recent tasks/tasks.phpAll TasksList/Grid view with filtering, sorting, bulk actions/kanban.phpKanban BoardDrag-and-drop workflow visualization/calendar.phpCalendar ViewMonth/Week/Day task scheduling/categories.phpCategoriesTag/label management with color coding/archive.phpArchiveSoft-deleted completed tasks repository/trash.phpTrash30-day recoverable deletion queue/profile.phpProfileUser settings, security, preferences, activity log/auth/login.phpLoginAuthentication entry point/auth/register.phpRegisterUser registration/auth/forgot-password.phpPassword ResetEmail-based recovery/auth/logout.phpLogoutSession termination/privacy.phpPrivacy PolicyLegal compliance/terms.phpTerms of ServiceLegal compliance

2. DATA MODEL SPECIFICATION
2.1 Core Entities
Task Entity
typescriptinterface Task {
  id: string;                    // UUID primary key
  user_id: string;               // Foreign key to users
  title: string;                 // VARCHAR(255) - required
  description: string | null;    // TEXT(5000) - optional
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
  archived_at: Date | null;
  deleted_at: Date | null;       // Soft delete
  category_ids: string[];        // Many-to-many relation
}
Category Entity
typescriptinterface Category {
  id: string;
  user_id: string;
  name: string;                  // VARCHAR(50)
  color: string;                 // HEX color code
  created_at: Date;
}
User Entity (Clerk-managed with Supabase extension)
typescriptinterface UserProfile {
  id: string;                    // Clerk user ID
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  about: string | null;          // VARCHAR(500)
  location: string | null;       // VARCHAR(100)
  timezone: string;              // IANA timezone
  profile_picture_url: string | null;
  email_verified: boolean;
  created_at: Date;
}
User Preferences Entity
typescriptinterface UserPreferences {
  user_id: string;
  theme: 'light' | 'dark';
  default_view: 'dashboard' | 'tasks' | 'kanban' | 'calendar';
  default_sort: 'due_date' | 'priority' | 'created_date' | 'title';
  tasks_per_page: 10 | 20 | 50 | 100;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  time_format: '12h' | '24h';
  email_notifications: boolean;
  daily_digest: boolean;
  digest_time: string;           // Time string
  due_date_reminders: boolean;
  reminder_before: '24h' | '48h' | '1w';
  auto_archive_completed: boolean;
  archive_after_days: number;
  default_task_priority: 'low' | 'medium' | 'high';
  default_task_status: 'pending' | 'in_progress';
  week_starts_on: 'sunday' | 'monday';
}
Activity Log Entity
typescriptinterface ActivityLog {
  id: string;
  user_id: string;
  action_type: 'login' | 'logout' | 'profile_update' | 'email_change' | 
               'password_change' | 'preferences_update' | 'task_create' | 
               'task_update' | 'task_delete' | 'security_event';
  description: string;
  ip_address: string;
  user_agent: string;
  metadata: Record<string, any>;
  created_at: Date;
}
```

---

## 3. COMPONENT HIERARCHY & UI PATTERNS

### 3.1 Layout Components
```
AppShell
├── Header (TopNav)
│   ├── Logo/Brand Link
│   ├── GlobalSearch (search tasks across all views)
│   ├── NotificationsDropdown
│   └── UserProfileDropdown
│       ├── ProfileLink
│       └── LogoutButton
├── Sidebar (Navigation)
│   ├── NavItem: Dashboard
│   ├── NavItem: All Tasks
│   ├── NavItem: Kanban Board
│   ├── NavItem: Calendar
│   ├── NavItem: Categories
│   ├── NavItem: Archive
│   ├── NavItem: Trash
│   ├── Divider
│   └── NavItem: Profile
│   └── UserInfo (bottom)
├── MainContent (children)
└── Footer
    ├── Copyright
    ├── PrivacyPolicyLink
    └── TermsOfServiceLink
```

### 3.2 Page-Specific Components

#### **Dashboard Page**
```
DashboardPage
├── PageHeader
│   ├── Title ("Dashboard")
│   ├── WelcomeMessage
│   └── NewTaskButton (opens modal)
├── StatsCards (row)
│   ├── TotalTasksCard (blue, links to /tasks)
│   ├── PendingCard (yellow, links to filtered /tasks)
│   ├── InProgressCard (teal, links to filtered /tasks)
│   └── CompletedCard (green, links to filtered /tasks)
├── OverallProgressBar
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── QuickAddTask
│   │   │   ├── TextInput (title only)
│   │   │   ├── AddButton
│   │   │   └── DetailedButton (opens full modal)
│   │   └── RecentTasksList
│   │       ├── TaskCard (repeating)
│   │       │   ├── StatusIcon
│   │       │   ├── Title/Description
│   │       │   ├── PriorityBadge
│   │       │   ├── StatusBadge
│   │       │   ├── DueDate
│   │       │   └── ActionButtons (Edit, Delete)
│   │       └── ViewAllLink
│   └── RightColumn
│       ├── UpcomingDeadlinesWidget
│       └── QuickActionsPanel
│           ├── AddNewTaskButton
│           ├── ViewAllTasksLink
│           ├── KanbanBoardLink
│           ├── CalendarViewLink
│           └── ManageCategoriesLink
└── NewTaskModal (global)
```

#### **All Tasks Page**
```
AllTasksPage
├── PageHeader
│   ├── Title + TaskCount Badge
│   ├── Subtitle
│   └── NewTaskButton
├── ToolbarRow
│   ├── ViewToggle (List | Grid)
│   ├── SearchInput
│   ├── FiltersButton (opens sidebar/modal)
│   └── SortDropdown
│       ├── Newest First
│       ├── Oldest First
│       ├── Due Date (Earliest/Latest)
│       ├── Priority (High-Low/Low-High)
│       ├── Title (A-Z/Z-A)
│       └── Status
├── TaskListView | TaskGridView
│   └── TaskRow/Card (repeating)
│       ├── Checkbox (bulk select)
│       ├── TitleLink (opens edit modal)
│       ├── Description snippet
│       ├── StatusBadge
│       ├── PriorityBadge
│       ├── DueDateDisplay
│       ├── CategoriesTags
│       └── ActionButtons (Archive, Edit, Delete)
├── BulkActionsBar (appears when items selected)
│   ├── SelectedCount
│   ├── MarkCompleteButton
│   ├── ArchiveCompletedButton
│   ├── ChangePriorityButton
│   ├── DeleteButton
│   └── CancelButton
└── FiltersSidebar (slide-out)
    ├── StatusCheckboxes (Pending, In Progress, Completed)
    ├── PriorityCheckboxes (High, Medium, Low)
    ├── CategoriesCheckboxes
    ├── DueDateRangeInputs
    ├── QuickFilters (Today, This Week, This Month, Overdue)
    ├── ApplyButton
    └── ClearFiltersLink
```

#### **Kanban Board Page**
```
KanbanBoardPage
├── PageHeader
│   ├── Title + TaskCount
│   └── NewTaskButton
├── FilterBar
│   ├── PriorityDropdown
│   ├── CategoriesMultiSelect
│   ├── SearchInput
│   └── ClearFiltersButton
├── KanbanBoard (horizontal scroll container)
│   ├── Column: Pending (yellow accent)
│   │   ├── ColumnHeader (title + count + AddButton)
│   │   ├── DropZone
│   │   └── TaskCards (draggable)
│   │       └── KanbanCard
│   │           ├── Title
│   │           ├── Description snippet
│   │           ├── PriorityBadge
│   │           ├── DueDateBadge
│   │           └── MoveMenu (dropdown)
│   ├── Column: In Progress (teal accent)
│   │   └── (same structure)
│   └── Column: Completed (green accent)
│       └── (same structure)
└── EmptyColumnState
    ├── Icon
    ├── Message
    └── AddTaskButton
```

#### **Calendar Page**
```
CalendarPage
├── PageHeader
│   ├── Title
│   └── NewTaskButton
├── CalendarToolbar
│   ├── NavigationGroup
│   │   ├── PrevButton
│   │   ├── TodayButton
│   │   └── NextButton
│   ├── CurrentPeriodDisplay
│   └── ViewModeToggle
│       ├── MonthButton
│       ├── WeekButton
│       └── DayButton
├── CalendarView
│   ├── MonthView (default)
│   │   ├── WeekdayHeaders
│   │   └── DayGrid
│   │       └── DayCell
│   │           ├── DateNumber
│   │           └── TaskPills (colored by status)
│   ├── WeekView
│   └── DayView
└── TaskDetailPopover (on task click)
```

#### **Categories Page**
```
CategoriesPage
├── PageHeader
│   ├── Title
│   └── AddCategoryButton
├── StatsCards
│   ├── TotalCategoriesCard
│   ├── CategorizedTasksCard
│   └── MostUsedCard
├── CategoriesList
│   └── CategoryCard (repeating)
│       ├── ColorIndicator
│       ├── Name
│       ├── TaskCount
│       └── ActionButtons (Edit, Delete)
├── EmptyState
└── AddCategoryModal
    ├── NameInput
    ├── ColorPicker
    │   ├── PresetColors (10 options)
    │   └── CustomColorInput
    ├── PreviewBadge
    └── ActionButtons (Cancel, Save)
```

#### **Archive Page**
```
ArchivePage
├── PageHeader
│   ├── Title + Count
│   └── AutoArchiveSettingsButton
├── ViewToolbar (same as AllTasks)
├── ArchivedTasksList
│   └── TaskRow
│       └── ActionButtons (Restore, Delete Permanently)
├── FiltersSidebar
└── AutoArchiveModal
    ├── Description
    ├── DaysInput
    └── ArchiveNowButton
```

#### **Trash Page**
```
TrashPage
├── WarningAlert (30-day auto-delete notice)
├── PageHeader
│   └── EmptyTrashButton
├── TrashList
│   └── DeletedTaskRow
│       └── ActionButtons (Restore, Delete Permanently)
├── ConfirmDeleteModal
│   ├── WarningMessage
│   ├── TypeDELETEConfirmation
│   └── ActionButtons
└── EmptyTrashModal
    ├── CriticalWarning
    ├── AffectedCount
    ├── DataLossWarning
    ├── UnderstandCheckbox
    ├── TypeEMPTY_TRASHConfirmation
    └── ActionButtons
```

#### **Profile Page**
```
ProfilePage
├── PageHeader
│   ├── Title
│   └── Subtitle
├── TwoColumnLayout
│   ├── LeftSidebar
│   │   ├── ProfileCard
│   │   │   ├── AvatarWithEditButton
│   │   │   ├── FullName
│   │   │   ├── Email
│   │   │   ├── VerifiedBadge
│   │   │   └── MemberSinceDate
│   │   └── StatsCard
│   │       ├── TotalTasks
│   │       ├── Completed
│   │       └── CompletionRateProgress
│   └── MainContent
│       └── TabsContainer
│           ├── PersonalInfoTab
│           │   ├── FirstNameInput
│           │   ├── LastNameInput
│           │   ├── EmailInput (requires verification)
│           │   ├── PhoneInput
│           │   ├── AboutTextarea
│           │   ├── LocationInput
│           │   ├── TimezoneSelect
│           │   └── SaveButton
│           ├── AccountSecurityTab
│           │   ├── SecurityInfo
│           │   │   ├── LastLogin
│           │   │   └── EmailStatus
│           │   ├── ChangePasswordForm
│           │   │   ├── CurrentPasswordInput
│           │   │   ├── NewPasswordInput (with strength indicators)
│           │   │   ├── ConfirmPasswordInput
│           │   │   └── ChangeButton
│           │   ├── TwoFactorSection (Coming Soon)
│           │   └── DangerZone
│           │       └── DeleteAccountButton
│           ├── PreferencesTab
│           │   ├── DisplayPreferences
│           │   │   ├── ThemeToggle (Light/Dark)
│           │   │   ├── DefaultViewSelect
│           │   │   ├── DefaultSortSelect
│           │   │   ├── TasksPerPageSelect
│           │   │   ├── DateFormatSelect
│           │   │   └── TimeFormatToggle
│           │   ├── NotificationPreferences
│           │   │   ├── EmailNotificationsToggle
│           │   │   ├── DailyDigestToggle
│           │   │   ├── DigestTimeInput
│           │   │   ├── DueDateRemindersToggle
│           │   │   └── ReminderBeforeSelect
│           │   ├── TaskPreferences
│           │   │   ├── AutoArchiveToggle
│           │   │   ├── ArchiveAfterDaysInput
│           │   │   ├── DefaultPrioritySelect
│           │   │   ├── DefaultStatusSelect
│           │   │   └── WeekStartsOnSelect
│           │   └── SavePreferencesButton
│           └── ActivityLogTab
│               ├── FilterButtons (All, Logins, Changes, Security)
│               ├── ActivityList
│               │   └── ActivityItem (repeating)
│               │       ├── TypeIcon
│               │       ├── ActionTitle
│               │       ├── Description
│               │       ├── IPAddress
│               │       └── Timestamp
│               └── LoadMoreButton
└── Modals
    ├── ChangeProfilePictureModal
    │   ├── FileInput
    │   ├── Preview
    │   └── UploadButton
    └── DeleteAccountModal
        ├── DataWarning
        ├── UnderstandCheckbox
        ├── PasswordConfirmation
        ├── TypeDELETE_MY_ACCOUNT
        └── DeleteButton
```

---

## 4. API ENDPOINT SPECIFICATION

### 4.1 Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List tasks with filtering/pagination |
| `GET` | `/api/tasks/:id` | Get single task |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Soft delete task |
| `POST` | `/api/tasks/:id/archive` | Archive task |
| `POST` | `/api/tasks/:id/restore` | Restore from archive/trash |
| `POST` | `/api/tasks/bulk` | Bulk operations |

### 4.2 Categories API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/categories` | List user categories |
| `POST` | `/api/categories` | Create category |
| `PUT` | `/api/categories/:id` | Update category |
| `DELETE` | `/api/categories/:id` | Delete category |

### 4.3 User API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/profile` | Get profile |
| `PUT` | `/api/user/profile` | Update profile |
| `PUT` | `/api/user/preferences` | Update preferences |
| `PUT` | `/api/user/password` | Change password |
| `POST` | `/api/user/avatar` | Upload profile picture |
| `GET` | `/api/user/activity` | Get activity log |
| `DELETE` | `/api/user/account` | Delete account |

---

## 5. NEXT.JS + SUPABASE + CLERK IMPLEMENTATION BLUEPRINT

### 5.1 Project Structure
```
/app
├── (auth)
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── forgot-password/page.tsx
├── (dashboard)
│   ├── layout.tsx                    # Authenticated layout with sidebar
│   ├── page.tsx                      # Dashboard
│   ├── tasks/page.tsx                # All Tasks
│   ├── kanban/page.tsx               # Kanban Board
│   ├── calendar/page.tsx             # Calendar View
│   ├── categories/page.tsx           # Categories
│   ├── archive/page.tsx              # Archive
│   ├── trash/page.tsx                # Trash
│   └── profile/page.tsx              # Profile
├── api
│   ├── tasks/route.ts                # Tasks CRUD
│   ├── tasks/[id]/route.ts
│   ├── categories/route.ts
│   ├── categories/[id]/route.ts
│   ├── user/
│   │   ├── profile/route.ts
│   │   ├── preferences/route.ts
│   │   └── activity/route.ts
│   └── webhooks/
│       └── clerk/route.ts            # Clerk webhook handler
├── layout.tsx                        # Root layout
├── page.tsx                          # Landing page
├── privacy/page.tsx
└── terms/page.tsx

/components
├── layout/
│   ├── AppShell.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── dashboard/
│   ├── StatsCards.tsx
│   ├── ProgressBar.tsx
│   ├── QuickAddTask.tsx
│   ├── RecentTasks.tsx
│   ├── UpcomingDeadlines.tsx
│   └── QuickActions.tsx
├── tasks/
│   ├── TaskList.tsx
│   ├── TaskGrid.tsx
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── TaskFilters.tsx
│   ├── BulkActions.tsx
│   └── TaskModal.tsx
├── kanban/
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   └── KanbanCard.tsx
├── calendar/
│   ├── CalendarView.tsx
│   ├── MonthView.tsx
│   ├── WeekView.tsx
│   └── DayView.tsx
├── categories/
│   ├── CategoryList.tsx
│   ├── CategoryCard.tsx
│   └── CategoryForm.tsx
├── profile/
│   ├── ProfileCard.tsx
│   ├── PersonalInfoForm.tsx
│   ├── SecuritySettings.tsx
│   ├── PreferencesForm.tsx
│   └── ActivityLog.tsx
└── ui/                               # Shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── form.tsx
    ├── input.tsx
    ├── select.tsx
    ├── badge.tsx
    ├── progress.tsx
    ├── tabs.tsx
    ├── toast.tsx
    └── ...

/lib
├── supabase/
│   ├── client.ts                     # Browser client
│   ├── server.ts                     # Server client
│   └── admin.ts                      # Admin client
├── clerk/
│   └── config.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
└── hooks/
    ├── useTasks.ts
    ├── useCategories.ts
    ├── usePreferences.ts
    └── useActivityLog.ts

/types
├── database.types.ts                 # Supabase generated types
├── task.ts
├── category.ts
├── user.ts
└── api.ts
5.2 Supabase Database Schema
sql-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced from Clerk)
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,                -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  about TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  profile_picture_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
CREATE TABLE public.user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  default_view TEXT DEFAULT 'dashboard',
  default_sort TEXT DEFAULT 'due_date',
  tasks_per_page INTEGER DEFAULT 20,
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  time_format TEXT DEFAULT '12h',
  email_notifications BOOLEAN DEFAULT TRUE,
  daily_digest BOOLEAN DEFAULT FALSE,
  digest_time TIME DEFAULT '09:00',
  due_date_reminders BOOLEAN DEFAULT TRUE,
  reminder_before TEXT DEFAULT '24h',
  auto_archive_completed BOOLEAN DEFAULT FALSE,
  archive_after_days INTEGER DEFAULT 14,
  default_task_priority TEXT DEFAULT 'medium',
  default_task_status TEXT DEFAULT 'pending',
  week_starts_on TEXT DEFAULT 'monday',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ                -- Soft delete
);

-- Task-Category junction table
CREATE TABLE public.task_categories (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, category_id)
);

-- Activity log
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_deleted_at ON public.tasks(deleted_at);
CREATE INDEX idx_tasks_archived_at ON public.tasks(archived_at);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (user can only access their own data)
CREATE POLICY "Users can view own profile" ON public.users
  FOR ALL USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage own tasks" ON public.tasks
  FOR ALL USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can manage own categories" ON public.categories
  FOR ALL USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can view own activity" ON public.activity_logs
  FOR SELECT USING (auth.uid()::TEXT = user_id);

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
5.3 Clerk Integration
typescript// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password',
  '/privacy',
  '/terms',
  '/api/webhooks/clerk',
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
typescript// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Error verifying webhook', { status: 400 });
  }

  const supabase = createClient();
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    await supabase.from('users').insert({
      id,
      email: email_addresses[0]?.email_address,
      first_name,
      last_name,
      profile_picture_url: image_url,
      email_verified: email_addresses[0]?.verification?.status === 'verified',
    });

    await supabase.from('user_preferences').insert({
      user_id: id,
    });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    await supabase.from('users').update({
      email: email_addresses[0]?.email_address,
      first_name,
      last_name,
      profile_picture_url: image_url,
      email_verified: email_addresses[0]?.verification?.status === 'verified',
    }).eq('id', id);
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    await supabase.from('users').delete().eq('id', id);
  }

  return new Response('', { status: 200 });
}
5.4 Task API Implementation
typescript// app/api/tasks/route.ts
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const searchParams = request.nextUrl.searchParams;
  
  // Build query with filters
  let query = supabase
    .from('tasks')
    .select(`
      *,
      categories:task_categories(
        category:categories(*)
      )
    `)
    .eq('user_id', userId)
    .is('deleted_at', null);

  // Apply filters
  const status = searchParams.getAll('status');
  if (status.length > 0) {
    query = query.in('status', status);
  }

  const priority = searchParams.getAll('priority');
  if (priority.length > 0) {
    query = query.in('priority', priority);
  }

  const archived = searchParams.get('archived');
  if (archived === 'true') {
    query = query.not('archived_at', 'is', null);
  } else {
    query = query.is('archived_at', null);
  }

  // Sorting
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const sortDir = searchParams.get('sort_dir') || 'desc';
  query = query.order(sortBy, { ascending: sortDir === 'asc' });

  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    tasks: data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const body = await request.json();

  const { title, description, status, priority, due_date, category_ids } = body;

  // Validate
  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  // Create task
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: title.trim(),
      description: description?.trim() || null,
      status: status || 'pending',
      priority: priority || 'medium',
      due_date: due_date || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add categories if provided
  if (category_ids && category_ids.length > 0) {
    await supabase.from('task_categories').insert(
      category_ids.map((categoryId: string) => ({
        task_id: task.id,
        category_id: categoryId,
      }))
    );
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action_type: 'task_create',
    description: `Created task: ${title}`,
    metadata: { task_id: task.id },
  });

  return NextResponse.json({ task }, { status: 201 });
}
5.5 Custom Hooks
typescript// lib/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/types/task';

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) {
        filters.status.forEach(s => params.append('status', s));
      }
      if (filters?.priority) {
        filters.priority.forEach(p => params.append('priority', p));
      }
      if (filters?.sortBy) params.set('sort_by', filters.sortBy);
      if (filters?.sortDir) params.set('sort_dir', filters.sortDir);
      if (filters?.page) params.set('page', String(filters.page));
      if (filters?.limit) params.set('limit', String(filters.limit));
      
      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to create task');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTaskInput & { id: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error
	  
	  
###########################################################################################################

# ACTUAL TECH-STACK 


Analyze the TodoTracker dashboard - Inspect the tech stack, components, API calls, and UI structure
TodoTracker Dashboard - Full Infrastructure Report

SEGMENT 1: COMPLETE TECH STACK IDENTIFICATION
Frontend Technologies
JavaScript Frameworks & Libraries:

HTMX 2.0.0 (unpkg.com/htmx.org@2.0.0) - Primary framework for dynamic DOM manipulation and AJAX interactions
Alpine.js 3.13.3 - Lightweight reactive framework for component state management
jQuery 3.7.1 - DOM manipulation and AJAX helper functions
Bootstrap 5.3.2 - CSS framework and component library
Bootstrap Icons 1.11.1 - Icon library integration

Custom Application Layer:

theme.js - Theme switching and dark mode functionality
app.js - Main application logic, API handlers, and utility functions
custom.css - Custom styling overrides and component theming

Backend Technologies (Inferred from API calls)
Server-Side:

PHP (evident from .php file extensions)
REST API Architecture via:

/api/tasks/create.php - Task creation endpoint
/api/tasks/update.php - Task update endpoint
/api/tasks/delete.php - Task deletion endpoint
/api/tasks/get.php - Task retrieval endpoint
/api/tasks/update-status.php - Status change endpoint



Database & Sessions:

PHP session management (CSRF token validation visible in code)
Likely relational database (MySQL/PostgreSQL) based on task data structure

Authentication:

PHP session-based authentication
Login flow via /auth/login.php
Logout via /auth/logout.php
Profile management via /profile.php


SEGMENT 2: APPLICATION ARCHITECTURE
Pages/Routes Identified:

Dashboard (/dashboard.php) - Main overview with stats and quick actions
All Tasks (/tasks.php) - Comprehensive task list with filtering, sorting, search
Kanban Board (/kanban.php) - Drag-and-drop task management (Pending → In Progress → Completed)
Calendar (/calendar.php) - Task scheduling and visualization
Categories (/categories.php) - Task organization and categorization
Archive (/archive.php) - Archived tasks management
Trash (/trash.php) - Deleted tasks recovery
Profile (/profile.php) - User account settings and preferences
Authentication (/auth/login.php, /auth/logout.php)

Core Features Identified:
Task Management:

Create tasks (quick add with defaults OR detailed form)
Edit existing tasks
Delete tasks with confirmation
Mark tasks as complete
Task status tracking (Pending → In Progress → Completed)
Priority levels (Low, Medium, High)
Due date assignment
Description with 5000 character limit
Category/tag assignment

Dashboard Widgets:

Total tasks counter
Pending tasks counter
In progress counter
Completed tasks counter
Overall progress bar
Recent tasks list
Upcoming deadlines widget
Quick actions panel

UI/UX Components:

Responsive sidebar navigation
Toast notifications for feedback
Bootstrap modals for forms
Drag-and-drop Kanban columns
Calendar month/week/day views
Advanced filtering system
Search functionality
Dark theme (theme.js)

Data Structure (Inferred):
Tasks Table:
- id (PK)
- user_id (FK)
- title (VARCHAR 255)
- description (TEXT, max 5000 chars)
- status (ENUM: pending, in_progress, completed)
- priority (ENUM: low, medium, high)
- due_date (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

Categories Table:
- id (PK)
- user_id (FK)
- name (VARCHAR)
- color (VARCHAR/INT)
- created_at (TIMESTAMP)

Task_Categories (Junction):
- task_id (FK)
- category_id (FK)

Users Table:
- id (PK)
- first_name
- last_name
- email (UNIQUE)
- password (hashed)
- phone (OPTIONAL)
- location (OPTIONAL)
- timezone
- verified (BOOLEAN)
- created_at (TIMESTAMP)

SEGMENT 3: DETAILED TECH STACK BREAKDOWN
ComponentTechnologyVersionPurposeFrontend FrameworkHTMX2.0.0Dynamic AJAX DOM updatesReactive BindingAlpine.js3.13.3Component state & reactivityCSS FrameworkBootstrap5.3.2UI components & gridIconsBootstrap Icons1.11.1SVG icon libraryDOM UtilitiesjQuery3.7.1jQuery DOM helpersBackendPHP7.4+ (likely 8.x)Server-side logicArchitectureREST APICustomAPI endpointsDatabaseMySQL/PostgreSQL-Data persistenceAuthenticationPHP Sessions-User managementStylingCSS3 + Custom-Theming & customizationIconsSVG + Fonts-UI icons

SEGMENT 4: DEPLOYMENT & QUALITY ASPECTS
Security Features Detected:

CSRF token validation (csrf_token in forms)
Server-side session management
Password hashing (implied by auth flow)
Input validation in JavaScript (title length, etc.)
XSS protection via proper HTML escaping

Performance Features:

Minified external libraries (Bootstrap, jQuery)
CDN-hosted dependencies (jsDelivr, unpkg)
Lazy loading capability (via HTMX)
Efficient DOM updates (HTMX partial replacements)

Code Quality:

Clear separation of concerns (API endpoints)
Modular JavaScript (multiple inline scripts with specific purposes)
Console error handling and logging
Responsive design patterns


QUICK WIN COMPONENTS (In Priority Order)
Phase 1: Core Foundation (Week 1-2)

✅ Database Schema - Tasks, Users, Categories tables
✅ Authentication - Login/logout, session management
✅ Dashboard page - Stats widgets, quick add form
✅ Basic task CRUD - Create, read, update, delete operations
✅ API endpoints - RESTful endpoints for task operations

Phase 2: Enhanced Features (Week 3-4)

Task filtering & search - Status, priority, date filtering
All Tasks view - Table layout with sorting
Kanban Board - Drag-and-drop status updates
Calendar view - Visual task scheduling
Categories - Create, assign, manage tags

Phase 3: Advanced Features (Week 5+)

Archive & Trash - Soft deletes and recovery
User profile - Account settings, timezone, preferences
Notifications - Toast feedback system
Advanced filtering - Complex query builders
Export functionality - CSV/PDF exports


RECOMMENDED RECREATION TECH STACK
For Enterprise-Grade Local Development:
Frontend:
├─ HTMX 2.0.0 (dynamic interactions)
├─ Alpine.js 3.13.3 (reactive components)
├─ Bootstrap 5.3.2 (UI framework)
└─ Custom CSS + Tailwind (optional, modern alternative)

Backend:
├─ PHP 8.2+ (or Laravel 11 for enterprise)
├─ MySQL 8.0 or PostgreSQL 15+
└─ REST API architecture

Database:
├─ MySQL 8.0+ / PostgreSQL 15+
├─ Migration system (Flyway/Liquibase)
└─ Backup automation

Development:
├─ Docker containers (PHP, MySQL, Nginx)
├─ Docker Compose for orchestration
├─ Git version control
└─ Local development environment

Security:
├─ HTTPS/TLS
├─ CSRF protection
├─ Input validation & sanitization
├─ Password hashing (bcrypt/Argon2)
├─ SQL injection prevention (prepared statements)
└─ XSS protection

IMPLEMENTATION ROADMAP
Environment Setup (Segment 1)
bash# Docker Compose structure
docker-compose.yml
├─ PHP 8.2-FPM service
├─ MySQL 8.0 service
├─ Nginx web server
├─ PhpMyAdmin (development only)
└─ Redis cache (optional)

Project Structure:
/TodoTracker
├─ /public          (web root - index.php)
├─ /src             (application code)
│  ├─ /api          (REST endpoints)
│  ├─ /auth         (authentication)
│  ├─ /controllers  (business logic)
│  └─ /models       (database classes)
├─ /database        (migrations, seeds)
├─ /assets          (CSS, JS)
│  ├─ /css
│  ├─ /js
│  └─ /fonts
├─ /config          (configuration files)
└─ /templates       (HTML templates/pages)

NEXT STEPS FOR YOU
Immediate Actions (Next Session):

Set Up Local Development Environment

Install Docker & Docker Compose
Create docker-compose.yml with PHP, MySQL, Nginx
Initialize Git repository


Database Design

Create migration files for tables
Set up database seeding for test data
Implement relationship constraints


Backend Structure

Create API endpoint skeleton for all CRUD operations
Set up routing system
Implement authentication middleware


Frontend Template Setup

Convert dashboard HTML to template system (Twig/Blade)
Set up asset pipeline
Implement theme system




VALIDATION CHECKLIST
✅ Tech Stack Identified:

Frontend: HTMX, Alpine.js, Bootstrap 5, jQuery, Custom JS/CSS
Backend: PHP, REST APIs, Session-based auth
Database: Relational (MySQL/PostgreSQL structure)
Features: CRUD, Dashboard, Kanban, Calendar, Categories

✅ Architecture Documented:

9 main pages/routes identified
Complete data model reverse-engineered
API endpoints mapped
Component hierarchy understood

✅ Security Elements:

CSRF protection confirmed
Session management in place
Input validation patterns observed
Password hashing implied

✅ Ready for Recreation:

All dependencies identified
Clear component breakdown
Progressive feature roadmap
Quality standards defined



