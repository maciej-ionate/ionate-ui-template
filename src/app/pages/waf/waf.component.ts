import { Component, OnInit } from '@angular/core';
import { InstanceService } from './service/instance.service';
import { ServiceInstance } from './model/service-instance';
import { Router } from '@angular/router';
import { WafService } from './service/waf.service';
import { WafConfiguration } from './model/waf-configuration';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'waf-component',
  styleUrls: ['./waf.component.scss'],
  templateUrl: './waf.component.html'
})
export class WafComponent implements OnInit {

  static LOAD_SERVICE_INSTANCES = 'loadServiceInstances';
  static LOAD_WAF_CONFIGURATIONS = 'loadWafConfigurations';

  customServiceInstanceMode: boolean = false;
  serviceInstancesWithWaf: ServiceInstance[] = [];
  serviceInstancesWithoutWaf: ServiceInstance[] = [];
  selectedServiceInstance: ServiceInstance;
  wafConfigurations: WafConfiguration[] = [];

  status = {
    inProgress: {
      loadServiceInstances: false,
      loadWafConfigurations: false,
    },
    wafConfigurationDelScheduled: {},
  };

  constructor(private instanceService: InstanceService,
              // private modalService: NgbModal,
              private router: Router,
              // private toastService: ToastService,
              private wafService: WafService) {
  }

  ngOnInit() {
    this.getServiceInstances();
  }

  getServiceInstances() {
    this.requestStarted(WafComponent.LOAD_SERVICE_INSTANCES);
    this.instanceService.getServiceInstances().subscribe(
      serviceInstances => this.onServiceInstancesDownloadSucceeded(serviceInstances),
      () => this.onServiceInstancesDownloadFailed()
    );
  }

  private onServiceInstancesDownloadSucceeded(serviceInstances: ServiceInstance[]) {
    this.requestFinished(WafComponent.LOAD_SERVICE_INSTANCES);
    this.getWafConfigurations(serviceInstances);
  }

  private onServiceInstancesDownloadFailed() {
    this.requestFinished(WafComponent.LOAD_SERVICE_INSTANCES);
    // this.toastService
    //   .showError('Error', 'We had a problem with downloading all service instances');
  }

  private getWafConfigurations(tenantsServiceInstances: ServiceInstance[]) {
    if (tenantsServiceInstances.length > 0) {
      const tenantId = tenantsServiceInstances[0].tenantId;
      this.requestStarted(WafComponent.LOAD_WAF_CONFIGURATIONS);
      this.wafService.getAllWafConfigurations(tenantId)
        .subscribe(
          wafConfigurations => this.onLoadWafConfigurationsSuccess(tenantsServiceInstances, wafConfigurations),
          () => this.onLoadWafConfigurationsFailure(),
        );
    }
  }

  private onLoadWafConfigurationsSuccess(tenantsServiceInstances: ServiceInstance[],
                                         wafConfigurations: WafConfiguration[]) {
    this.wafConfigurations = wafConfigurations;
    this.populateServiceInstanceCollections(tenantsServiceInstances, this.wafConfigurations);
    this.requestFinished(WafComponent.LOAD_WAF_CONFIGURATIONS);
  }

  private onLoadWafConfigurationsFailure() {
    this.requestFinished(WafComponent.LOAD_WAF_CONFIGURATIONS);
    // this.toastService
    //   .showError('Error', 'We had a problem with downloading WAF configurations');
  }

  private populateServiceInstanceCollections(tenantsServiceInstances: ServiceInstance[],
                                             wafConfigurations: WafConfiguration[]) {
    this.clearPreviousServiceInstanceCollections();
    this.clearWafConfigurationDeletionScheduled();
    tenantsServiceInstances
      .forEach(tenantsServiceInstance => this
        .produceCollectionOfServicesWithAndWithoutWad(tenantsServiceInstance, wafConfigurations));
    wafConfigurations
      .forEach(wafConfiguration => this
        .produceCollectionOfServicesWithAndWithoutWaf(wafConfiguration, tenantsServiceInstances));
    this.selectFirstServiceInstanceWithoutWaf();
  }

  private clearPreviousServiceInstanceCollections() {
    this.serviceInstancesWithoutWaf = [];
    this.serviceInstancesWithWaf = [];
  }

