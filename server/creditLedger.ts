import fs from 'fs';
import path from 'path';

export interface ServerCreditTransaction {
  id: string;
  userId: string;
  type: 'Initial Bonus' | 'Task Usage' | 'Purchase' | 'Refund' | 'Admin Adjustment';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface ServerUserCredits {
  balance: number;
  unlockedChallenges: string[]; // List of challenge IDs already paid for
  initialBonusGranted: boolean;
}

export interface PurchaseRecord {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  credits: number;
  priceUsd: number;
  status: 'pending' | 'completed' | 'failed';
  paymentProvider: 'placeholder' | 'stripe' | 'razorpay';
  providerPaymentId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreditDbState {
  users: Record<string, ServerUserCredits>;
  transactions: ServerCreditTransaction[];
  purchases: PurchaseRecord[];
  processedWebhookEvents: string[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'credits_db.json');

const INITIAL_BONUS = 300;
const TASK_COST = 100;

export const SERVER_PACKAGES = [
  {
    id: 'pkg_starter',
    name: 'Starter',
    credits: 300,
    priceUsd: 15,
    badge: '3 Tasks',
    description: 'Perfect for trying out challenges and verifying your skills with engineering teams.',
  },
  {
    id: 'pkg_growth',
    name: 'Growth',
    credits: 1000,
    priceUsd: 45,
    popular: true,
    badge: '10 Tasks · Most Popular',
    description: 'Ideal for active candidates looking to prove multiple tracks and stack evaluations.',
  },
  {
    id: 'pkg_pro',
    name: 'Pro',
    credits: 2500,
    priceUsd: 99,
    badge: '25 Tasks · Best Value',
    description: 'Designed for serious applicants competing across multiple startup challenges and bounties.',
  },
  {
    id: 'pkg_power',
    name: 'Power',
    credits: 5000,
    priceUsd: 179,
    badge: '50 Tasks',
    description: 'Maximum volume for continuous skill benchmarking, enterprise cohorts, and high-frequency attempts.',
  },
];

class CreditLedger {
  private state: CreditDbState;
  private writeLock: Promise<void> = Promise.resolve();

  constructor() {
    this.state = this.loadFromDisk();
  }

  private loadFromDisk(): CreditDbState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed reading credits_db.json, starting fresh:', err);
    }
    return {
      users: {},
      transactions: [],
      purchases: [],
      processedWebhookEvents: [],
    };
  }

  private async persist(): Promise<void> {
    this.writeLock = this.writeLock.then(async () => {
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        await fs.promises.writeFile(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to persist credits_db.json:', err);
      }
    });
    return this.writeLock;
  }

  /**
   * Initializes user balance if not already present.
   * Guarantees that 300 credits are granted exactly ONCE.
   */
  public async ensureUser(userId: string): Promise<ServerUserCredits> {
    if (!this.state.users[userId]) {
      this.state.users[userId] = {
        balance: INITIAL_BONUS,
        unlockedChallenges: [],
        initialBonusGranted: true,
      };

      const tx: ServerCreditTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        type: 'Initial Bonus',
        amount: INITIAL_BONUS,
        balanceAfter: INITIAL_BONUS,
        description: 'Welcome bonus on registration',
        createdAt: new Date().toISOString(),
      };
      this.state.transactions.unshift(tx);
      await this.persist();
    }
    return this.state.users[userId];
  }

  public async getBalance(userId: string): Promise<{ balance: number; unlockedChallenges: string[] }> {
    const u = await this.ensureUser(userId);
    return {
      balance: u.balance,
      unlockedChallenges: [...u.unlockedChallenges],
    };
  }

  public async getTransactions(userId: string, limit = 50): Promise<ServerCreditTransaction[]> {
    await this.ensureUser(userId);
    return this.state.transactions
      .filter((t) => t.userId === userId)
      .slice(0, limit);
  }

