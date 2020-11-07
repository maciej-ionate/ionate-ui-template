import { Injectable } from '@angular/core';
import { ServiceInstance } from '../model/service-instance';
import { Observable } from 'rxjs/Observable';
import { WafConfiguration } from '../model/waf-configuration';
import { WhitelistCandidates } from '../whitelist/model/whitelist-candidates';
import { WhitelistCandidate } from '../whitelist/model/whitelist-candidate';
import { WafCheckrule } from '../model/waf-checkrule';
import { WafRule } from '../model/waf-rule';
import { Version } from '../model/version';
import { WhitelistContainer } from '../whitelist/model/whitelist-container';
import { Violation } from '../whitelist/model/violation';
import { HttpClient } from '@angular/common/http';
import { WafApi } from '../waf-api';

@Injectable()
export class WafService {

  private baseUrl: string;

  constructor(private wafApi: WafApi,
              private http: HttpClient) {
    this.baseUrl = `${wafApi.naxsiProxyUrl}/v1`;
    // tslint:disable-next-line:no-console
    console.log(`${wafApi.naxsiProxyUrl}`);
  }

  getWafCheckRuleTemplates(): Observable<WafCheckrule[]> {
    return this.http.get<WafCheckrule[]>(`${this.baseUrl}/templates/checkrules`);
  }

  getWafRuleTemplates(): Observable<WafRule[]> {
    return this.http.get<WafRule[]>(`${this.baseUrl}/templates/rules`);
  }

  saveWafConfiguration(si: ServiceInstance, configuration: WafConfiguration): Observable<any> {
    return this.http.post(`${this.baseUrl}/services/${si.tenantId}/${si.id}`, configuration);
  }

  updateWafConfiguration(si: ServiceInstance, configuration: WafConfiguration): Observable<any> {
    return this.http.put(`${this.baseUrl}/services/${si.tenantId}/${si.id}`, configuration);
  }

  deleteWafConfiguration(si: ServiceInstance): Observable<any> {
    return this.http.delete(`${this.baseUrl}/services/${si.tenantId}/${si.id}`);
  }

  getWafConfigurationForServiceInstance(tenantId: string,
                                        serviceInstances: ServiceInstance[]): Observable<WafConfiguration[]> {
    const serviceIds = serviceInstances.map(si => si.id);
    return this.http.post<WafConfiguration[]>(`${this.baseUrl}/services/${tenantId}`, serviceIds);
  }

  getAllWafConfigurations(tenantId: string): Observable<WafConfiguration[]> {
    return this.http.get<WafConfiguration[]>(`${this.baseUrl}/services/${tenantId}`);
  }

  getWafConfiguration(serviceInstance: ServiceInstance): Observable<WafConfiguration> {
    return this.http
      .get<WafConfiguration>(`${this.baseUrl}/services/${serviceInstance.tenantId}/${serviceInstance.id}`);
  }

  getWhiteListCandidateVersions(serviceInstance: ServiceInstance): Observable<Version[]> {
    const url: string = `${this.baseUrl}/whitelists/candidate/${serviceInstance.tenantId}/${serviceInstance.id}/versions`;
    return this.http.get<Version[]>(url);
  }

  getWhiteListCandidates(serviceInstance: ServiceInstance,
                         version: Version): Observable<WhitelistCandidates> {
    const url: string = `${this.baseUrl}/whitelists/candidate/${serviceInstance.tenantId}/${serviceInstance.id}/${version.value}`;
    return this.http.get<WhitelistCandidates>(url);
  }

  getViolation(serviceInstance: ServiceInstance, ruleId: string): Observable<Violation> {
    const url: string = `${this.baseUrl}/search/events/get/${serviceInstance.tenantId}/${serviceInstance.id}/${ruleId}`;
    return this.http.get<Violation>(url);
  }

  generateWhiteListCandidates(serviceInstance: ServiceInstance): Observable<WhitelistCandidates> {
    const url: string = `${this.baseUrl}/whitelists/candidate/generate/${serviceInstance.tenantId}/${serviceInstance.id}`;
    return this.http.post<WhitelistCandidates>(url, null);
  }

  applyWhiteListCandidates(serviceInstance: ServiceInstance,
                           whiteListCandidates: WhitelistCandidate[]) {
    const body = {
      rulesIds: whiteListCandidates.map(candidate => candidate.id),
    };
    return this.http.post(
      `${this.baseUrl}/whitelists/candidate/apply/${serviceInstance.tenantId}/${serviceInstance.id}`,
      body
    );
  }

  getWhiteList(serviceInstance: ServiceInstance, version: Version): Observable<WhitelistContainer> {
    const url: string = `${this.baseUrl}/whitelists/applied/${serviceInstance.tenantId}/${serviceInstance.id}/${version.value}`;
    return this.http.get<WhitelistContainer>(url);
  }

  getWhiteListVersions(serviceInstance: ServiceInstance): Observable<Version[]> {
    const url: string = `${this.baseUrl}/whitelists/applied/${serviceInstance.tenantId}/${serviceInstance.id}/versions`;
    return this.http.get<Version[]>(url);
  }

  applyWhitelist(serviceInstance: ServiceInstance, version: Version): Observable<any> {
    const url: string = `${this.baseUrl}/whitelists/applied/push/${serviceInstance.tenantId}/${serviceInstance.id}/${version.value}`;
    return this.http.put(url, null);
  }
}
