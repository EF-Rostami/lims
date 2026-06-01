import { components } from "./api";

/** * Raw Schema Extractions
 * We extract these from the auto-generated "components['schemas']"
 */
export type Schema = components["schemas"];

// User & Profile Types
// export type User = Schema["User"];
// export type Employee = Schema["Employee"];
// export type Customer = Schema["Customer"];

// Auth & Token Types
export type Token = Schema["Token"];
export type UserLogin = Schema["UserLogin"];
export type UserCreate = Schema["UserCreate"];
export type UserResponse = Schema["UserResponse"];

// Enums (Mapped from your Python Enum classes)
export type RoleType = Schema["RoleType"]; 
export type UserType = Schema["UserType"];

/** * Helper Types for UI 
 */
export interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface UserMetadata {
  id: number;
  email: string;
  username?: string | null;
  user_type: UserType;
  roles: string[];        // Array of RoleType values
  permissions: string[];  // Array of Permission codes (e.g., "CAN_EDIT")
}