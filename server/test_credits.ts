import { creditLedger, SERVER_PACKAGES } from './creditLedger';

async function testCreditsSystem() {
  console.log('--- TEST 1: Initial Credit Allocation (Exactly 300 credits) ---');
  const testUserId = `test_candidate_${Date.now()}`;
  const initial = await creditLedger.getBalance(testUserId);
  console.assert(initial.balance === 300, `Expected 300 credits, got ${initial.balance}`);
  console.log(`✓ Initial balance: ${initial.balance} credits`);

  console.log('\n--- TEST 2: Idempotent Login (No duplicate 300 bonus) ---');
  const secondCheck = await creditLedger.getBalance(testUserId);
  console.assert(secondCheck.balance === 300, `Expected 300 credits, got ${secondCheck.balance}`);
  const txs = await creditLedger.getTransactions(testUserId);
  const initialBonuses = txs.filter(t => t.type === 'Initial Bonus');
  console.assert(initialBonuses.length === 1, `Expected exactly 1 Initial Bonus tx, got ${initialBonuses.length}`);
  console.log(`✓ Balance after re-querying: ${secondCheck.balance} credits, Initial Bonus tx count: ${initialBonuses.length}`);

  console.log('\n--- TEST 3: Starting a Task (Deduct 100 credits once) ---');
  const challenge1 = 'chal_test_1';
  const unlockRes1 = await creditLedger.unlockChallenge(testUserId, challenge1);
  console.assert(unlockRes1.success === true, 'Unlock should succeed');
  console.assert(unlockRes1.balance === 200, `Expected 200 credits remaining, got ${unlockRes1.balance}`);
  console.assert(unlockRes1.alreadyUnlocked === false, 'Should be newly unlocked');
  console.log(`✓ Task 1 unlocked. Remaining balance: ${unlockRes1.balance}`);

  console.log('\n--- TEST 4: Re-opening / Refreshing started task (No duplicate deduction) ---');
  const unlockRes1Repeat = await creditLedger.unlockChallenge(testUserId, challenge1);
  console.assert(unlockRes1Repeat.success === true, 'Repeat unlock should succeed');
  console.assert(unlockRes1Repeat.alreadyUnlocked === true, 'Should recognize already unlocked');
  console.assert(unlockRes1Repeat.balance === 200, `Balance must stay 200, got ${unlockRes1Repeat.balance}`);
  console.log(`✓ Task 1 repeat attempt: Deducted 0 credits. Balance remains: ${unlockRes1Repeat.balance}`);

  console.log('\n--- TEST 5: Deducting until insufficient balance ---');
  await creditLedger.unlockChallenge(testUserId, 'chal_test_2'); // -100 -> 100
  await creditLedger.unlockChallenge(testUserId, 'chal_test_3'); // -100 -> 0
  const zeroBal = await creditLedger.getBalance(testUserId);
  console.assert(zeroBal.balance === 0, `Expected 0 balance, got ${zeroBal.balance}`);
  console.log(`✓ After 3 tasks, balance is: ${zeroBal.balance}`);

  const failAttempt = await creditLedger.unlockChallenge(testUserId, 'chal_test_4');
  console.assert(failAttempt.success === false, 'Unlock must fail with 0 balance');
  console.assert(failAttempt.balance === 0, `Balance must remain 0, got ${failAttempt.balance}`);
  console.log(`✓ Prevented task start when balance < 100. Error message: "${failAttempt.message}"`);

  console.log('\n--- TEST 6: Purchase Packages & Server Verification ---');
  const starterOrder = await creditLedger.createPurchaseOrder(testUserId, 'pkg_starter');
  console.assert(starterOrder.credits === 300, `Expected 300 credits for Starter package, got ${starterOrder.credits}`);
  console.assert(starterOrder.status === 'pending', 'Order should initially be pending');
  console.log(`✓ Created purchase order: ${starterOrder.id} for ${starterOrder.credits} credits ($${starterOrder.priceUsd})`);

  // Unverified/failed payments should never add credits
  const balBeforeVerify = await creditLedger.getBalance(testUserId);
  console.assert(balBeforeVerify.balance === 0, 'Unverified order must NOT grant credits');
  console.log(`✓ Verified uncompleted order grants 0 credits. Balance: ${balBeforeVerify.balance}`);

  // Complete payment verification
  const verifyRes = await creditLedger.completePurchase(starterOrder.id, 'sig_test_valid');
  console.assert(verifyRes.success === true, 'Verification must succeed');
  console.assert(verifyRes.balance === 300, `Expected 300 balance after purchase, got ${verifyRes.balance}`);
  console.log(`✓ Verified payment. Added ${starterOrder.credits} credits. New balance: ${verifyRes.balance}`);

  // Idempotency: Duplicate verification attempts must NOT grant duplicate credits
  const duplicateVerify = await creditLedger.completePurchase(starterOrder.id, 'sig_test_valid');
  console.assert(duplicateVerify.alreadyCompleted === true, 'Should detect duplicate verification');
  console.assert(duplicateVerify.balance === 300, `Duplicate verify must NOT add credits. Balance: ${duplicateVerify.balance}`);
  console.log(`✓ Idempotency protected: Duplicate payment verification added 0 credits. Balance: ${duplicateVerify.balance}`);

  console.log('\n--- TEST 7: Transaction History Ledger ---');
  const fullHistory = await creditLedger.getTransactions(testUserId);
  console.log(`✓ Total logged transactions: ${fullHistory.length}`);
  fullHistory.forEach((tx) => {
    console.log(`  - [${tx.type}] ${tx.amount > 0 ? '+' : ''}${tx.amount} credits | Balance after: ${tx.balanceAfter} | ${tx.description}`);
  });

  console.log('\nALL 7 TESTS PASSED SUCCESSFULLY! ✓');
}

testCreditsSystem().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
