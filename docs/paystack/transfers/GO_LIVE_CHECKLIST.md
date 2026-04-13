# Paystack: go live with transfers & short-stay payouts

Short checklist to wire Paystack to this project’s Supabase Edge Functions. Replace `YOUR_PROJECT_REF` with your Supabase project reference (the subdomain before `.supabase.co`).

**Base URL**

`https://YOUR_PROJECT_REF.supabase.co/functions/v1/`

---

## 1. Webhooks (Dashboard → **Developers** → **Webhooks**)

You can use one webhook URL per event group or split URLs if Paystack allows multiple endpoints.

| Purpose | URL | Typical events |
|--------|-----|----------------|
| **Charges** (guest checkout: campaigns + short-stay bookings) | `{BASE}paystack-webhook` | `charge.success`, `charge.failed` (add any charge events you rely on) |
| **Transfers** (host M-Pesa withdrawals) | `{BASE}paystack-transfer-webhook` | `transfer.success`, `transfer.failed`, `transfer.reversed` |

**Example**

- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/paystack-webhook`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/paystack-transfer-webhook`

Use your **live** secret key context when configuring production webhooks. After saving, use Paystack’s “Send test event” where available to confirm `200` responses.

---

## 2. Transfer approval URL (Dashboard → **Settings** → **Transfers**)

If you use Paystack’s **transfer approval** flow (recommended before debiting your platform balance), set the approval callback to:

`https://YOUR_PROJECT_REF.supabase.co/functions/v1/paystack-transfer-approval`

This endpoint validates the transfer `reference` and `amount` against your `host_transfers` table and returns **200** only when the request is allowed.

---

## 3. Secrets (Supabase, not Paystack)

In **Supabase → Project Settings → Edge Functions → Secrets** (or `supabase secrets set`), ensure at least:

| Secret | Role |
|--------|------|
| `PAYSTACK_SECRET_KEY` | Live secret key for API calls and webhook verification context |
| `SITE_URL` | Public site origin (e.g. `https://yourdomain.com`) for Paystack `callback_url` on short-stay init |
| `BOOKING_PLATFORM_FEE_RATE` | Optional; decimal `0`–`1` (e.g. `0.1` = 10% platform fee on booking gross) |
| `PAYSTACK_KES_MOBILE_MONEY_BANK_CODE` | Optional; defaults to individual M-Pesa (`MPESA`) if unset—must match Paystack’s KES `mobile_money` list if you override |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are usually provided automatically to functions.

---

## 4. Frontend / env

- **`VITE_PAYSTACK_PUBLIC_KEY`**: live **public** key in your production `.env` / host dashboard.
- **`VITE_SUPABASE_URL`** / **`VITE_SUPABASE_ANON_KEY`**: production values so the app can call the same functions.

---

## 5. Paystack account prerequisites

- **Transfers** enabled on your Paystack business (KYC / compliance as required).
- Sufficient **balance** or funding source for outbound transfers.
- For **Kenya M-Pesa** recipients: use recipient type `mobile_money` with the correct `bank_code` (individual M-Pesa is documented as **`MPESA`** in Paystack’s transfer recipient docs).

---

## 6. Quick verification order

1. Deploy Edge Functions and set secrets.  
2. Register webhook URLs and transfer approval URL (live environment).  
3. Place a small **live** test charge and confirm `paystack-webhook` updates `booking_payments` or `payments` as expected.  
4. Register a host M-Pesa number in **Wallet**, run a small **live** transfer, confirm approval (if enabled) and `paystack-transfer-webhook` updates `host_transfers`.

---

## Reference: function JWT settings

These are invoked without Supabase JWT verification where webhooks/public init apply; authenticated calls use the user’s session. Your deployed config should match:

- `paystack-webhook`, `paystack-transfer-webhook`, `paystack-transfer-approval`, `initialize-booking-payment`, `verify-booking-payment`: typically **`verify_jwt = false`** (custom/auth via Paystack signature or body checks where implemented).
- `sync-host-paystack-recipient`, `initiate-host-transfer`: **`verify_jwt = true`** (user Bearer token).

Adjust only if you have changed `config.toml` or redeployed with different flags.
