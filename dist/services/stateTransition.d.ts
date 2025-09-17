import { ControlSpaceState } from '../types/stateMachine';
import { UserRole } from '../types/auth';
export type EntityType = 'Campaign' | 'RFP';
export declare function validateTransition(entity: EntityType, current: ControlSpaceState | string, target: ControlSpaceState | string, userRoles: (UserRole | string)[]): {
    ok: boolean;
    reason?: string;
};
export declare function transitionState(params: {
    entity: EntityType;
    id: string;
    current: ControlSpaceState | string;
    target: ControlSpaceState | string;
    actor: {
        id?: string;
        roles: (UserRole | string)[];
    };
}): Promise<any>;
declare const _default: {
    validateTransition: typeof validateTransition;
    transitionState: typeof transitionState;
};
export default _default;
//# sourceMappingURL=stateTransition.d.ts.map