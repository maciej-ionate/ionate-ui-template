import { Injectable } from '@angular/core';

@Injectable()
export class WafApi {

  readonly naxsiProxyUrl: string;

  constructor() {
    this.naxsiProxyUrl = 'https://k8-naxsi-demo.ionate.io';
  }
}
