import assert from 'node:assert/strict';
import { buildAuditEntry } from '../lib/admin/audit';
import { buildAdminUserQuerySpec, mapAdminGroup } from '../lib/admin/mobile-repository';
import { createSignedAdminSession, verifySignedAdminSession } from '../src/admin/session-token';
import { adminRoles, canChangeFinalSuperAdmin, hasPermission } from '../src/admin/access';
import { appConfigIsConnected, canTransitionReport, canUsePush, canUseSocialFeatures, isAccountStatus } from '../src/admin/domain';

async function run() {
  const identity = { uid: 'admin-1', email: 'admin@devrem.co', displayName: 'Admin', role: 'moderator' as const, provider: 'firebase' as const };
  const secret = 'test-only-session-secret-that-is-over-32-characters';
  const token = await createSignedAdminSession(identity, Date.now() + 60_000, secret);
  const session = await verifySignedAdminSession(token, secret);
  assert.equal(session?.uid, identity.uid, 'admin authentication/session round trip');
  assert.equal(session?.role, 'moderator');

  assert.equal(hasPermission(identity, 'reports.moderate'), true, 'moderator authorization');
  assert.equal(hasPermission({ ...identity, role: 'support' }, 'reports.moderate'), false, 'permission denial');

  const userQuery = buildAdminUserQuerySpec({ q: 'Ayşe', searchField: 'name', cursor: 'opaque-cursor' });
  assert.equal(userQuery.limit, 25, 'user pagination stays bounded');
  assert.equal(userQuery.cursor, 'opaque-cursor');
  assert.equal(userQuery.filters[0]?.field, 'firstName');

  assert.equal(canTransitionReport('open', 'reviewing'), true, 'report can enter review');
  assert.equal(canTransitionReport('resolved', 'open'), false, 'closed report cannot silently reopen');
  assert.equal(isAccountStatus('banned'), true);
  assert.equal(canUseSocialFeatures('active'), true);
  assert.equal(canUseSocialFeatures('suspended'), false);
  assert.equal(canUseSocialFeatures('banned'), false);

  const audit = buildAuditEntry({ action: 'USER_SUSPENDED', admin: { ...identity, expiresAt: Date.now() + 1000, version: 2 }, targetType: 'user', targetId: 'user-1', reason: 'Policy test reason', now: '2026-09-02T00:00:00.000Z' });
  assert.equal(audit.adminUid, 'admin-1');
  assert.equal(audit.reason, 'Policy test reason');
  assert.equal('privateKey' in audit, false, 'audit does not store secrets');

  const group = mapAdminGroup('group-1', { kind: 'devre', militaryPeriodMonth: 8, militaryPeriodYear: 2026, militaryUnitName: 'Kütahya', createdAt: '2026-08-01T00:00:00.000Z' }, 'disabled');
  assert.equal(group.status, 'disabled');
  assert.equal(group.memberCount, null);
  assert.match(group.name, /Kütahya/);

  assert.equal(canChangeFinalSuperAdmin({ targetRole: 'super_admin', nextRole: null, superAdminCount: 1 }), false, 'final super admin protected');
  assert.equal(canChangeFinalSuperAdmin({ targetRole: 'super_admin', nextRole: 'moderator', superAdminCount: 2 }), true);
  assert.deepEqual(adminRoles, ['super_admin', 'moderator', 'content_editor', 'support']);
  assert.equal(canUsePush('support', false), false, 'support cannot send push');
  assert.equal(canUsePush('moderator', false), true, 'moderator can test send');
  assert.equal(canUsePush('moderator', true), false, 'moderator cannot broadcast');
  assert.equal(canUsePush('super_admin', true), true, 'super admin may broadcast');
  assert.equal(hasPermission({ role: 'support' }, 'appConfig.write'), false, 'support cannot write app config');
  assert.equal(hasPermission({ role: 'super_admin' }, 'appConfig.write'), true);
  assert.equal(appConfigIsConnected(), false, 'dead config stays disconnected');

  console.log('Admin core tests passed (no Firebase calls or mutations).');
}

await run();
