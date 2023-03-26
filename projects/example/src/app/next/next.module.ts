import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NextRoutingModule } from './next-routing.module';
import { NextComponent } from './next.component';


@NgModule({
  declarations: [
    NextComponent
  ],
  imports: [
    CommonModule,
    NextRoutingModule
  ]
})
export class NextModule { }
