import prisma from '../lib/prisma';
import { ControlSpaceState, CampaignStateMachine, RFPStateMachine } from '../types/stateMachine';
import { UserRole } from '../types/auth';
import { recordStateTransition } from './audit';

export type EntityType = 'Campaign' | 'RFP';

function machineFor(entity: EntityType) {
  return entity === 'Campaign' ? CampaignStateMachine : RFPStateMachine;
}

export function validateTransition(
  entity: EntityType,
  current: ControlSpaceState | string,
  target: ControlSpaceState | string,
  userRoles: (UserRole | string)[],
): { ok: boolean; reason?: string } {
  const transitions = machineFor(entity);
  const from = String(current) as ControlSpaceState;
  const to = String(target) as ControlSpaceState;
  const match = transitions.find((t) => t.from === from && t.to === to);
  if (!match) {
    return { ok: false, reason: `No transition defined from ${from} to ${to}` };
  }
  const roleSet = new Set(userRoles.map(String));
  const allowed = match.allowedRoles.some((r) => roleSet.has(String(r)));
  if (!allowed) {
    return { ok: false, reason: `Role not permitted for transition ${from} -> ${to}` };
  }
  return { ok: true };
}

export async function transitionState(params: {
  entity: EntityType;
  id: string;
  current: ControlSpaceState | string;
  target: ControlSpaceState | string;
  actor: { id?: string; roles: (UserRole | string)[] };
}) {
  const { entity, id, current, target, actor } = params;
  const { ok, reason } = validateTransition(entity, current, target, actor.roles);
  if (!ok) {
    const err = new Error(reason || 'Transition not allowed');
    (err as any).statusCode = 403;
    throw err;
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    const before =
      entity === 'Campaign'
        ? await tx.campaign.findUnique({ where: { id } })
        : await tx.rFP.findUnique({ where: { id } });

    if (!before) {
      const err = new Error(`${entity} not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    const currentStored = String((before as any).status);
    if (currentStored !== String(current)) {
      const err = new Error(`Current state mismatch: expected ${currentStored}, got ${current}`);
      (err as any).statusCode = 409;
      throw err;
    }

    const after =
      entity === 'Campaign'
        ? await tx.campaign.update({ where: { id }, data: { status: String(target) } })
        : await tx.rFP.update({ where: { id }, data: { status: String(target) } });

    // Audit log within the same transaction for atomicity, with full diff
    await recordStateTransition({
      entityType: entity,
      entityId: id,
      previous: before,
      next: after,
      userId: actor.id,
      tx,
    });

    return after;
  });

  return updated;
}

export default { validateTransition, transitionState };
