/**
 * Firestore Security Rules — unit tests
 * ----------------------------------------------------------------
 * Run with:
 *   npm i -D @firebase/rules-unit-testing firebase
 *   npx mocha tests/firestore.rules.spec.js --timeout 10000
 *
 * Uses the in-memory test SDK, so no Firebase project is required.
 */

const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');
const { doc, setDoc, getDoc, updateDoc, deleteDoc, addDoc, collection } =
  require('firebase/firestore');

const RULES = fs.readFileSync(
  path.join(__dirname, '..', 'firestore.rules'),
  'utf8'
);

let env;

before(async () => {
  env = await initializeTestEnvironment({
    projectId: `demo-colormytrip-${Date.now()}`,
    firestore: { rules: RULES },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
async function seedUser(uid, data) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'users', uid), data);
  });
}

function ctxFor(uid) {
  return uid ? env.authenticatedContext(uid) : env.unauthenticatedContext();
}

function ref(db, ...p) { return doc(db, ...p); }

// ----------------------------------------------------------------
// /users/{uid} — self role escalation MUST be denied
// ----------------------------------------------------------------
describe('/users/{uid}', () => {
  it('allows the owner to read their own profile', async () => {
    await seedUser('u1', { role: 'customer', status: 'active' });
    const db = ctxFor('u1').firestore();
    await assertSucceeds(getDoc(ref(db, 'users', 'u1')));
  });

  it('denies the owner from setting role to "admin"', async () => {
    await seedUser('u1', { role: 'customer', status: 'active' });
    const db = ctxFor('u1').firestore();
    await assertFails(
      updateDoc(ref(db, 'users', 'u1'), { role: 'admin' })
    );
  });

  it('denies the owner from setting status to "active"', async () => {
    await seedUser('u1', { role: 'customer', status: 'banned' });
    const db = ctxFor('u1').firestore();
    await assertFails(
      updateDoc(ref(db, 'users', 'u1'), { status: 'active' })
    );
  });

  it('allows the owner to update non-sensitive fields', async () => {
    await seedUser('u1', { role: 'customer', status: 'active', name: 'A' });
    const db = ctxFor('u1').firestore();
    await assertSucceeds(
      updateDoc(ref(db, 'users', 'u1'), { name: 'Alice' })
    );
  });

  it('allows an admin to update role/status', async () => {
    await seedUser('u1', { role: 'customer', status: 'active' });
    await seedUser('admin1', { role: 'admin', status: 'active' });
    const db = ctxFor('admin1').firestore();
    await assertSucceeds(
      updateDoc(ref(db, 'users', 'u1'), { role: 'affiliate' })
    );
  });
});

// ----------------------------------------------------------------
// /enquiries — validation rules on create
// ----------------------------------------------------------------
describe('/enquiries', () => {
  it('denies create with missing fields (was previously allowed)', async () => {
    const db = ctxFor(null).firestore();
    await assertFails(
      addDoc(collection(db, 'enquiries'), { email: 'a@b.c' })
    );
  });

  it('denies create with non-string email', async () => {
    const db = ctxFor(null).firestore();
    await assertFails(
      addDoc(collection(db, 'enquiries'), {
        name: 'Alice', email: 123, message: 'hi',
      })
    );
  });

  it('denies create with empty required strings', async () => {
    const db = ctxFor(null).firestore();
    await assertFails(
      addDoc(collection(db, 'enquiries'), {
        name: '', email: 'a@b.c', message: 'hi',
      })
    );
  });

  it('allows create with all required string fields', async () => {
    const db = ctxFor(null).firestore();
    await assertSucceeds(
      addDoc(collection(db, 'enquiries'), {
        name: 'Alice', email: 'a@b.c', message: 'hello',
      })
    );
  });
});

// ----------------------------------------------------------------
// Affiliate-scoped reads on /bookings, /commissions, /promoCodes
// ----------------------------------------------------------------
describe('affiliate scoped reads', () => {
  beforeEach(async () => {
    await seedUser('aff1', { role: 'affiliate', status: 'active', affiliateId: 'AFF-1' });
    await seedUser('aff2', { role: 'affiliate', status: 'active', affiliateId: 'AFF-2' });
    await seedUser('admin1', { role: 'admin', status: 'active' });

    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'bookings', 'b1'),
        { affiliateId: 'AFF-1', total: 100 });
      await setDoc(doc(ctx.firestore(), 'commissions', 'c1'),
        { affiliateId: 'AFF-1', amount: 10 });
      await setDoc(doc(ctx.firestore(), 'promoCodes', 'p1'),
        { affiliateId: 'AFF-1', code: 'WELCOME' });
    });
  });

  it('affiliate can read their own booking', async () => {
    const db = ctxFor('aff1').firestore();
    await assertSucceeds(getDoc(ref(db, 'bookings', 'b1')));
  });

  it('affiliate cannot read another affiliate\'s booking', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'bookings', 'b2'),
        { affiliateId: 'AFF-2', total: 200 });
    });
    const db = ctxFor('aff1').firestore();
    await assertFails(getDoc(ref(db, 'bookings', 'b2')));
  });

  it('affiliate can read their own commission', async () => {
    const db = ctxFor('aff1').firestore();
    await assertSucceeds(getDoc(ref(db, 'commissions', 'c1')));
  });

  it('affiliate can read their own promo code', async () => {
    const db = ctxFor('aff1').firestore();
    await assertSucceeds(getDoc(ref(db, 'promoCodes', 'p1')));
  });

  it('admin can read/list all bookings', async () => {
    const db = ctxFor('admin1').firestore();
    await assertSucceeds(getDoc(ref(db, 'bookings', 'b1')));
  });
});

// ----------------------------------------------------------------
// /notifications/{id} — user must be the recipient
// ----------------------------------------------------------------
describe('/notifications/{id}', () => {
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'notifications', 'n1'),
        { userUid: 'u1', text: 'hello' });
    });
  });

  it('owner can read their own notification', async () => {
    const db = ctxFor('u1').firestore();
    await assertSucceeds(getDoc(ref(db, 'notifications', 'n1')));
  });

  it('owner can mark their own notification as read', async () => {
    const db = ctxFor('u1').firestore();
    await assertSucceeds(
      updateDoc(ref(db, 'notifications', 'n1'), { read: true })
    );
  });

  it('a different user cannot read someone else\'s notification', async () => {
    const db = ctxFor('u2').firestore();
    await assertFails(getDoc(ref(db, 'notifications', 'n1')));
  });
});
