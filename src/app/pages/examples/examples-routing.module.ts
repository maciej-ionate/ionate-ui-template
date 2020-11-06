import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ExampleComponent } from './example/example.component';
import { ExamplesComponent } from './examples.component';

const routes: Routes = [{
    path: '',
    component: ExamplesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'example',
      },
      {
        path: 'example',
        component: ExampleComponent,
      },
    ],
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExamplesRoutingModule {
}

export const routedComponents = [
  ExamplesComponent,
  ExampleComponent,
];
