import { Component, OnInit } from '@angular/core';
import { WafService } from '../../service/waf.service';
import { ServiceInstance } from '../../model/service-instance';
import { WafConfiguration } from '../../model/waf-configuration';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { InstanceService } from '../../service/instance.service';
import { WafNewConfigComponent } from '../new/waf-new-config.component';
import { WafRule } from '../../model/waf-rule';
import { WafCheckrule } from '../../model/waf-checkrule';

@Component({
  selector: 'waf-configuration',
  styleUrls: ['./waf-edit-config.component.scss'],
  templateUrl: './waf-edit-config.component.html'
})
export class WafEditConfigComponent implements OnInit {


  static CHECK_RULE_TEMPLATE: string = 'checkRuleTemplate';
  static LOAD_CONFIG: string = 'loadConfig';
  static RULE_TEMPLATE: string = 'ruleTemplate';
  static SAVE_CONFIG: string = 'saveConfig';

  wafCheckRuleTemplates: WafCheckrule[] = [];
  wafRuleTemplates: WafRule[] = [];
  private loadedWafConfiguration;

  serviceInstance: ServiceInstance;
  containerName: string;
  containerPort: number;
  mountPoint: string;
  proxyPass: string;
  selectedWafCheckRuleTemplate: WafCheckrule;
  selectedWafRuleTemplate: WafRule;
  learningMode: boolean;

  private confDir: string = '/usr/local/openresty/nginx/conf/services-configured';
  private deniedUrl: string = '/RequestDenied';
  private logDir: string = '/var/log/nginx';

  status = {
    inProgress: {
      checkRuleTemplate: false,
      loadConfig: false,
      ruleTemplate: false,
      saveConfig: false
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
    route.params
      .subscribe(params => this.initializeComponent(params));
  }

  private initializeComponent(params: Params) {
    this.serviceInstance = this.urlParamsToServiceInstance(params);
    this.loadWafConfiguration(this.serviceInstance);
  }

  private urlParamsToServiceInstance(params: Params): ServiceInstance {
    return {
      id: params['instanceId'],
      name: params['name'],
      tenantId: params['tenantId']
    };
  }

  private loadWafConfiguration(serviceInstance: ServiceInstance) {
    this.requestStarted(WafEditConfigComponent.LOAD_CONFIG);
    this.wafService.getWafConfiguration(serviceInstance)
      .subscribe((config) => {
        this.requestFinished(WafEditConfigComponent.LOAD_CONFIG);
        this.loadedWafConfiguration = config;
        this.consumeLoadedWafConfiguration(config);
      }, () => {
        this.requestFinished(WafEditConfigComponent.LOAD_CONFIG);
        // this.toastService.showError('Error', 'We had a problem with loading WAF configuration');
        this.goToWafConfigurations();
      });
  }

  ngOnInit(): void {
    this.loadCheckRuleTemplates();
    this.loadRuleTemplates();
  }

  private loadCheckRuleTemplates() {
    this.requestStarted(WafEditConfigComponent.CHECK_RULE_TEMPLATE);
    this.wafService.getWafCheckRuleTemplates()
      .subscribe((templates) => {
        this.requestFinished(WafEditConfigComponent.CHECK_RULE_TEMPLATE);
        this.wafCheckRuleTemplates = templates;
        this.selectWafCheckRuleTemplate();
      }, () => {
        this.requestFinished(WafEditConfigComponent.CHECK_RULE_TEMPLATE);
        // this.toastService.showError('Error', 'We had a problem with loading check rule templates');
        this.goToWafConfigurations();
      });
  }

  private loadRuleTemplates() {
    this.requestStarted(WafNewConfigComponent.RULE_TEMPLATE);
    this.wafService.getWafRuleTemplates()
      .subscribe((templates) => {
        this.requestFinished(WafEditConfigComponent.RULE_TEMPLATE);
        this.wafRuleTemplates = templates;
        this.selectWafRuleTemplate();
      }, () => {
        this.requestFinished(WafEditConfigComponent.RULE_TEMPLATE);
        // this.toastService.showError('Error', 'We had a problem with loading rule templates');
        this.goToWafConfigurations();
      });
  }

  private consumeLoadedWafConfiguration(config: WafConfiguration): void {
    this.learningMode = config.learningMode;
    this.containerName = config.containerName;
    this.containerPort = config.containerPort;
    this.mountPoint = config.mountPoint;
    this.proxyPass = config.proxyPass;
    this.selectWafCheckRuleTemplate();
    this.selectWafRuleTemplate();
  }

  private selectWafCheckRuleTemplate() {
    if (this.wafCheckRuleTemplates.length > 0 && this.loadedWafConfiguration) {
      this.selectedWafCheckRuleTemplate = this.wafCheckRuleTemplates
        .find(template => template.name === this.loadedWafConfiguration.defaultCheckrules);
    }
  }

  private selectWafRuleTemplate() {
    if (this.wafRuleTemplates.length > 0 && this.loadedWafConfiguration) {
      this.selectedWafRuleTemplate = this.wafRuleTemplates
        .find(template => template.name === this.loadedWafConfiguration.defaultCheckrules);
    }
  }

  saveWafConfiguration() {
    this.requestStarted(WafEditConfigComponent.SAVE_CONFIG);
    this.wafService.updateWafConfiguration(this.serviceInstance, this.prepareWafConfig())
      .subscribe(() => {
        this.requestFinished(WafEditConfigComponent.SAVE_CONFIG);

        // this.toastService.showSuccess('Success', 'WAF configuration has been saved')
        this.goToWafConfigurations();
      }, () => {
        this.requestFinished(WafEditConfigComponent.SAVE_CONFIG);
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
