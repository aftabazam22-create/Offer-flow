# Security Specification — Offer Flow Firestore

## 1. Data Invariants
1. **Admin Authority**: Only the designated admin UID (`3rppqbDG87TaqoUlvie02hMxpJn1`), verified bootstrap email (`aftab.azam22@gmail.com` with `email_verified == true`), or a document in `/admins/{uid}` may mutate catalog collections (`products`, `categories`, `banners`, `advertisements`, `blogs`, `coupons`, `site_config`), update order statuses, or read PII collections (`orders`, `customers`).
2. **Order & Tracking Atomicity**: Every order created in `/orders/{orderId}` MUST atomically create its non-PII status summary in `/order_tracking/{orderNumber}` in the same write batch (`existsAfter`).
3. **Order Initial State**: New orders created by customers MUST start with `status == 'pending'`. Customers cannot create an already-`confirmed` or `delivered` order.
4. **PII Isolation**: `/orders` and `/users/{uid}` contain personal info (`customerName`, `phone`, `email`, `address`) and are strictly readable only by admins or the authenticated owner (`userId == request.auth.uid` / `uid == request.auth.uid`). `/users/{uid}` writes require `email_verified == true` and disallow privilege fields. `/order_tracking/{orderNumber}` stores zero PII and disallows `list` queries so callers must know the exact `orderNumber`.
5. **Temporal Integrity**: `createdAt` on create and `updatedAt` on create/update must equal `request.time`. `createdAt` is immutable on update.
6. **Review Relational Integrity**: A review in `/reviews/{reviewId}` must reference an existing product in `/products/{productId}` (`exists`).

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Product Creation**: `create /products/prod-evil` without admin auth -> `PERMISSION_DENIED`.
2. **Non-Admin Category Deletion**: `delete /categories/cat-1` signed in as regular user -> `PERMISSION_DENIED`.
3. **Spoofed Admin Email (Unverified)**: `create /products/prod-spoof` with `email: 'aftab.azam22@gmail.com'` and `email_verified: false` -> `PERMISSION_DENIED`.
4. **Self-Assigned Admin Role**: `create /admins/attackerUid` by non-admin -> `PERMISSION_DENIED`.
5. **Order State Shortcutting**: `create /orders/ord-hack` with `status: 'delivered'` -> `PERMISSION_DENIED`.
6. **Orphan Order Without Tracking Doc**: `create /orders/ord-orphan` without atomic `/order_tracking/{orderNumber}` write -> `PERMISSION_DENIED`.
7. **PII Scraping List Query**: `list /orders` or `list /users` by unauthenticated user or non-admin without owner filter -> `PERMISSION_DENIED`.
8. **Cross-User Order/Profile Read**: `get /orders/ord-1001` or `get /users/otherUid` by a user whose `uid != owner` -> `PERMISSION_DENIED`.
9. **Tracking List Enumeration**: `list /order_tracking` by non-admin -> `PERMISSION_DENIED`.
10. **Shadow / Ghost Field Injection**: `create /orders/ord-shadow` containing extra field `isPaid: true` or `/users/{uid}` with `role: 'admin'` -> `PERMISSION_DENIED`.
11. **ID Poisoning**: `create /products/<1500-char string>` -> `PERMISSION_DENIED` (`isValidId` rejects > 128 chars or invalid chars).
12. **Client Timestamp Forgery**: `create /orders/ord-time` with backdated `createdAt` (`!= request.time`) -> `PERMISSION_DENIED`.
