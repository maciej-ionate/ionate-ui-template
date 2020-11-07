import { ServiceInstance } from '../../model/service-instance';

export class WafViolationConfig {
  ruleId: string;
  serviceInstance: ServiceInstance;
}
