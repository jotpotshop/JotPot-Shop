# JotPotShop — Firestore Security Specification & Verification Matrix

## 1. Security Architecture Overview
- **Project**: `jotpotshop` (`ai-studio-jotpotshop-389ae0a3-7bb3-43e0-a886-7d4d77268b7f`)
- **Authentication**: Firebase Authentication (`Email/Password` for Staff/Admin and Phone/Email-backed Customers, plus Google Sign-In). Anonymous auth is disabled.
- **Authorization Model**: Role-Based Access Control (RBAC) + Strict Resource Ownership (`request.auth.uid == resource.data.customerUid`).
- **Default Posture**: Fail-closed catch-all (`match /{document=**} { allow read, write: if false; }`).

---

## 2. Document Invariants (Enforced by `firestore.rules`)

| Collection / Path | Document Invariants & Access Rules |
| :--- | :--- |
| `/settings/{settingId}` | **Public Read Allowlist Only**: `branding`, `categories`, `hero_banners`, `products_catalog`, `bundles`, `coupons`, `return_policy`, `seo`, `livechat`, `homepage_sections`, `trust_section`, `help_center`, `delivery`, `payment`, `order_rules`. **Staff-Only Read & Write**: `staff_accounts`, `customers`, `orders_data`, `live_chat_conversations`, `couriers`, and any other key. **Write**: Strictly `isStaffOrAdmin()` with `hasNoPasswordFields()`. |
| `/products/{productId}` | **Public Read**: Any valid `productId`. **Write**: Strictly `isStaffOrAdmin()` validating `id`, `name`, numeric non-negative `price` & `stock`, and `hasNoPasswordFields()`. |
| `/orders/{orderId}` | **Read**: `isStaffOrAdmin()` OR authenticated customer matching `resource.data.customerUid == request.auth.uid`. **Create**: Valid order shape (`id`, `customerName`, `phone`, `items.size() > 0`, `totalAmount > 0`, `address is map`). Staff may create any status; authenticated customer may create only `status == 'Pending'` with `customerUid == request.auth.uid`; guest checkout (`request.auth == null`) may create only `status == 'Pending'` with absent/empty `customerUid`. **Update / Delete**: Strictly `isStaffOrAdmin()`. |
| `/customers/{customerId}` | **Read**: `isStaffOrAdmin()` OR `isOwner(customerId)`. **Create**: `hasNoPasswordFields()` + valid fields; owner cannot set `role` or `status == 'disabled'`. **Update**: `hasNoPasswordFields()` + valid fields; owner cannot self-elevate (`!('role' in incoming())`), cannot re-enable a `'disabled'` account, and cannot alter `status`. **Delete**: Strictly `isStaffOrAdmin()`. |
| `/conversations/{convId}` & `/messages/{msgId}` | **Read**: `isStaffOrAdmin()` OR `resource.data.customerUid == request.auth.uid`. **Create / Update**: `isStaffOrAdmin()` OR authenticated owner preserving `customerUid == request.auth.uid` and `hasNoPasswordFields()`. **Delete**: Strictly `isStaffOrAdmin()`. |
| `/staff/{staffId}` | **Read**: `isStaffOrAdmin()` OR `isOwner(staffId)`. **Write**: Strictly `isStaffOrAdmin()` with `hasNoPasswordFields()` and valid `role in ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF']`. |
| `/coupons/{couponId}`, `/bundles/{bundleId}` | **Read**: Public (`isValidId`). **Write**: Strictly `isStaffOrAdmin()`. |
| `/test/{docId}` | **Read**: `connection` doc for connectivity probe or `isStaffOrAdmin()`. **Write**: Strictly `isStaffOrAdmin()`. |

---

## 3. "Dirty Dozen" Attack Scenarios & Verification Criteria

1. **Unauthenticated PII Read (`settings/customers`, `settings/orders_data`, `settings/staff_accounts`, `settings/couriers`, `settings/live_chat_conversations`)** -> **MUST DENY (`permission-denied`)**.
2. **Unauthenticated Customer Collection Dump (`GET /customers/{uid}` or `LIST /customers`)** -> **MUST DENY (`permission-denied`)**.
3. **Unauthenticated Order Dump (`LIST /orders` or `GET /orders/{id}`)** -> **MUST DENY (`permission-denied`)**.
4. **Customer Cross-Tenant Read/Tamper (`Customer A` reads/updates `Customer B` `/customers/{uidB}`, `/orders/{orderB}`, or `/conversations/{convB}`)** -> **MUST DENY (`permission-denied`)**.
5. **Customer Direct Write to Staff Ledgers (`Customer` writes to `settings/orders_data` or `settings/live_chat_conversations`)** -> **MUST DENY (`permission-denied`)**.
6. **Self-Privilege Escalation (`Customer` writes `role: 'SUPER_ADMIN'` into `/customers/{uid}` or `/staff/{uid}`)** -> **MUST DENY (`permission-denied`)**.
7. **Disabled Account Self-Reactivation (`status: 'disabled'` customer writes `status: 'active'` into `/customers/{uid}`)** -> **MUST DENY (`permission-denied`)**.
8. **Order Status Fraud at Checkout (`Guest` or `Customer` creates `/orders/{id}` with `status: 'Confirmed'` or updates `/orders/{id}` `paymentStatus: 'Paid'`)** -> **MUST DENY (`permission-denied`)**.
9. **Catalog / Price / Settings Defacement (`Guest` or `Customer` writes `/products/{id}` or `/settings/products_catalog` or `/settings/branding`)** -> **MUST DENY (`permission-denied`)**.
10. **Plaintext Password Injection (`password` or `plainPassword` field committed to `/staff`, `/customers`, or `/settings/*`)** -> **MUST DENY (`permission-denied`)**.
11. **Malformed / Corrupt Order Payload (`items: []` or `totalAmount: -500`)** -> **MUST DENY (`permission-denied`)**.
12. **Unknown / Rogue Root Collection (`writes to /arbitrary_collection/doc1`)** -> **MUST DENY (`permission-denied`) via catch-all deny rule**.