  private clearWafConfigurationDeletionScheduled() {
    this.status.wafConfigurationDelScheduled = {};
  }

  private produceCollectionOfServicesWithAndWithoutWad(tenantsServiceInstance: ServiceInstance,
                                                       wafConfigurations: WafConfiguration[]) {
    const foundConfig = this.findWafConfigurationOfServiceInstance(tenantsServiceInstance, wafConfigurations);
    if (!foundConfig) {
      this.serviceInstancesWithoutWaf.push(tenantsServiceInstance);
    }
  }

  private produceCollectionOfServicesWithAndWithoutWaf(wafConfiguration: WafConfiguration,
                                                       tenantsServiceInstances: ServiceInstance[]) {
    const foundServiceInstance = this.findServiceInstanceMatchingWafConfiguration(
      wafConfiguration, tenantsServiceInstances
    );
    if (foundServiceInstance) {
      this.serviceInstancesWithWaf.push(foundServiceInstance);
    } else {
      this.serviceInstancesWithWaf.push(this.createServiceInstanceBasedOnWafConfiguration(wafConfiguration));
    }
  }

  private findServiceInstanceMatchingWafConfiguration(wafConfiguration: WafConfiguration,
                                                      serviceInstances: ServiceInstance[]): ServiceInstance {
    return serviceInstances
      .find(serviceInstance =>
        serviceInstance.id === wafConfiguration.serviceInstanceId &&
        serviceInstance.tenantId === wafConfiguration.tenantId
      );
  }

  private findWafConfigurationOfServiceInstance(serviceInstance: ServiceInstance,
                                                wafConfigurations: WafConfiguration[]): WafConfiguration {
    return wafConfigurations
      .find(config =>
        config.serviceInstanceId === serviceInstance.id &&
        config.tenantId === serviceInstance.tenantId
      );
  }

  private createServiceInstanceBasedOnWafConfiguration(wafConfiguration: WafConfiguration): ServiceInstance {
    return {
      id: wafConfiguration.serviceInstanceId,
      name: wafConfiguration.containerName,
      tenantId: wafConfiguration.tenantId
    };
  }

  private selectFirstServiceInstanceWithoutWaf() {
    if (this.serviceInstancesWithoutWaf.length > 0) {
      this.selectedServiceInstance = this.serviceInstancesWithoutWaf[0];
    }
  }

  disableCustomServiceInstanceMode(): void {
    this.customServiceInstanceMode = false;
    this.selectFirstServiceInstanceWithoutWaf();
  }

  enableCustomServiceInstanceMode(): void {
    this.customServiceInstanceMode = true;
    this.selectedServiceInstance = {
      id: uuid(),
      name: null,
      tenantId: 'e2fa270e-7175-468b-8f6a-724bc9c57306'
    };
  }

  createWafConfiguration(): void {
    this.router.navigate([
      '/pages/waf/tenant/id',
      this.selectedServiceInstance.tenantId,
      'instance',
      'name',
      this.selectedServiceInstance.name,
      'id',
      this.selectedServiceInstance.id,
      'new'
    ]);
  }

  learningModeStatus(serviceInstance: ServiceInstance): boolean {
    return this
      .findWafConfigurationOfServiceInstance(serviceInstance, this.wafConfigurations)
      .learningMode;
  }

  toggleLearningMode(serviceInstance: ServiceInstance): void {
    const origWafConfig = this.findCorrespondingWafConfiguration(serviceInstance);
    const copyOfWafConfig = this.toggleLearningModeInWafConfig(
      this.makeCopyOfWafConfiguration(origWafConfig)
    );
    const inProgressKey = `${serviceInstance.id}-learning-mode`;
    this.requestStarted(inProgressKey);
    this.wafService.updateWafConfiguration(serviceInstance, copyOfWafConfig)
      .subscribe(
        () => this.onToggleLearningModeSuccess(inProgressKey, origWafConfig),
        () => this.onToggleLearningModeError(inProgressKey)
      );
  }

  private onToggleLearningModeSuccess(inProgressKey: string,
                                      wafConfigToUpdate: WafConfiguration): void {
    this.requestFinished(inProgressKey);
    this.toggleLearningModeInWafConfig(wafConfigToUpdate);
    const learningModeAsStr = wafConfigToUpdate.learningMode ? 'enabled' : 'disabled';
    // this.toastService
    //   .showSuccess('Success', `WAF learning mode has been ${learningModeAsStr}`);
  }

