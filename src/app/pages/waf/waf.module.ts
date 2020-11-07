import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { routedComponents, WafRoutingModule } from './waf-routing.module';
import { InstanceService } from './service/instance.service';
import { WafService } from './service/waf.service';
import { WafDeleteConfigComponent } from './config/delete/waf-delete-config.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { WafGenerateWhitelistComponent } from './whitelist/generate/waf-generate-whitelist.component';
import { WafViolationComponent } from './whitelist/violation/waf-violation.component';
import { HttpClientModule } from '@angular/common/http';
import { WafApi } from './waf-api';
import { NbCardModule } from '@nebular/theme';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NbCardModule,
    Ng2SmartTableModule,
    WafRoutingModule
  ],
  declarations: [
    ...routedComponents,
    WafDeleteConfigComponent,
    WafGenerateWhitelistComponent,
    WafViolationComponent,
  ],
  exports: [
    WafDeleteConfigComponent,
    WafGenerateWhitelistComponent,
  ],
  providers: [
    InstanceService,
    WafApi,
    WafService,
  ],
})
export class WafModule {
}
