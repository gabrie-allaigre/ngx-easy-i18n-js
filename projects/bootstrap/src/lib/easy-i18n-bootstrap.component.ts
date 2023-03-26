import { Component, ComponentRef, Inject, InjectionToken, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { tap } from 'rxjs/operators';
import { ComponentType } from '@angular/cdk/overlay';
import { EasyI18nService, LocaleStatus } from '@ngx-easy-i18n-js/core';

export const BOOTSTRAP = new InjectionToken<ComponentType<any>>('BOOTSTRAP');
export const LOADING_COMPONENT = new InjectionToken<ComponentType<any>>('LOADING_COMPONENT');

@Component({
  selector: 'ngx-easy-i18n',
  templateUrl: './easy-i18n-bootstrap.component.html'
})
export class EasyI18nBootstrapComponent implements OnInit, OnDestroy {

  @ViewChild(CdkPortalOutlet, { static: true })
  portalOutlet?: CdkPortalOutlet;

  localeStatus$?: Observable<LocaleStatus>;

  loadingPortal?: ComponentPortal<any> | null;

  private containerRef?: ComponentRef<any> | null;

  constructor(
    private injector: Injector,
    @Inject(BOOTSTRAP) private bootstrap: ComponentType<any>,
    @Inject(LOADING_COMPONENT) private loadingComponent: ComponentType<any>,
    private easyI18nService: EasyI18nService
  ) {
  }

  ngOnInit(): void {
    const injector = Injector.create({
      providers: [],
      parent: this.injector
    });
    this.loadingPortal = this.loadingComponent != null ?
      new ComponentPortal<any>(this.loadingComponent, undefined, injector) : null;

    const bootstrapPortal = new ComponentPortal<any>(this.bootstrap, undefined, injector);

    this.localeStatus$ = this.easyI18nService.localeStatus$.pipe(
      tap(res => {
        if (res === 'ready') {
          if (this.containerRef != null) {
            this.portalOutlet?.detach();
            this.containerRef = null;
          }
          this.containerRef = this.portalOutlet?.attachComponentPortal(bootstrapPortal);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.portalOutlet?.dispose();
  }
}