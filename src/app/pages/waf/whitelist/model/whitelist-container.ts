import { Whitelist } from './whitelist';

export interface WhitelistContainer {
  ruleSet: Whitelist;
  serviceInstanceId: string;
  tenantId: string;
  version: number;
  whitelist: Whitelist;
}
