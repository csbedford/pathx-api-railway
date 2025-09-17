"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RFPStateMachine = exports.CampaignStateMachine = exports.ControlSpaceState = void 0;
const auth_1 = require("./auth");
var ControlSpaceState;
(function (ControlSpaceState) {
    ControlSpaceState["draft"] = "draft";
    ControlSpaceState["approved"] = "approved";
    ControlSpaceState["in_market"] = "in_market";
    ControlSpaceState["archived"] = "archived";
})(ControlSpaceState || (exports.ControlSpaceState = ControlSpaceState = {}));
exports.CampaignStateMachine = [
    // Draft -> Approved: planner or admin
    { from: ControlSpaceState.draft, to: ControlSpaceState.approved, allowedRoles: [auth_1.UserRole.planner, auth_1.UserRole.admin] },
    // Approved -> In Market: admin only
    { from: ControlSpaceState.approved, to: ControlSpaceState.in_market, allowedRoles: [auth_1.UserRole.admin] },
    // In Market -> Archived: admin only
    { from: ControlSpaceState.in_market, to: ControlSpaceState.archived, allowedRoles: [auth_1.UserRole.admin] },
    // Allow direct archive by admin from earlier states if needed
    { from: ControlSpaceState.approved, to: ControlSpaceState.archived, allowedRoles: [auth_1.UserRole.admin] },
    { from: ControlSpaceState.draft, to: ControlSpaceState.archived, allowedRoles: [auth_1.UserRole.admin] },
];
exports.RFPStateMachine = [
    // Draft -> Approved: planner or admin
    { from: ControlSpaceState.draft, to: ControlSpaceState.approved, allowedRoles: [auth_1.UserRole.planner, auth_1.UserRole.admin] },
    // Approved -> In Market: admin only
    { from: ControlSpaceState.approved, to: ControlSpaceState.in_market, allowedRoles: [auth_1.UserRole.admin] },
    // In Market -> Archived: admin only
    { from: ControlSpaceState.in_market, to: ControlSpaceState.archived, allowedRoles: [auth_1.UserRole.admin] },
    // Direct archive
    { from: ControlSpaceState.approved, to: ControlSpaceState.archived, allowedRoles: [auth_1.UserRole.admin] },
    { from: ControlSpaceState.draft, to: ControlSpaceState.archived, allowedRoles: [auth_1.UserRole.admin] },
];
//# sourceMappingURL=stateMachine.js.map