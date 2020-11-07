import { Component, OnInit } from '@angular/core';
import { WafService } from '../../service/waf.service';
import { ServiceInstance } from '../../model/service-instance';
import { WafConfiguration } from '../../model/waf-configuration';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { InstanceService } from '../../service/instance.service';
import { WafCheckrule } from '../../model/waf-checkrule';
import { WafRule } from '../../model/waf-rule';

@Component({
  selector: 'waf-configuration',
  styleUrls: ['./waf-new-config.component.scss'],
  templateUrl: './waf-new-config.component.html'
})
export class WafNewConfigComponent implements OnInit {

  static SAVE_CONFIG: string = 'saveConfig';
  static RULE_TEMPLATE: string = 'ruleTemplate';
  static CHECK_RULE_TEMPLATE: string = 'checkRuleTemplate';

  wafCheckRuleTemplates: WafCheckrule[] = [];
  wafRuleTemplates: WafRule[] = [];

  serviceInstance: ServiceInstance;
  containerName: string;
  containerPort: number;
  mountPoint: string;
  proxyPass: string;
  selectedWafCheckRuleTemplate: WafCheckrule;
  selectedWafRuleTemplate: WafRule;

  private confDir: string = '/usr/local/openresty/nginx/conf/services-configured';
  private deniedUrl: string = '/RequestDenied';
  learningMode: boolean = true;
  private logDir: string = '/var/log/nginx';

  status = {
    inProgress: {
      saveConfig: false,
      ruleTemplate: false,
      checkRuleTemplate: false
    }
  };

  constructor(
              // apiConfig: ApiConfig,
              route: ActivatedRoute,
              instanceService: InstanceService,
              private router: Router,
              // private toastService: ToastService,
              private wafService: WafService) {
    this.serviceInstance = instanceService.emptyServiceInstance();
    this.selectedWafCheckRuleTemplate = this.wafCheckRuleTemplates[0];
    this.selectedWafRuleTemplate = this.wafRuleTemplates[0];
    route.params
      .subscribe(params => this.urlParamsToServiceInstance(params));
  }

  private urlParamsToServiceInstance(params: Params): void {
    this.serviceInstance.id = params['instanceId'];
    this.serviceInstance.name = params['name'];
    this.serviceInstance.tenantId = params['tenantId'];
  }

  ngOnInit(): void {
    this.loadCheckRuleTemplates();
    this.loadRuleTemplates();
  }

  private loadCheckRuleTemplates() {
    this.requestStarted(WafNewConfigComponent.CHECK_RULE_TEMPLATE);
    this.wafService.getWafCheckRuleTemplates()
      .subscribe((templates) => {
        this.requestFinished(WafNewConfigComponent.CHECK_RULE_TEMPLATE);
        this.wafCheckRuleTemplates = templates;
        if (this.wafCheckRuleTemplates.length > 0) {
          this.selectedWafCheckRuleTemplate = this.wafCheckRuleTemplates[0];
        }
      }, () => {
        this.requestFinished(WafNewConfigComponent.CHECK_RULE_TEMPLATE);
        // this.toastService.showError('Error', 'We had a problem with loading check rule templates');
        this.goToWafConfigurations();
      });
  }

  private loadRuleTemplates() {
    this.requestStarted(WafNewConfigComponent.RULE_TEMPLATE);
    this.wafService.getWafRuleTemplates()
      .subscribe((templates) => {
        this.requestFinished(WafNewConfigComponent.RULE_TEMPLATE);
        this.wafRuleTemplates = templates;
        if (this.wafRuleTemplates.length > 0) {
          this.selectedWafRuleTemplate = this.wafRuleTemplates[0];
        }
      }, () => {
        this.requestFinished(WafNewConfigComponent.RULE_TEMPLATE);
        // this.toastService.showError('Error', 'We had a problem with loading rule templates');
        this.goToWafConfigurations();
      });
  }

  saveWafConfiguration() {
    this.requestStarted(WafNewConfigComponent.SAVE_CONFIG);
    this.wafService.saveWafConfiguration(this.serviceInstance, this.prepareWafConfig())
      .subscribe(() => {
        this.requestFinished(WafNewConfigComponent.SAVE_CONFIG);

        // this.toastService.showSuccess('Success', 'WAF configuration has been saved')
        this.goToWafConfigurations();
      }, () => {
        this.requestFinished(WafNewConfigComponent.SAVE_CONFIG);
        // this.toastService.showError('Error', 'We had a problem with saving WAF configuration');
      });
  }

  private prepareWafConfig(): WafConfiguration {
    return {
      confDir: this.confDir,
      containerName: this.containerName,
      containerPort: this.containerPort,
      defaultCheckrules: this.selectedWafCheckRuleTemplate.name,
      defaultRulesets: this.selectedWafRuleTemplate.name,
      deniedUrl: this.deniedUrl,
      learningMode: this.learningMode,
      logDir: this.logDir,
      mountPoint: this.mountPoint,
      proxyPass: this.proxyPass,
      serviceInstanceId: this.serviceInstance.id,
      tenantId: this.serviceInstance.tenantId
    };
  }

  goToWafConfigurations() {
    this.router.navigate(['/pages/waf']);
  }

  private requestStarted(action: string) {
    this.status.inProgress[action] = true;
  }

  private requestFinished(action: string) {
    this.status.inProgress[action] = false;
  }
}
