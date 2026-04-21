# Paystack go-live — Realaist codebase

This doc matches **how this repo** wires Paystack: two **charge** flows (separate DB tables), **one** Paystack Dashboard **webhook URL** that handles both **`charge.*`** and **`transfer.*`**, plus transfer **approval** (separate URL) for host M-Pesa withdrawals.

**Paystack docs (single webhook):** In `docs/paystack/webhooks.md`, all supported events—including **`transfer.success`**, **`transfer.failed`**, **`transfer.reversed`**—are delivered to the same webhook URL you configure. `docs/paystack/transfers/paystackSIngleTransfer.md` states transfers are sent as a POST to **your webhook URL** (the same one set on the Dashboard). So you should **not** rely on a second webhook URL for transfers unless you choose to for your own routing.

**Supabase project ref:** `zviqhszbluqturpeoiuk`  
**Functions base:** `https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/`

---

## How money flows in this app

### A. Campaign ads (developers)

1. Frontend uses `campaignsConfig.payment` in `src/config/campaigns.ts`: Paystack **public** key + paths `initialize-payment` / `verify-payment` / `paystack-webhook`.
2. **`initialize-payment`** (Edge): requires **logged-in user** JWT; creates Paystack charge; `callback_url` = `{SITE_URL}/campaigns/payment/callback?campaign_id=…` (see `supabase/functions/initialize-payment/index.ts`).
3. **`verify-payment`**: confirms transaction server-side for the campaign flow.
4. **`paystack-webhook`** on `charge.success` / `charge.failed`: looks up **`booking_payments`** by reference **first** (short-stay `bk_…` refs). If no match, it handles **`payments`** + **`campaigns`** (campaign flow). The same function also handles **`transfer.success`**, **`transfer.failed`**, and **`transfer.reversed`** for **`host_transfers`**.

So campaign charges use the **`payments`** table; they must **not** reuse `bk_` references (those are short-stay only).

### B. Short-stay bookings (guests, optional login)

1. Frontend uses `bookingAndPayoutEndpoints` in `src/config/payments.ts` → **`initialize-booking-payment`** / **`verify-booking-payment`**.
2. **`initialize-booking-payment`**: **JWT optional** (guest checkout); **anon `apikey` required**; only **`property_type === "short stay"`** and **active** listings; creates **`booking_payments`**; Paystack reference prefix **`bk_`**; `callback_url` = `{SITE_URL}/short-stays` when `SITE_URL` is set.
3. After Paystack checkout, the UI calls **`verify-booking-payment`** with `reference`, `booking_payment_id`, and `email` (see `src/services/bookingPaymentService.ts`).
4. **`paystack-webhook`** still updates **`booking_payments`** when Paystack sends `charge.*` (and can confirm rows if the UI already verified).

Platform fee on gross: Edge reads **`BOOKING_PLATFORM_FEE_RATE`** (`0`–`1`); host net is stored on **`booking_payments.host_net_minor`**.

### C. Host / developer wallet (M-Pesa withdrawals)

1. **Wallet** page (`src/pages/WalletPage.tsx`) + **`hostPayoutService.ts`**: user saves M-Pesa number → **`saveMpesaNumberAndSyncPaystackRecipient`** upserts **`host_payment_profiles`** then calls **`sync-host-paystack-recipient`** (JWT).
2. **`sync-host-paystack-recipient`**: Paystack **`transferrecipient`**, type **`mobile_money`**, Kenya individual M-Pesa code (default **`MPESA`**; override via **`PAYSTACK_KES_MOBILE_MONEY_BANK_CODE`** or frontend `VITE_PAYSTACK_KES_MOBILE_MONEY_BANK_CODE`).
3. **Withdraw** calls **`initiate-host-transfer`** (JWT): inserts **`host_transfers`**, Paystack **`transfer`** with **`source: balance`**, reference **UUID v4**.
4. If Paystack **transfer approval** is enabled, they **`POST`** to **`paystack-transfer-approval`**, which checks **`host_transfers`** (reference + amount + status) and returns **200** to allow the debit.
5. Outcome events are POSTed by Paystack to **the same webhook URL** as charges—configure **`paystack-webhook`**—which updates **`host_transfers`**. The **`paystack-transfer-webhook`** Edge Function is an optional duplicate for backwards compatibility; prefer **one** Dashboard URL only.

Balances in the UI: sum successful **`booking_payments.host_net_minor`** for the host minus in-flight **`host_transfers`** (same status set as the Edge transfer function).

---

