import { NgModule } from '@angular/core';
import { ExamplesRoutingModule, routedComponents } from './examples-routing.module';
import { NbCardModule } from '@nebular/theme';

@NgModule({
  imports: [
    NbCardModule,
    ExamplesRoutingModule,
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class ExamplesModule {
}
