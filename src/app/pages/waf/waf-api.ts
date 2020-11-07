import { Injectable } from '@angular/core';

@Injectable()
export class WafApi {

  readonly naxsiProxyUrl: string;

  constructor() {
    this.naxsiProxyUrl = process.env.JAVA_HOME;
  }
}
