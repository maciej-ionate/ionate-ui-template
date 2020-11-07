import { Component } from '@angular/core';
import { ServiceInstance } from '../../model/service-instance';
import { WhitelistCandidate } from '../model/whitelist-candidate';
import { LocalDataSource } from 'ng2-smart-table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { InstanceService } from '../../service/instance.service';
import { WafService } from '../../service/waf.service';
import { WhitelistCandidates } from '../model/whitelist-candidates';
import { Version } from '../../model/version';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { WafApi } from '../../waf-api';


@Component({
  selector: 'waf-configuration',
  styleUrls: ['./waf-whitelist-candidate.component.scss'],
  templateUrl: './waf-whitelist-candidate.component.html'
})
export class WafWhitelistCandidateComponent {

  static APPLY_WHITELIST_CANDIDATES: string = 'applyWhitelistCandidates';
  static GENERATE_WHITELIST_CANDIDATES: string = 'generateWhitelistCandidates';
  static LOAD_WHITELIST_CANDIDATES: string = 'loadWhitelistCandidates';
  static LOAD_WHITELIST_CANDIDATES_VERSION: string = 'loadWhitelistCandidatesVersions';

  selectedWhitelistVersion: Version;
  serviceInstance: ServiceInstance;
  whitelistCandidates: WhitelistCandidate[] = [];
  whitelistCandidateVersions: Version[] = [];

  source: LocalDataSource = new LocalDataSource();

