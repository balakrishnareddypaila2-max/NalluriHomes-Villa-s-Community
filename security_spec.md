# Security Specification — Nalluri Enclave / Estate Sanctum

## 1. Data Invariants
1. A villa owner registration (`/registrations/{userId}`) can only be created by an authenticated, email-verified user whose `request.auth.uid == userId` and `incoming().userId == request.auth.uid`.
2. New registrations MUST begin in `status == 'pending'`. Clients cannot self-approve (`status == 'approved'`) or inject privilege fields (`role`, `isAdmin`).
3. Villa numbers are strictly bounded to integers between `1` and `231`.
4. PII (`email`, `phone`, `emergencyContactPhone`) inside `/registrations/{userId}` can ONLY be read (`get`) by the owning user or an enclave Admin, and `list` queries on `/registrations` are restricted strictly to verified Admins.
5. Only an enclave Admin can transition a registration to `approved` or `rejected` or write/update `/villas_directory/{villaId}` and `/admins/{adminUid}`.
6. `createdAt` and `userId` are immutable once created, and `createdAt`/`updatedAt` must equal `request.time`.

## 2. Dirty Dozen Attack Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Read**: Read `/registrations/user1` with `auth == null`.
2. **Self-Approval on Create**: Create `/registrations/user1` with `status: 'approved'`.
3. **Identity Spoofing on Create**: User `user2` creates `/registrations/user1` with `userId: 'user1'`.
4. **Ghost Field Injection (Shadow Update)**: Create `/registrations/user1` with extra `isAdmin: true` field.
5. **Owner Privilege Escalation on Update**: Owner updates `/registrations/user1` changing `status` from `'pending'` to `'approved'`.
6. **PII Cross-Tenant Read**: User `user2` executes `get` on `/registrations/user1`.
7. **Blanket Registration List Scraping**: Non-admin executes `list` on `/registrations`.
8. **Out-of-Bounds Villa Number**: Create registration with `villaNumber: 999` or `villaNumber: 0`.
9. **Client Timestamp Forgery**: Create registration with client-supplied past timestamp `createdAt != request.time`.
10. **Path ID Poisoning**: Write to `/registrations/invalid$id!with*badchars`.
11. **Non-Verified Email Admin Spoof**: Token claims `email: 'balakrishnareddy.paila2@gmail.com'` with `email_verified: false`.
12. **Unauthorized Directory Tampering**: Non-admin writes directly to `/villas_directory/villa-108` or `/admins/user2`.
