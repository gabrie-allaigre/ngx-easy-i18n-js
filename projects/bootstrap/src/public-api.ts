import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BOOTSTRAP, EasyI18nBootstrapComponent, LOADING_COMPONENT } from './lib/easy-i18n-bootstrap.component';
import { PortalModule } from '@angular/cdk/portal';
import { ComponentType } from '@angular/cdk/overlay';
import { EasyI18nModule } from '@ngx-easy-i18n-js/core';

export * from './lib/easy-i18n-bootstrap.component';

export interface EasyI18nBootstrapModuleConfig {
  bootstrap: ComponentType<any>;
  loadingComponent?: ComponentType<any>;
}

@NgModule({
  imports: [
    CommonModule,
    PortalModule,
    EasyI18nModule
  ],
  declarations: [
    EasyI18nBootstrapComponent
  ],
  exports: [
    EasyI18nBootstrapComponent
  ]
})
export class EasyI18nBootstrapModule {

  static forRoot(config: EasyI18nBootstrapModuleConfig): ModuleWithProviders<EasyI18nBootstrapModule> {
    return {
      ngModule: EasyI18nBootstrapModule,
      providers: [
        { provide: BOOTSTRAP, useValue: config.bootstrap },
        { provide: LOADING_COMPONENT, useValue: config.loadingComponent }
      ]
    };
  }
}
