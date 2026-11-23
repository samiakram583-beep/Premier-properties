# Security Specification — Premier Property Management & Development

## Data Invariants
1. Public users may only read published properties, property images, gallery images, and `site_settings/main`.
2. Public users may never read, list, update, or delete `/inquiries` (contains client PII: name, phone, email, message).
3. Public inquiry creation must enforce `status == 'new'`, `privateNotes == ''`, and server timestamps (`request.time`), plus validate referenced `propertyId` exists when non-empty.
4. Only verified `admin` or `editor` staff may create/update/delete properties, property images, gallery images, or manage inquiries.
5. Only `admin` users may modify `site_settings/main` or assign/modify user roles in `/profiles/{userId}`.
6. Users creating their own `/profiles/{uid}` document cannot self-assign `admin` or `editor` roles unless they match the bootstrapped verified admin email.
7. Every document ID must match `^[a-zA-Z0-9_\-]+$` (max 128 chars), and all strings/lists enforce explicit upper bounds.

## Dirty Dozen Adversarial Payloads
1. **Self-Assigned Admin Role**: Signed-in non-admin creates `/profiles/{uid}` with `role: "admin"`. Expected: `PERMISSION_DENIED`.
2. **Role Escalation Update**: Signed-in editor updates own `/profiles/{uid}` changing `role` from `"editor"` to `"admin"`. Expected: `PERMISSION_DENIED`.
3. **Unverified Admin Email Spoof**: Token has `email: "sa3840213@gmail.com"` with `email_verified: false`. Expected: `PERMISSION_DENIED`.
4. **Public PII Read on Inquiries**: Unauthenticated or viewer user executes `get` or `list` on `/inquiries`. Expected: `PERMISSION_DENIED`.
5. **Shadow Field Injection on Property**: Staff attempts to write a property with an unknown field `extraFlag: true`. Expected: `PERMISSION_DENIED`.
6. **Pre-Closed Inquiry Spoof**: Public user submits inquiry with `status: "closed"` or non-empty `privateNotes`. Expected: `PERMISSION_DENIED`.
7. **Orphaned Property Image**: Staff creates `/property_images/{id}` with a non-existent `propertyId`. Expected: `PERMISSION_DENIED`.
8. **Orphaned Inquiry Property Reference**: Public user submits inquiry referencing a non-existent `propertyId`. Expected: `PERMISSION_DENIED`.
9. **Path Variable Poisoning**: Request targets document ID containing `../` or 300-character junk string. Expected: `PERMISSION_DENIED`.
10. **Client Timestamp Forgery**: Payload supplies a backdated `createdAt` instead of `request.time`. Expected: `PERMISSION_DENIED`.
11. **Unbounded Array Exhaustion**: Property write includes `amenities` array of 50 items or non-string element `[123]`. Expected: `PERMISSION_DENIED`.
12. **Editor Modifying Site Settings**: Editor attempts to update `/site_settings/main` (admin-only). Expected: `PERMISSION_DENIED`.
