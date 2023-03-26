import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NextComponent } from './next.component';

const routes: Routes = [{
  path: '', component: NextComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NextRoutingModule {
}
