// src/generated/saas/models.ts
import { components } from "./api"; // Import the raw generated schema tool

// 🏢 Organization Extraction Contracts
export type Organization = components["schemas"]["OrganizationRead"];
export type CreateOrganizationPayload = components["schemas"]["OrganizationCreate"];
export type UpdateOrganizationPayload = components["schemas"]["OrganizationUpdate"];

// 🤖 Provisioning Extraction Contracts
export type TenantProvisionRequest = components["schemas"]["TenantProvisionRequest"];
export type TenantProvisionResponse = components["schemas"]["TenantProvisionResponse"];
export type ProvisioningStatus = components["schemas"]["TenantProvisionResponse"]["registry_status"];

// 🤖 Subscription Extraction Contracts
export type Subscription = components["schemas"]["SubscriptionRead"];
export type CreateSubscriptionPayload = components["schemas"]["SubscriptionCreate"];
export type UpdateSubscriptionPayload = components["schemas"]["SubscriptionUpdate"];
export type SubscriptionStatus = components["schemas"]["SubscriptionRead"]["status"];
export type BillingCycle = components["schemas"]["SubscriptionRead"]["billing_cycle"];
