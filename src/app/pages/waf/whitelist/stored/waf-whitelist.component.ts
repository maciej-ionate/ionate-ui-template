import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LocalDataSource } from 'ng2-smart-table';
import { ServiceInstance } from '../../model/service-instance';
import { WafService } from '../../service/waf.service';
import { InstanceService } from '../../service/instance.service';
import { Version } from '../../model/version';
import { Whitelist, WhitelistEntry } from '../model/whitelist';
import { WafWhitelistViewModel } from './waf-whitelist.view-model';
import { WafViolationComponent } from '../violation/waf-violation.component';
import { WafApi } from '../../waf-api';
import { map } from 'rxjs/operators';

@Component({
  selector: 'waf-configuration',
  styleUrls: ['./waf-whitelist.component.scss'],
  templateUrl: './waf-whitelist.component.html'
})
export class WafWhitelistComponent {

  static LOAD_WHITELIST: string = 'loadWhitelist';
  static LOAD_WHITELIST_VERSIONS: string = 'loadWhitelistVersions';
  static PUSH_WHITELIST: string = 'pushWhitelist';

  serviceInstance: ServiceInstance;

  whitelist: Whitelist;

  selectedWhitelistVersion: Version;
  whitelistVersions: Version[] = [];

  source: LocalDataSource = new LocalDataSource();

  status = {
    inProgress: {
      loadWhitelist: false,
      loadWhitelistVersions: false,
      pushWhitelist: false
    }
  };

  settings = {
    actions: {
      add: false,
      custom: [
        {
          name: 'violation',
          title: 'Violation'
        }
      ],
      edit: false,
      delete: false,
      position: 'right'
    },
    columns: {
      name: {
        editable: false,
        title: 'Rule Name'
      },
      type: {
        editable: false,
        title: 'Rule Type',
      },
      value: {
        editable: false,
        title: 'Rule Value'
      }
    }
  };

  constructor(wafApi: WafApi,
              route: ActivatedRoute,
              instanceService: InstanceService,
              // private modalService: NgbModal,
              private router: Router,
              // private toastService: ToastService,
              private wafService: WafService) {
    this.serviceInstance = instanceService.emptyServiceInstance();
    route.params
      .pipe(
        map(params => this.serviceInstance = this.urlParamsToServiceInstance(params))
      )
      .subscribe(serviceInstance => this.loadWhitelistAppliedVersions(serviceInstance));
  }

  private urlParamsToServiceInstance(params: Params): ServiceInstance {
    return {
      id: params['instanceId'],
      name: params['name'],
      tenantId: params['tenantId']
    };
  }

  loadWhitelistAppliedVersions(serviceInstance: ServiceInstance) {
    this.requestStarted(WafWhitelistComponent.LOAD_WHITELIST_VERSIONS);
    this.wafService.getWhiteListVersions(serviceInstance)
      .subscribe(
        (whitelistAppliedVersions) => this.onLoadWhitelistAppliedVersionsSucceeded(whitelistAppliedVersions),
        () => this.onLoadWhitelistAppliedVersionsFailed());
  }

  private onLoadWhitelistAppliedVersionsSucceeded(whitelistAppliedVersions: Version[]) {
    this.requestFinished(WafWhitelistComponent.LOAD_WHITELIST_VERSIONS);
    this.whitelistVersions = whitelistAppliedVersions;
    if (this.whitelistVersions.length > 0) {
      this.selectedWhitelistVersion = this.whitelistVersions[this.whitelistVersions.length - 1];
    }
  }

  private onLoadWhitelistAppliedVersionsFailed() {
    this.requestFinished(WafWhitelistComponent.LOAD_WHITELIST_VERSIONS);
    // this.toastService.showError('Error', 'We had a problem with loading versions of WAF whitelists');
  }

  loadWhitelist(serviceInstance: ServiceInstance, whitelistVersion: Version) {
    this.requestStarted(WafWhitelistComponent.LOAD_WHITELIST);
    this.wafService.getWhiteList(serviceInstance, whitelistVersion)
      .subscribe(
        (whitelist) => this.onLoadWhitelistSucceeded(whitelist.whitelist),
        () => this.onLoadWhitelistFailed()
      );
  }

  private onLoadWhitelistSucceeded(whitelist: Whitelist): void {
    this.requestFinished(WafWhitelistComponent.LOAD_WHITELIST);
    this.whitelist = whitelist;
    this.loadSmartTable(whitelist.whitelistEntries);
  }

  private loadSmartTable(whitelistEntries: WhitelistEntry[]): void {
    const viewModels: WafWhitelistViewModel[] = this.whitelistEntriesToViewModel(whitelistEntries);
    this.source.empty().then(() => this.source.load(viewModels));
  }

  private whitelistEntriesToViewModel(whitelistEntries: WhitelistEntry[]): WafWhitelistViewModel[] {
    const viewModels: WafWhitelistViewModel[] = [];
    for (let i = 0; i < whitelistEntries.length; ++i) {
      viewModels.push(this.whitelistEntryToViewModel(whitelistEntries[i]));
    }
    return viewModels;
  }

  private whitelistEntryToViewModel(entry: WhitelistEntry): WafWhitelistViewModel {
    return {
      id: entry.id,
      name: entry.name,
      type: entry.mz.map(mz => mz.mzType).join(', '),
      value: entry.mz.map(mz => mz.value).join(', ')
    };
  }

  private onLoadWhitelistFailed() {
    this.requestFinished(WafWhitelistComponent.LOAD_WHITELIST);
    // this.toastService.showError('Error', 'We had a problem with loading WAF whitelist');
  }

  applySelectedWhitelist(serviceInstance: ServiceInstance, version: Version) {
    this.requestStarted(WafWhitelistComponent.PUSH_WHITELIST);
    this.wafService.applyWhitelist(serviceInstance, version)
      .subscribe(
        () => this.onApplySelectedWhitelistSucceeded(),
        () => this.onApplySelectedWhitelistFailed()
      );
  }

  private onApplySelectedWhitelistSucceeded() {
    this.requestFinished(WafWhitelistComponent.PUSH_WHITELIST);
    // this.toastService.showSuccess('Success', 'Selected WAF whitelist has been applied');
  }

  private onApplySelectedWhitelistFailed() {
    this.requestFinished(WafWhitelistComponent.PUSH_WHITELIST);
    // this.toastService.showError('Error', 'We had a problem with applying selected WAF whitelist');
  }

  onCustom(event) {
    // const activeModal = this.modalService.open(WafViolationComponent, {size: 'lg'});
    // activeModal.componentInstance.config = {
    //   serviceInstance: this.serviceInstance,
    //   ruleId: event.data.id
    // };
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
