import { ModuleWithProviders, NgModule } from '@angular/core';
import { BOOTSTRAP, EasyI18nBootstrapComponent, LOADING_COMPONENT } from './lib/easy-i18n-bootstrap.component';
import { ComponentType } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';

export * from './lib/easy-i18n-bootstrap.component';

export interface EasyI18nBootstrapModuleConfig {
  bootstrap: ComponentType<any>;
  loadingComponent?: ComponentType<any>;
}

@NgModule({
  imports: [
    CommonModule,
    PortalModule
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