  private onToggleLearningModeError(inProgressKey: string): void {
    this.requestFinished(inProgressKey);
    // this.toastService
    //   .showError('Error', 'We had a problem with toggling WAF learning mode');
  }

  private makeCopyOfWafConfiguration(wafConfiguration: WafConfiguration): WafConfiguration {
    return {
      confDir: wafConfiguration.confDir,
      containerName: wafConfiguration.containerName,
      containerPort: wafConfiguration.containerPort,
      defaultCheckrules: wafConfiguration.defaultCheckrules,
      defaultRulesets: wafConfiguration.defaultRulesets,
      deniedUrl: wafConfiguration.deniedUrl,
      learningMode: wafConfiguration.learningMode,
      logDir: wafConfiguration.logDir,
      mountPoint: wafConfiguration.mountPoint,
      proxyPass: wafConfiguration.proxyPass,
      serviceInstanceId: wafConfiguration.serviceInstanceId,
      tenantId: wafConfiguration.tenantId
    };
  }

  private findCorrespondingWafConfiguration(serviceInstance: ServiceInstance): WafConfiguration {
    return this.wafConfigurations
      .find(config =>
        config.tenantId === serviceInstance.tenantId &&
        config.serviceInstanceId === serviceInstance.id
      );
  }

  private toggleLearningModeInWafConfig(config: WafConfiguration): WafConfiguration {
    config.learningMode = !config.learningMode;
    return config;
  }

  manageWafWhitelistCandidate(serviceInstanceWithWaf: ServiceInstance): void {
    this.router.navigate([
      '/pages/waf/tenant/id',
      serviceInstanceWithWaf.tenantId,
      'instance',
      'name',
      serviceInstanceWithWaf.name,
      'id',
      serviceInstanceWithWaf.id,
      'whitelist',
      'candidate'
    ]);
  }

  manageWafWhitelistFinal(serviceInstanceWithWaf: ServiceInstance): void {
    this.router.navigate([
      '/pages/waf/tenant/id',
      serviceInstanceWithWaf.tenantId,
      'instance',
      'name',
      serviceInstanceWithWaf.name,
      'id',
      serviceInstanceWithWaf.id,
      'whitelist',
      'stored'
    ]);
  }

  editWafConfiguration(serviceInstanceWithWaf: ServiceInstance): void {
    this.router.navigate([
      '/pages/waf/tenant/id',
      serviceInstanceWithWaf.tenantId,
      'instance',
      'name',
      serviceInstanceWithWaf.name,
      'id',
      serviceInstanceWithWaf.id,
      'edit'
    ]);
  }

  maybeDeleteWafConfiguration(serviceInstance: ServiceInstance): void {
    // const activeModal = this.modalService.open(WafDeleteConfigComponent, {size: 'lg'});
    // activeModal.componentInstance.serviceInstance = serviceInstance;
    // activeModal.result.then(() => this.deleteWafConfiguration(serviceInstance), () => {
    // });
  }

  deleteWafConfiguration(serviceInstance: ServiceInstance): void {
    const inProgressKey = `${serviceInstance.id}-delete`;
    this.requestStarted(inProgressKey);
    this.wafService.deleteWafConfiguration(serviceInstance)
      .subscribe(
        () => this.onDeleteWafConfigurationSuccess(inProgressKey, serviceInstance),
        () => this.onDeleteWafConfigurationError(inProgressKey)
      );
  }

  private onDeleteWafConfigurationSuccess(inProgressKey: string, serviceInstance): void {
    this.requestFinished(inProgressKey);
    // this.toastService
    //   .showSuccess('Success', 'WAF configuration has been deleted');
    this.removeFromArray(this.serviceInstancesWithWaf, serviceInstance);
    this.getServiceInstances();
  }

  private onDeleteWafConfigurationError(inProgressKey: string): void {
    this.requestFinished(inProgressKey);
    // this.toastService
    //   .showError('Error', 'We had a problem with deleting WAF configuration');
  }

  private removeFromArray(array: any[], value: any) {
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
    }
  }

  private requestStarted(action: string): void {
    this.status.inProgress[action] = true;
  }

  private requestFinished(action: string): void {
    this.status.inProgress[action] = false;
  }
}
