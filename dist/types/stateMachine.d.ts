import { UserRole } from './auth';
export declare enum ControlSpaceState {
    draft = "draft",
    approved = "approved",
    in_market = "in_market",
    archived = "archived"
}
export interface StateTransition {
    from: ControlSpaceState;
    to: ControlSpaceState;
    allowedRoles: UserRole[];
}
export declare const CampaignStateMachine: StateTransition[];
export declare const RFPStateMachine: StateTransition[];
//# sourceMappingURL=stateMachine.d.ts.map