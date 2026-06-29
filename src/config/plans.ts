export type PlanID = "FREE_TRIAL" | "MONTHLY" | "QUARTERLY" | "HALF_YEAR" | "ANNUAL" | "ENTERPRISE" | "FOUNDING_PARTNER";

export interface PlanLimit {
  maxMenus: number;
  maxStaff: number;
  maxTables: number;
  maxLocations: number;
  maxManagers: number;
}

export interface PlanFeature {
  qrOrdering: boolean;
  digitalMenu: boolean;
  tableManagement: boolean;
  kitchenDashboard: boolean;
  customerDatabase: boolean;
  staffAccounts: boolean;
  basicAnalytics: boolean;
  loyaltyProgram: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  quarterlyReview: boolean;
  priorityIssueResolution: boolean;
  staffTraining: boolean;
  businessInsights: boolean;
  earlyFeatureAccess: boolean;
  enhancedSupport: boolean;
  annualStrategyReview: boolean;
  dedicatedSuccessGuidance: boolean;
  multiOutlet: boolean;
  centralizedDashboard: boolean;
  chainAnalytics: boolean;
  customIntegrations: boolean;
  priorityDevelopment: boolean;
  directFounderSupport: boolean;
  freeMenuDigitization: boolean;
}

export interface PlanConfig {
  id: PlanID;
  name: string;
  price: number; // in INR
  billingCycle: "monthly" | "quarterly" | "half_year" | "annual" | "one_time" | "none";
  durationDays: number;
  limits: PlanLimit;
  features: PlanFeature;
}

const DEFAULT_FEATURES: PlanFeature = {
  qrOrdering: false, digitalMenu: false, tableManagement: false, kitchenDashboard: false,
  customerDatabase: false, staffAccounts: false, basicAnalytics: false, loyaltyProgram: false,
  prioritySupport: false, advancedAnalytics: false, quarterlyReview: false,
  priorityIssueResolution: false, staffTraining: false, businessInsights: false,
  earlyFeatureAccess: false, enhancedSupport: false, annualStrategyReview: false,
  dedicatedSuccessGuidance: false, multiOutlet: false, centralizedDashboard: false,
  chainAnalytics: false, customIntegrations: false, priorityDevelopment: false,
  directFounderSupport: false, freeMenuDigitization: false,
};

export const PLANS: Record<PlanID, PlanConfig> = {
  FREE_TRIAL: {
    id: "FREE_TRIAL",
    name: "14-Day Free Trial",
    price: 0,
    billingCycle: "none",
    durationDays: 14,
    limits: { maxMenus: 20, maxStaff: 5, maxTables: 20, maxLocations: 1, maxManagers: 1 },
    features: {
      ...DEFAULT_FEATURES,
      qrOrdering: true, digitalMenu: true, tableManagement: true, kitchenDashboard: true,
      customerDatabase: true, staffAccounts: true, basicAnalytics: true,
    }
  },
  MONTHLY: {
    id: "MONTHLY",
    name: "Monthly",
    price: 999,
    billingCycle: "monthly",
    durationDays: 30,
    limits: { maxMenus: 100, maxStaff: 15, maxTables: 50, maxLocations: 1, maxManagers: 3 },
    features: {
      ...DEFAULT_FEATURES,
      qrOrdering: true, digitalMenu: true, tableManagement: true, kitchenDashboard: true,
      customerDatabase: true, staffAccounts: true, basicAnalytics: true, loyaltyProgram: true,
    }
  },
  QUARTERLY: {
    id: "QUARTERLY",
    name: "Quarterly",
    price: 2499,
    billingCycle: "quarterly",
    durationDays: 90,
    limits: { maxMenus: 100, maxStaff: 15, maxTables: 50, maxLocations: 1, maxManagers: 3 },
    features: {
      ...DEFAULT_FEATURES,
      qrOrdering: true, digitalMenu: true, tableManagement: true, kitchenDashboard: true,
      customerDatabase: true, staffAccounts: true, basicAnalytics: true, loyaltyProgram: true,
      prioritySupport: true, advancedAnalytics: true, quarterlyReview: true, priorityIssueResolution: true,
    }
  },
  HALF_YEAR: {
    id: "HALF_YEAR",
    name: "Half-Year",
    price: 4499,
    billingCycle: "half_year",
    durationDays: 180,
    limits: { maxMenus: 250, maxStaff: 30, maxTables: 100, maxLocations: 2, maxManagers: 5 },
    features: {
      ...DEFAULT_FEATURES,
      qrOrdering: true, digitalMenu: true, tableManagement: true, kitchenDashboard: true,
      customerDatabase: true, staffAccounts: true, basicAnalytics: true, loyaltyProgram: true,
      prioritySupport: true, advancedAnalytics: true, quarterlyReview: true, priorityIssueResolution: true,
      staffTraining: true, businessInsights: true, earlyFeatureAccess: true, enhancedSupport: true,
    }
  },
  ANNUAL: {
    id: "ANNUAL",
    name: "Annual",
    price: 8999,
    billingCycle: "annual",
    durationDays: 365,
    limits: { maxMenus: 999, maxStaff: 100, maxTables: 500, maxLocations: 3, maxManagers: 10 },
    features: {
      ...DEFAULT_FEATURES,
      qrOrdering: true, digitalMenu: true, tableManagement: true, kitchenDashboard: true,
      customerDatabase: true, staffAccounts: true, basicAnalytics: true, loyaltyProgram: true,
      prioritySupport: true, advancedAnalytics: true, quarterlyReview: true, priorityIssueResolution: true,
      staffTraining: true, businessInsights: true, earlyFeatureAccess: true, enhancedSupport: true,
      annualStrategyReview: true, dedicatedSuccessGuidance: true,
    }
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 0, // Custom
    billingCycle: "annual",
    durationDays: 365,
    limits: { maxMenus: 9999, maxStaff: 9999, maxTables: 9999, maxLocations: 999, maxManagers: 999 },
    features: {
      ...DEFAULT_FEATURES,
      qrOrdering: true, digitalMenu: true, tableManagement: true, kitchenDashboard: true,
      customerDatabase: true, staffAccounts: true, basicAnalytics: true, loyaltyProgram: true,
      prioritySupport: true, advancedAnalytics: true, quarterlyReview: true, priorityIssueResolution: true,
      staffTraining: true, businessInsights: true, earlyFeatureAccess: true, enhancedSupport: true,
      annualStrategyReview: true, dedicatedSuccessGuidance: true, multiOutlet: true, centralizedDashboard: true,
      chainAnalytics: true, customIntegrations: true, priorityDevelopment: true,
    }
  },
  FOUNDING_PARTNER: {
    id: "FOUNDING_PARTNER",
    name: "Founding Partner",
    price: 1999,
    billingCycle: "one_time",
    durationDays: 90, // First 3 months free
    limits: { maxMenus: 9999, maxStaff: 9999, maxTables: 9999, maxLocations: 5, maxManagers: 10 },
    features: {
      ...DEFAULT_FEATURES,
      qrOrdering: true, digitalMenu: true, tableManagement: true, kitchenDashboard: true,
      customerDatabase: true, staffAccounts: true, basicAnalytics: true, loyaltyProgram: true,
      prioritySupport: true, advancedAnalytics: true, quarterlyReview: true, priorityIssueResolution: true,
      staffTraining: true, businessInsights: true, earlyFeatureAccess: true, enhancedSupport: true,
      annualStrategyReview: true, dedicatedSuccessGuidance: true, directFounderSupport: true, freeMenuDigitization: true,
    }
  }
};
