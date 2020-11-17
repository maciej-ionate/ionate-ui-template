import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { ServiceInstance } from '../model/service-instance';
import { of } from 'rxjs';
import { WafApi } from '../waf-api';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class InstanceService {

  private baseUrl: string;

  constructor(private http: HttpClient,
              private wafApi: WafApi) {
    // this.baseUrl = `${wafApi.configUrl}/ionate-config/api/v1`;
  }

  getServiceInstances(): Observable<ServiceInstance[]> {
    const instance: ServiceInstance = {
      id: 'ef1536d8-66a9-427b-983a-66480dc7eafb',
      name: 'test-service-instance',
      tenantId: 'demo'
    };
    return of([instance]);
    // return this.http.get(`${this.baseUrl}/serviceinstances`);
  }

  emptyServiceInstance(): ServiceInstance {
    return {id: '', name: '', tenantId: ''};
  }
}
