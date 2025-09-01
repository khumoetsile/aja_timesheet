# AJA Law Firm Timesheet System

A professional timesheet management system designed for law firms, featuring role-based access control, comprehensive reporting, and a modern, trustworthy interface.

## Design System

### Brand Palette

The system uses a refined color palette derived from the AJA Law Firm branding:

#### Anchor Colors
- **Charcoal** (`#101820`) - Primary text, toolbar, dark surfaces
- **Navy** (`#162037`) - Sidebar background, secondary surfaces
- **Crimson** (`#C83131`) - Primary actions, highlights, active states
- **Slate** (`#44505E`) - Secondary actions, dividers, muted elements
- **White** (`#FFFFFF`) - Card backgrounds, content surfaces
- **Light Grey** (`#F4F6F8`) - Page background, surface-2

#### Supporting Colors
- **Charcoal Light** (`#1a2332`) - Hover states, secondary dark surfaces
- **Slate Light** (`#5a6b7a`) - Secondary hover states
- **Grey** (`#718096`) - Body text, secondary information
- **Grey Light** (`#a0aec0`) - Disabled states, tertiary text
- **Grey Lighter** (`#cbd5e0`) - Borders, dividers

### Typography

- **Font Family**: Inter (primary), Roboto (fallback)
- **Font Weights**: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Line Height**: 1.5 for body text, tightened for tables and cards

### Spacing System

8-point spacing system using CSS custom properties:
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-2xl`: 48px
- `--spacing-3xl`: 64px

### Utility Classes

#### Spacing Utilities
```css
.mt-8, .mb-8, .ml-8, .mr-8, .p-8, .px-8, .py-8
.mt-16, .mb-16, .ml-16, .mr-16, .p-16, .px-16, .py-16
.mt-24, .mb-24, .ml-24, .mr-24, .p-24, .px-24, .py-24
.mt-32, .mb-32, .ml-32, .mr-32, .p-32, .px-32, .py-32
.mt-48, .mb-48, .ml-48, .mr-48, .p-48, .px-48, .py-48
```

#### Grid System
```css
.grid { display: grid; gap: var(--spacing-md); }
.grid-1 { grid-template-columns: 1fr; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
```

### Component Guidelines

#### KPI Cards
- Horizontal layout with icon + metric + label
- 48px circular icon background
- 32px metric font size, bold weight
- 12px label font size, medium weight
- Responsive grid: 3 columns ≥1440px, 2 columns ≥960px, 1 column ≤959px

#### Tables
- Sticky headers with surface-2 background
- 40px row height
- Alternating row shading (#FCFCFD)
- Hover highlight (#EEF7FF)
- Uppercase header text, semibold weight

#### Forms
- Clean grid layout
- Single column on mobile, two on tablet, three on desktop
- Group related fields with subtle dividers
- Primary buttons in crimson, secondary in slate

#### Navigation
- 240px expanded width, 72px collapsed
- Active link: 4px crimson bar + bold label
- Collapsible on ≤1024px screens

#### Buttons
- Primary: Crimson filled with shadow
- Secondary: Slate border with transparent background
- Danger: Crimson outline
- Consistent 8px padding, medium font weight

### Accessibility

- 4.5:1 contrast ratio on all text
- Clear focus outlines with crimson color
- Uniform icon style (Material Design)
- Tooltips on icon-only buttons
- Keyboard navigation support

### Responsive Design

#### Mobile (≤768px)
- Single column layouts
- Collapsed sidebar (72px width)
- Stacked filter components
- Horizontal scroll for KPI cards

#### Tablet (769px - 1024px)
- Two-column KPI grids
- Expanded sidebar (240px width)
- Responsive form layouts

#### Desktop (≥1025px)
- Three-column KPI grids
- Full sidebar functionality
- Multi-column form layouts

## Development

### Prerequisites
- Node.js (v16 or higher)
- Angular CLI
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the database (see backend/README.md)
4. Start the development server: `npm start`

### Design Token Usage

When creating new components, use the CSS custom properties:

```scss
.my-component {
  background: var(--aja-surface-1);
  color: var(--aja-charcoal);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-weight: var(--font-weight-semibold);
}
```

### Adding New Components

1. Follow the established spacing patterns
2. Use the brand palette consistently
3. Implement responsive behavior
4. Ensure accessibility compliance
5. Test across different screen sizes

## Features

- **Role-based Access Control**: ADMIN, SUPERVISOR, STAFF roles
- **Timesheet Management**: Create, edit, delete entries with 15-minute intervals
- **Reporting & Analytics**: Comprehensive dashboards with metrics and charts
- **User Management**: Admin can manage supervisors and staff
- **Department Filtering**: Supervisors see only their department data
- **Professional UI**: Clean, trustworthy design suitable for law firms

## Architecture

- **Frontend**: Angular 17 with standalone components
- **Backend**: Node.js + Express + MySQL
- **Authentication**: JWT tokens
- **Styling**: SCSS with CSS custom properties
- **UI Framework**: Angular Material with custom theme

## License

Proprietary - AJA Law Firm 