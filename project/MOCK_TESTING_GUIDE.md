# Mock Data Layer - Testing Guide

## What's Been Done

I've successfully created a complete **localStorage-based mock database** that replaces Supabase for testing. All UI logic remains unchanged — only the data layer is swapped.

### Files Created

1. **`src/lib/mockData.ts`** (200 lines)
   - 6 sample persons across 3 levels with proper referral hierarchy
   - Each person has realistic data: name, phone, plots, booking date, level
   - 12+ mock payment records (mixed paid/unpaid, various amounts)
   - 7 mock users (1 admin + 6 members)

2. **`src/lib/mockDb.ts`** (300+ lines)
   - QueryBuilder class that mimics Supabase API
   - Supports: `.select()`, `.eq()`, `.order()`, `.insert()`, `.update()`, `.delete()`, `.maybeSingle()`, `.single()`
   - Auth mock: handles admin + member login logic
   - localStorage persistence: data survives page refresh
   - Built-in 50-100ms async delays (simulates real network latency)

3. **`src/lib/supabaseClient.ts`** (NEW)
   - Single toggle point: `const USE_MOCK = true/false`
   - When true: uses mock data layer
   - When false: uses real Supabase
   - No UI changes needed when switching

### Modified Files

- **`src/lib/supabase.ts`** — Now re-exports from supabaseClient.ts
- **`src/context/AuthContext.tsx`** — Updated to handle mock auth (removed @supabase/supabase-js types)
- **`src/pages/LoginPage.tsx`** — Added demo credentials hint box

## Testing All Features

### Admin Login
```
Email: admin@test.com
Password: admin123
```

### Member Logins (name + phone = password)
```
Rajesh Kumar / 9876543210
Priya Sharma / 9876543211
Amit Patel / 9876543212
Neha Singh / 9876543213
Vikram Das / 9876543214
Anjali Verma / 9876543215
```

## What Works With Mock

✅ **Admin Panel**
- Login/logout
- View members grouped by level (1, 2, 3)
- Expandable member cards showing full details
- Inline editing (name, phone, plots, booking date, referrer)
- Edit payment history (month grid, year selector)
- Mark payments paid/unpaid with amounts
- Add new members (with auto referrer search)
- Delete members (with referral warning)
- Tree structure view (shows hierarchy)
- Neighbors view (search + view parent/child)
- Search & filter (by name, phone, status, level)
- Settings (password change, sign out)

✅ **User Dashboard**
- Member login with username + phone password
- View own profile (read-only)
- Payment history (own payments only)
- Month grid with disabled months (before booking date)
- Year selector for multi-year view
- Paid months show green with amounts
- Unpaid months show red
- "Pay Now" button on unpaid months (UI only, no real payment)
- Change password
- Sign out

✅ **Data Integrity**
- All changes persist to localStorage
- Page refresh retains data
- Referral tree structure maintained (level auto-calc)
- Can't delete member with referrals (warns user)
- Payment months auto-generated from booking date
- Month grid disables before booking date

## How to Use

### Run the app
```bash
npm run build
npm run preview
# Or in Bolt: just save and app runs automatically
```

### Test Admin Flow
1. Login with admin@test.com / admin123
2. Explore Members view → see 6 persons
3. Click cards to expand and edit
4. Try editing, adding, deleting
5. Check Tree/Neighbors/Search views
6. Open payment history for any member
7. Add/edit payments

### Test Member Flow
1. Login with any member name + their phone
2. View your dashboard (read-only profile)
3. See your payment history
4. Try changing password
5. Sign out

### Reset Data
- Clear browser localStorage to reset all mock data
- Or use browser DevTools → Application → Storage → Clear All

## Switching to Real Supabase

When ready to use real Supabase:

1. **Open `src/lib/supabaseClient.ts`**
2. **Change line 3:**
   ```typescript
   const USE_MOCK = false;  // Switch to real Supabase
   ```
3. **Rebuild:**
   ```bash
   npm run build
   ```
4. **Deploy normally**

All UI components remain unchanged. The app will automatically use real Supabase queries.

## Current Data Structure

### 6 Persons (Mock Data)
```
Level 1:
└─ Rajesh Kumar (5 plots, referred 2 people)
   ├─ Level 2: Priya Sharma (3 plots, referred 2 people)
   │  ├─ Level 3: Neha Singh (4 plots)
   │  └─ Level 3: Vikram Das (1 plot)
   └─ Level 2: Amit Patel (2 plots, referred 1 person)
      └─ Level 3: Anjali Verma (3 plots)
```

### Payment Status
- **Paid This Month:** Rajesh, Priya, Amit, Neha
- **Unpaid This Month:** Vikram, Anjali

## Known Limitations

| Feature | Status |
|---------|--------|
| Auth (admin & user) | ✅ Full mock support |
| CRUD operations | ✅ Full mock support |
| Data persistence | ✅ Full localStorage |
| Referral hierarchy | ✅ Full mock support |
| Payment tracking | ✅ Full mock support |
| Search & filter | ✅ Full mock support |
| Razorpay webhook | ⚠️ UI only (no real payment) |
| Real-time updates | ❌ Not mocked |
| RLS enforcement | ❌ Not enforced in mock |
| Scale (>10MB data) | ❌ localStorage limit |

## Build Status

✅ **Project builds successfully with zero errors**

```
✓ 1492 modules transformed
✓ built in 4.47s
```

Ready to test!
