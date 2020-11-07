import { WhitelistCandidate } from './whitelist-candidate';

export interface WhitelistCandidates {
  entries: WhitelistCandidate[];
  serviceInstanceId: string;
  tenantId: string;
  type: string;
}
