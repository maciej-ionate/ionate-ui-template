import { RouterModule, Routes } from '@angular/router';

import { WafComponent } from './waf.component';
import { NgModule } from '@angular/core';
import { WafNewConfigComponent } from './config/new/waf-new-config.component';
import { WafEditConfigComponent } from './config/edit/waf-edit-config.component';
import { WafWhitelistComponent } from './whitelist/stored/waf-whitelist.component';
import { WafWhitelistCandidateComponent } from './whitelist/candidate/waf-whitelist-candidate.component';

// noinspection TypeScriptValidateTypes
export const routes: Routes = [
  {
    path: '',
    component: WafComponent,
    children: [
      {
        path: 'tenant/id/:tenantId/instance/name/:name/id/:instanceId/new',
        component: WafNewConfigComponent
      },
      {
        path: 'tenant/id/:tenantId/instance/name/:name/id/:instanceId/edit',
        component: WafEditConfigComponent
      },
      {
        path: 'tenant/id/:tenantId/instance/name/:name/id/:instanceId/whitelist/candidate',
        component: WafWhitelistCandidateComponent
      },
      {
        path: 'tenant/id/:tenantId/instance/name/:name/id/:instanceId/whitelist/stored',
        component: WafWhitelistComponent
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WafRoutingModule {
}

export const routedComponents = [
  WafComponent,
  WafNewConfigComponent,
  WafEditConfigComponent,
  WafWhitelistCandidateComponent,
  WafWhitelistComponent
];