  /**
   * Deducts 100 credits atomically to start/unlock a challenge.
   * If already unlocked, does NOT deduct again.
   * If balance < 100, throws an error and deducts 0.
   */
  public async unlockChallenge(userId: string, challengeId: string): Promise<{
    success: boolean;
    alreadyUnlocked: boolean;
    balance: number;
    transaction?: ServerCreditTransaction;
    message: string;
  }> {
    const user = await this.ensureUser(userId);

    // If challenge was already paid for/unlocked, return success without re-deducting
    if (user.unlockedChallenges.includes(challengeId)) {
      return {
        success: true,
        alreadyUnlocked: true,
        balance: user.balance,
        message: 'Challenge already unlocked. No credits deducted.',
      };
    }

    // Balance check
    if (user.balance < TASK_COST) {
      return {
        success: false,
        alreadyUnlocked: false,
        balance: user.balance,
        message: `Insufficient credits. Task requires ${TASK_COST} credits, but you have ${user.balance}. Purchase more credits to continue.`,
      };
    }

    // Atomic deduction
    user.balance -= TASK_COST;
    user.unlockedChallenges.push(challengeId);

    const tx: ServerCreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      type: 'Task Usage',
      amount: -TASK_COST,
      balanceAfter: user.balance,
      description: `Task unlock for challenge #${challengeId}`,
      referenceId: challengeId,
      createdAt: new Date().toISOString(),
    };

    this.state.transactions.unshift(tx);
    await this.persist();

    return {
      success: true,
      alreadyUnlocked: false,
      balance: user.balance,
      transaction: tx,
      message: `Deducted ${TASK_COST} credits. Challenge unlocked successfully.`,
    };
  }

  /**
   * Initiates a purchase intent / checkout order.
   */
  public async createPurchaseOrder(userId: string, packageId: string): Promise<PurchaseRecord> {
    await this.ensureUser(userId);
    const pkg = SERVER_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      throw new Error(`Invalid package ID: ${packageId}`);
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const purchase: PurchaseRecord = {
      id: orderId,
      userId,
      packageId: pkg.id,
      packageName: pkg.name,
      credits: pkg.credits,
      priceUsd: pkg.priceUsd,
      status: 'pending',
      paymentProvider: 'placeholder',
      createdAt: new Date().toISOString(),
    };

    this.state.purchases.unshift(purchase);
    await this.persist();
    return purchase;
  }

  /**
   * Idempotently verifies and completes a payment.
   * If payment is already completed, returns existing result without duplicating credits.
   */
  public async completePurchase(orderId: string, verificationToken?: string): Promise<{
    success: boolean;
    purchase: PurchaseRecord;
    balance: number;
    transaction?: ServerCreditTransaction;
    alreadyCompleted?: boolean;
    message: string;
  }> {
    const purchase = this.state.purchases.find((p) => p.id === orderId);
    if (!purchase) {
      throw new Error('Purchase order not found');
    }

    if (purchase.status === 'completed') {
      const user = await this.ensureUser(purchase.userId);
      return {
        success: true,
        alreadyCompleted: true,
        purchase,
        balance: user.balance,
        message: 'Order was already successfully processed.',
      };
    }

    // In a production environment with Stripe or Razorpay, we verify the signature or provider status here.
    // In our placeholder abstraction mode, we verify the order state and mark completed.
    const user = await this.ensureUser(purchase.userId);
    user.balance += purchase.credits;
    purchase.status = 'completed';
    purchase.completedAt = new Date().toISOString();
    purchase.providerPaymentId = verificationToken || `sim_${Date.now()}`;

    const tx: ServerCreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: purchase.userId,
      type: 'Purchase',
      amount: purchase.credits,
      balanceAfter: user.balance,
      description: `Purchased ${purchase.packageName} package (+${purchase.credits} credits)`,
      referenceId: purchase.id,
      createdAt: new Date().toISOString(),
    };

    this.state.transactions.unshift(tx);
    await this.persist();

    return {
      success: true,
      purchase,
      balance: user.balance,
      transaction: tx,
      message: `Payment verified. Added ${purchase.credits} credits to your account.`,
    };
  }
}

export const creditLedger = new CreditLedger();
