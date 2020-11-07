import { ServiceInstance } from '../../model/service-instance';

export class WafGenerateWhitelistConfig {
  serviceInstance: ServiceInstance;
  generateAnotherWhitelist: boolean;
}
