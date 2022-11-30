import { Component, ComponentRef, Inject, InjectionToken, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { CdkPortalOutlet, ComponentPortal } from '@angular/cdk/portal';
import { tap } from 'rxjs/operators';
import { ComponentType } from '@angular/cdk/overlay';
import { EasyI18nService, LocaleStatus } from '@ngx-easy-i18n-js/core';

export const BOOTSTRAP = new InjectionToken<ComponentType<any>>('BOOTSTRAP');
export const LOADING_COMPONENT = new InjectionToken<ComponentType<any>>('LOADING_COMPONENT');

@Component({
  selector: 'app-easy-i18n',
  template: `
      <ng-template cdkPortalOutlet></ng-template>
      <ng-container *ngIf="localeStatus$ | async as localeStatus">
          <div *ngIf="localeStatus === 'loading'"
               style="pointer-events: none; position: absolute; top: 0; left: 0; bottom: 0; right: 0; z-index: 10000;">
              <div style="display: grid; height: 100vh; place-content: center; background-color: #FFFFFF77">
                  <div class="display-4">Loading languages...</div>
                  <div class="text-center">
                      <i class="fad fa-spin fa-tire fa-4x" aria-hidden="true"></i>
                  </div>
              </div>
          </div>
      </ng-container>
  `,
  styles: [`

  `]
})
export class EasyI18nBootstrapComponent implements OnInit, OnDestroy {

  @ViewChild(CdkPortalOutlet, { static: true })
  portalOutlet?: CdkPortalOutlet;

  localeStatus$?: Observable<LocaleStatus>;

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
    const containerPortal = new ComponentPortal<any>(this.bootstrap, undefined, injector);

    this.localeStatus$ = this.easyI18nService.localeStatus$.pipe(
      tap(res => {
        if (res === 'ready') {
          if (this.containerRef != null) {
            this.portalOutlet?.detach();
            this.containerRef = null;
          }
          this.containerRef = this.portalOutlet?.attachComponentPortal(containerPortal);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.portalOutlet?.dispose();
  }
}