## Paystack Dashboard: URLs to configure

### 1. Webhook (**Developers → Webhooks**) — **one URL**

Set **one** webhook URL on the Paystack Dashboard. Point it at:

`https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/paystack-webhook`

Subscribe to (at minimum) the events this app handles:

| Event group | Events |
|-------------|--------|
| Charges | `charge.success`, `charge.failed` |
| Transfers | `transfer.success`, `transfer.failed`, `transfer.reversed` |

**Optional:** `paystack-transfer-webhook` still exists and runs the same transfer logic if you already deployed a second URL, but Paystack’s model is **one** webhook per environment—use **`paystack-webhook`** only for new setups.

Use the **live** secret key context when configuring production webhooks.

### 2. Transfer approval (**Settings → Transfers**)

`https://zviqhszbluqturpeoiuk.supabase.co/functions/v1/paystack-transfer-approval`

Returns **200** only when the payload matches a pending **`host_transfers`** row (amount + reference). **400** rejects (Paystack should not debit).

---

## Edge function URLs (app / reference — not webhooks)

| Role | Path | Auth in our app |
|------|------|------------------|
| Campaign init | `…/initialize-payment` | User JWT (required by function) |
| Campaign verify | `…/verify-payment` | As implemented in `paymentService` |
| Short-stay init | `…/initialize-booking-payment` | Anon + optional JWT |
| Short-stay verify | `…/verify-booking-payment` | Anon `apikey` only |
| Sync M-Pesa recipient | `…/sync-host-paystack-recipient` | User JWT |
| Start withdrawal | `…/initiate-host-transfer` | User JWT |

---

## Supabase Edge secrets (match the functions above)

| Secret | Used for |
|--------|-----------|
| **`PAYSTACK_SECRET_KEY`** | All Paystack API calls from Edge + webhook handler presence checks |
| **`SITE_URL`** | **No trailing path slash issues**: campaign callback `{SITE_URL}/campaigns/payment/callback?…`, short-stay `{SITE_URL}/short-stays` |
| **`BOOKING_PLATFORM_FEE_RATE`** | Optional; short-stay gross → platform fee → `host_net_minor` |
| **`PAYSTACK_KES_MOBILE_MONEY_BANK_CODE`** | Optional; **`sync-host-paystack-recipient`** fallback when profile has no provider code |
| **`HOST_PAYOUT_CURRENCY`** | Optional; default **KES** in sync function |

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are normally auto-injected on hosted Supabase.

---

## Frontend (Vite)

| Variable | Purpose |
|----------|---------|
| **`VITE_SUPABASE_URL`** | `https://zviqhszbluqturpeoiuk.supabase.co` |
| **`VITE_SUPABASE_ANON_KEY`** | Project anon key |
| **`VITE_PAYSTACK_PUBLIC_KEY`** | Inline Paystack (campaigns + short-stays) |
| **`VITE_PAYSTACK_KES_MOBILE_MONEY_BANK_CODE`** | Optional Wallet override for M-Pesa provider code (else **`MPESA`** in `src/config/paystackKenya.ts`) |
| **`VITE_APP_URL`** | App origin (OAuth, links); align with production domain |

See also **`.env.example`** in the repo root.

---

## `supabase/config.toml` (this repo)

These functions are deployed with **`verify_jwt = false`** so Paystack and guest checkout can call them without a Supabase user JWT:

- `initialize-booking-payment`, `verify-booking-payment`
- `paystack-webhook`, `paystack-transfer-approval`, `paystack-transfer-webhook`

**`sync-host-paystack-recipient`** and **`initiate-host-transfer`** rely on the **default** (`verify_jwt = true`): the client must send **`Authorization: Bearer <user access_token>`** plus **`apikey`**.

---

## Paystack account

- **Transfers** enabled; balance for payouts.
- Kenya **M-Pesa** individual: **`MPESA`** bank code per Paystack transfer-recipient docs (this app’s default).

---

## Smoke-test order (matches our flows)

1. **Campaign**: live small payment → `payments` / `campaigns` updated via webhook or verify path.  
2. **Short-stay**: live payment on a **short stay** property → `booking_payments` updated; guest return URL under **`SITE_URL/short-stays`**.  
3. **Wallet**: save M-Pesa → recipient on Paystack → small withdrawal → approval URL (if enabled) → **`host_transfers`** final status via the **same** `paystack-webhook` URL (`transfer.*` events).

---

*New Supabase project: replace `zviqhszbluqturpeoiuk` in every URL above.*
