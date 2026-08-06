# Mock Data Layer Setup

## Overview

The app now has a complete **localStorage-based mock data layer** that replaces Supabase for testing. This allows full testing of all features without a real Supabase connection.

## How It Works

- **`src/lib/mockData.ts`** — Contains 6 sample persons across 3 referral levels + mock payments and users
- **`src/lib/mockDb.ts`** — Query builder that mimics Supabase API but uses localStorage
- **`src/lib/supabaseClient.ts`** — Toggle between real Supabase and mock via `USE_MOCK` flag

## Switching Between Real & Mock

In `src/lib/supabaseClient.ts`, set the `USE_MOCK` flag:

```typescript
const USE_MOCK = true;  // Use mock (localStorage)
const USE_MOCK = false; // Use real Supabase
```

## Demo Credentials

### Admin Login
- Email: `admin@test.com`
- Password: `admin123`

### Member Login Examples
Use any of these names + their phone number as password:

| Name | Phone | Level | Plots |
|------|-------|-------|-------|
| Rajesh Kumar | 9876543210 | 1 | 5 |
| Priya Sharma | 9876543211 | 2 | 3 |
| Amit Patel | 9876543212 | 2 | 2 |
| Neha Singh | 9876543213 | 3 | 4 |
| Vikram Das | 9876543214 | 3 | 1 |
| Anjali Verma | 9876543215 | 3 | 3 |

## Mock Data Persistence

All data changes are persisted to browser localStorage under these keys:
- `mock_persons` — All members
- `mock_payments` — All payment records
- `mock_users` — All user accounts
- `mock_session` — Current login session

**Data persists across page refreshes** until you clear browser data.

## Test Scenarios

### ✓ Admin Features
1. Login with admin credentials
2. Navigate to Members → see 6 persons grouped by level
3. Click a person card to expand → view details
4. Edit inline (name, phone, plots, booking date, referrer)
5. View Payment History → see month grid with paid/unpaid status
6. Change year selector in payment history
7. Edit payment amounts and mark as paid/unpaid
8. Delete a member (fails if they have referrals)
9. Add a new member → searches existing as referrer
10. Tree View → see hierarchical tree (compact version)
11. Neighbors View → search members and view parent/child relationships
12. Search & Filter → filter by name, phone, payment status, level
13. Settings → change password, sign out

### ✓ User Features
1. Login with member name + phone password
2. View own profile (read-only)
3. Payment History → see only own payments
4. Change password → updates localStorage
5. Sign out

### ✓ Data Integrity
- Delete member → warns if they have referrals
- Update payment → immediately reflects in grid
- Add person → auto-creates Supabase auth user (mocked)
- Month grid → auto-disables months before booking date

## Known Limitations (Mock vs Real)

| Feature | Mock | Real |
|---------|------|------|
| Razorpay payments | Mocked (UI only) | Full integration |
| Edge functions | Stubbed | Working |
| RLS enforcement | Not enforced | Enforced |
| Real-time subscriptions | Not supported | Supported |
| Scalability | Limited to localStorage (~10MB) | Unlimited |

## Clear Mock Data

To reset all mock data to defaults:

```javascript
localStorage.removeItem('mock_persons');
localStorage.removeItem('mock_payments');
localStorage.removeItem('mock_users');
localStorage.removeItem('mock_session');
// Then refresh page
```

Or just clear all site data in browser settings.

## Switching to Real Supabase

1. Change `USE_MOCK = false` in `src/lib/supabaseClient.ts`
2. Ensure `.env` has real Supabase credentials
3. Run `npm run build`
4. Deploy normally

The UI/UX remains identical — only the data layer changes!

## File Locations

```
src/lib/
├── mockData.ts          # Sample data (6 persons, payments, users)
├── mockDb.ts            # Query builder mimicking Supabase
├── supabaseClient.ts    # Toggle USE_MOCK flag here
└── supabase.ts          # Re-exports from supabaseClient
```

All other files remain unchanged and work seamlessly with both mock and real data.
