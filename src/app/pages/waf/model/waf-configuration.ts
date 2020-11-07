export interface WafConfiguration {
  confDir: string;
  containerName: string;
  containerPort: number;
  defaultCheckrules: string;
  defaultRulesets: string;
  deniedUrl: string;
  learningMode: boolean;
  logDir: string;
  mountPoint: string;
  proxyPass: string;
  serviceInstanceId: string;
  tenantId: string;
}
