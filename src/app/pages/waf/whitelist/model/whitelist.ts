export interface Whitelist {
  description: string;
  name: string;
  whitelistEntries: WhitelistEntry[];
}

export interface WhitelistEntry {
  id: string;
  mz: WhitelistEntryMz[];
  name: string;
  ruleId: number[];
}

interface WhitelistEntryMz {
  mzType: string;
  value: string;
}
