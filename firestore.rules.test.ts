/**
 * Phase 0 Payload-First Security Test Specification
 * Verifies all "Dirty Dozen" payloads against firestore.rules invariants.
 * Run in CI with @firebase/rules-unit-testing against the Firestore Emulator.
 */

export interface DirtyDozenCase {
  id: string;
  collection: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  description: string;
  expected: 'PERMISSION_DENIED';
  payload?: Record<string, unknown>;
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 'DD-01',
    collection: 'profiles',
    operation: 'create',
    description: 'Non-admin user self-assigns admin role on profile creation',
    expected: 'PERMISSION_DENIED',
    payload: { uid: 'attacker-uid', email: 'attacker@example.com', displayName: 'Attacker', role: 'admin' },
  },
  {
    id: 'DD-02',
    collection: 'profiles',
    operation: 'update',
    description: 'Editor attempts to escalate own role to admin',
    expected: 'PERMISSION_DENIED',
    payload: { role: 'admin' },
  },
  {
    id: 'DD-03',
    collection: 'properties',
    operation: 'create',
    description: 'Unverified email token spoofing bootstrapped admin email',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-04',
    collection: 'inquiries',
    operation: 'list',
    description: 'Public or non-staff user listing inquiries containing PII',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-05',
    collection: 'properties',
    operation: 'create',
    description: 'Shadow field injection (unexpected field extraFlag)',
    expected: 'PERMISSION_DENIED',
    payload: { extraFlag: true },
  },
  {
    id: 'DD-06',
    collection: 'inquiries',
    operation: 'create',
    description: 'Public inquiry submitted with pre-set closed status or privateNotes',
    expected: 'PERMISSION_DENIED',
    payload: { status: 'closed', privateNotes: 'Injected note' },
  },
  {
    id: 'DD-07',
    collection: 'property_images',
    operation: 'create',
    description: 'Orphaned property image referencing non-existent propertyId',
    expected: 'PERMISSION_DENIED',
    payload: { propertyId: 'missing-property-999' },
  },
  {
    id: 'DD-08',
    collection: 'inquiries',
    operation: 'create',
    description: 'Inquiry referencing non-existent propertyId',
    expected: 'PERMISSION_DENIED',
    payload: { propertyId: 'non-existent-id' },
  },
  {
    id: 'DD-09',
    collection: 'inquiries',
    operation: 'create',
    description: 'Document ID exceeding 128 chars or invalid characters',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-10',
    collection: 'inquiries',
    operation: 'create',
    description: 'Backdated client-provided createdAt timestamp instead of server request.time',
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 'DD-11',
    collection: 'properties',
    operation: 'create',
    description: 'Amenities list exceeding 30 items or containing non-string element',
    expected: 'PERMISSION_DENIED',
    payload: { amenities: [12345] },
  },
  {
    id: 'DD-12',
    collection: 'site_settings',
    operation: 'update',
    description: 'Editor attempting to modify admin-only site_settings/main',
    expected: 'PERMISSION_DENIED',
    payload: { phoneDisplay: '0300 9999999' },
  },
];
