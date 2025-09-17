import { UserRole } from './auth';

export enum ControlSpaceState {
  draft = 'draft',
  approved = 'approved',
  in_market = 'in_market',
  archived = 'archived',
}

export interface StateTransition {
  from: ControlSpaceState;
  to: ControlSpaceState;
  allowedRoles: UserRole[];
}

export const CampaignStateMachine: StateTransition[] = [
  // Draft -> Approved: planner or admin
  { from: ControlSpaceState.draft, to: ControlSpaceState.approved, allowedRoles: [UserRole.planner, UserRole.admin] },
  // Approved -> In Market: admin only
  { from: ControlSpaceState.approved, to: ControlSpaceState.in_market, allowedRoles: [UserRole.admin] },
  // In Market -> Archived: admin only
  { from: ControlSpaceState.in_market, to: ControlSpaceState.archived, allowedRoles: [UserRole.admin] },
  // Allow direct archive by admin from earlier states if needed
  { from: ControlSpaceState.approved, to: ControlSpaceState.archived, allowedRoles: [UserRole.admin] },
  { from: ControlSpaceState.draft, to: ControlSpaceState.archived, allowedRoles: [UserRole.admin] },
];

export const RFPStateMachine: StateTransition[] = [
  // Draft -> Approved: planner or admin
  { from: ControlSpaceState.draft, to: ControlSpaceState.approved, allowedRoles: [UserRole.planner, UserRole.admin] },
  // Approved -> In Market: admin only
  { from: ControlSpaceState.approved, to: ControlSpaceState.in_market, allowedRoles: [UserRole.admin] },
  // In Market -> Archived: admin only
  { from: ControlSpaceState.in_market, to: ControlSpaceState.archived, allowedRoles: [UserRole.admin] },
  // Direct archive
  { from: ControlSpaceState.approved, to: ControlSpaceState.archived, allowedRoles: [UserRole.admin] },
  { from: ControlSpaceState.draft, to: ControlSpaceState.archived, allowedRoles: [UserRole.admin] },
];