  status = {
    inProgress: {
      applyWhitelistCandidates: false,
      generateWhitelistCandidates: false,
      loadWhitelistCandidates: false,
      loadWhitelistCandidatesVersions: false
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
      delete: true,
      position: 'right'
    },
    columns: {
      ruleName: {
        editable: false,
        title: 'Rule Name'
      },
      expression: {
        editable: false,
        title: 'Expression',
      },
      message: {
        editable: false,
        title: 'Message'
      },
      uri: {
        editable: false,
        title: 'Uri',
      },
      hits: {
        editable: false,
        title: 'Hits'
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
      .subscribe(serviceInstance => this.initialLoadWhitelistCandidatesVersions(serviceInstance));
  }

  private urlParamsToServiceInstance(params: Params): ServiceInstance {
    return {
      id: params['instanceId'],
      name: params['name'],
      tenantId: params['tenantId']
    };
  }

  initialLoadWhitelistCandidatesVersions(serviceInstance: ServiceInstance): void {
    this.loadWhitelistCandidatesVersionsImpl(serviceInstance)
      .subscribe(
        (versions) => this.onInitialLoadWhitelistCandidateVersionsSucceeded(versions),
        () => this.onLoadWhitelistCandidateVersionsFailed()
      );
  }

  private onInitialLoadWhitelistCandidateVersionsSucceeded(versions: Version[]) {
    this.requestFinished(WafWhitelistCandidateComponent.LOAD_WHITELIST_CANDIDATES_VERSION);
    this.whitelistCandidateVersions = versions;
    if (this.whitelistCandidateVersions.length === 0) {
      this.generateNewWhitelistCandidates();
    } else {
      this.selectedWhitelistVersion = this.whitelistCandidateVersions[this.whitelistCandidateVersions.length - 1];
    }
  }

  private loadWhitelistCandidatesVersionsImpl(serviceInstance: ServiceInstance): Observable<Version[]> {
    this.requestStarted(WafWhitelistCandidateComponent.LOAD_WHITELIST_CANDIDATES_VERSION);
    return this.wafService.getWhiteListCandidateVersions(serviceInstance);
  }

  loadWhitelistCandidatesVersions(serviceInstance: ServiceInstance): Observable<Version[]> {
    this.requestStarted(WafWhitelistCandidateComponent.LOAD_WHITELIST_CANDIDATES_VERSION);
    const observable: Observable<Version[]> = this.loadWhitelistCandidatesVersionsImpl(serviceInstance);
    observable.subscribe(
        (versions) => this.onLoadWhitelistCandidateVersionsSucceeded(versions),
        () => this.onLoadWhitelistCandidateVersionsFailed()
      );
    return observable;
  }

  private onLoadWhitelistCandidateVersionsSucceeded(versions: Version[]) {
    this.requestFinished(WafWhitelistCandidateComponent.LOAD_WHITELIST_CANDIDATES_VERSION);
    this.whitelistCandidateVersions = versions;
    if (this.whitelistCandidateVersions.length > 0) {
      this.selectedWhitelistVersion = this.whitelistCandidateVersions[this.whitelistCandidateVersions.length - 1];
    }
  }

  private onLoadWhitelistCandidateVersionsFailed() {
    this.requestFinished(WafWhitelistCandidateComponent.LOAD_WHITELIST_CANDIDATES_VERSION);
    // this.toastService.showError('Error', 'We had a problem with loading WAF whitelist versions');
  }

  loadWhitelistCandidates(serviceInstance: ServiceInstance,
                          whitelistVersion: Version) {
    this.requestStarted(WafWhitelistCandidateComponent.LOAD_WHITELIST_CANDIDATES);
    this.wafService.getWhiteListCandidates(serviceInstance, whitelistVersion)
      .subscribe(
        (whitelistCandidates) => this.onLoadWhitelistCandidatesSucceeded(whitelistCandidates.entries),
        () => this.onLoadWhitelistCandidatesFailed()
      );
  }

  private onLoadWhitelistCandidatesSucceeded(whitelistCandidates: WhitelistCandidate[]): void {
    this.requestFinished(WafWhitelistCandidateComponent.LOAD_WHITELIST_CANDIDATES);
    this.consumeWhitelistCandidates(whitelistCandidates);
  }

  private consumeWhitelistCandidates(whitelistCandidates: WhitelistCandidate[]): void {
    this.whitelistCandidates = whitelistCandidates;
    this.loadSmartTable(this.whitelistCandidates);
  }

  private loadSmartTable(whitelistCandidates: WhitelistCandidate[]): void {
    this.source.empty().then(() => this.source.load(whitelistCandidates));
  }

  private onLoadWhitelistCandidatesFailed() {
    this.requestFinished(WafWhitelistCandidateComponent.LOAD_WHITELIST_CANDIDATES);
    // this.toastService.showError('Error', 'We had a problem with loading WAF whitelist candidates');
  }

  prepareAndSaveWhitelistCandidates() {
    this.source.getElements().then(rows => {
      const whiteListCandidates = [];
      rows.forEach(element => whiteListCandidates.push(element));
      this.saveWhitelistCandidates(whiteListCandidates);
    });
  }

  saveWhitelistCandidates(whiteListCandidates: WhitelistCandidate[]) {
    this.requestStarted(WafWhitelistCandidateComponent.APPLY_WHITELIST_CANDIDATES);
    this.wafService.applyWhiteListCandidates(this.serviceInstance, whiteListCandidates)
      .subscribe(() => {
        this.requestFinished(WafWhitelistCandidateComponent.APPLY_WHITELIST_CANDIDATES);
        // this.toastService.showSuccess('Success', 'WAF whitelist has been saved');
      }, () => {
        this.requestFinished(WafWhitelistCandidateComponent.APPLY_WHITELIST_CANDIDATES);
        // this.toastService.showError('Error', 'We had a problem with saving WAF whitelist');
        this.goToWafConfigurations();
      });
  }

  generateNewWhitelistCandidates() {
    this.generateWhitelistCandidates(false);
  }

  generateAnotherWhitelistCandidates() {
    this.generateWhitelistCandidates(true);
  }

  private generateWhitelistCandidates(generateAnotherWhitelist: boolean): void {
    this.requestStarted(WafWhitelistCandidateComponent.GENERATE_WHITELIST_CANDIDATES);
    // const activeModal = this.modalService.open(WafGenerateWhitelistComponent, {size: 'lg'});
    // activeModal.componentInstance.config = {
    //   serviceInstance: this.serviceInstance,
    //   generateAnotherWhitelist
    // };
    // activeModal.result.then(
    //   (whitelistCandidates) => this.onWhitelistCandidatesGenerated(whitelistCandidates),
    //   () => this.onWhitelistCandidatesGenerationFailure()
    // );
  }

  private onWhitelistCandidatesGenerated(whitelistCandidates: WhitelistCandidates): void {
    if (whitelistCandidates.entries.length > 0) {
      this.loadWhitelistCandidatesVersions(this.serviceInstance)
        .subscribe(
          () => this.consumeGeneratedWhitelistCandidates(whitelistCandidates),
          () => this.consumeGeneratedWhitelistCandidates(whitelistCandidates)
        );
    } else {
      this.noWhitelistCandidatesGenerated();
    }
  }

  private noWhitelistCandidatesGenerated(): void {
    this.requestFinished(WafWhitelistCandidateComponent.GENERATE_WHITELIST_CANDIDATES);
    // this.toastService
    //   .showInfo('Information', `No whitelist candidates have been generated`);
  }

  private consumeGeneratedWhitelistCandidates(whitelistCandidates: WhitelistCandidates): void {
    this.requestFinished(WafWhitelistCandidateComponent.GENERATE_WHITELIST_CANDIDATES);
    this.consumeWhitelistCandidates(whitelistCandidates.entries);
    // this.toastService
    //   .showSuccess('Success', `${whitelistCandidates.entries.length} whitelist candidates has been generated`);
  }

  private onWhitelistCandidatesGenerationFailure() {
    this.requestFinished(WafWhitelistCandidateComponent.GENERATE_WHITELIST_CANDIDATES);
    // this.toastService.showError('Error', 'We had a problem with generating WAF whitelist candidates');
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
