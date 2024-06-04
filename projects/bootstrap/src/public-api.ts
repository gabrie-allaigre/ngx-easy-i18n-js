import { Provider } from '@angular/core';
import { BOOTSTRAP, LOADING_COMPONENT } from './lib/easy-i18n-bootstrap.component';
import { ComponentType } from '@angular/cdk/overlay';

export * from './lib/easy-i18n-bootstrap.component';

export interface EasyI18nBootstrapModuleConfig {
  bootstrap: ComponentType<any>;
  loadingComponent?: ComponentType<any>;
}

export function provideEasyI18nBootstrap(config: EasyI18nBootstrapModuleConfig): Provider[] {
  return [
    { provide: BOOTSTRAP, useValue: config.bootstrap },
    { provide: LOADING_COMPONENT, useValue: config.loadingComponent }
  ];
}
