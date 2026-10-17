import { CreditPackage } from '../types';

export const TASK_CREDIT_COST = 100;
export const INITIAL_USER_CREDITS = 300;

export const CREDIT_PACKAGES: CreditPackage[] = [
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
