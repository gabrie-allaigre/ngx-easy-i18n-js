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
               style="pointer-events: all; position: absolute; top: 0; left: 0; bottom: 0; right: 0; z-index: 10000;">
              <ng-container *ngIf="loadingPortal; else defaultLoadingTemplate">
                  <ng-template [cdkPortalOutlet]="loadingPortal"></ng-template>
              </ng-container>
              <ng-template #defaultLoadingTemplate>
                  <div style="display: grid; height: 100vh; place-content: center; background-color: #FFFFFF77">
                      <div style="font-weight: 300; font-size: 3.5rem; line-height: 1.2;">Loading languages...</div>
                      <div style="text-align: center;">
                          <svg xmlns="http://www.w3.org/2000/svg"
                               style="margin: auto; background: rgba(0, 0, 0, 0); display: block; shape-rendering: auto;" width="100px"
                               height="100px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                              <rect x="19" y="19" width="20" height="20" rx="5" ry="5" fill="#1d3f72">
                                  <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s"
                                           repeatCount="indefinite" begin="0s" calcMode="discrete"></animate>
                              </rect>
                              <rect x="40" y="19" width="20" height="20" rx="5" ry="5" fill="#1d3f72">
                                  <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s"
                                           repeatCount="indefinite" begin="0.125s" calcMode="discrete"></animate>
                              </rect>
                              <rect x="61" y="19" width="20" height="20" rx="5" ry="5" fill="#1d3f72">
                                  <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s"
                                           repeatCount="indefinite" begin="0.25s" calcMode="discrete"></animate>
                              </rect>
                              <rect x="19" y="40" width="20" height="20" rx="5" ry="5" fill="#1d3f72">
                                  <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s"
                                           repeatCount="indefinite" begin="0.875s" calcMode="discrete"></animate>
                              </rect>
                              <rect x="61" y="40" width="20" height="20" rx="5" ry="5" fill="#1d3f72">
                                  <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s"
                                           repeatCount="indefinite" begin="0.375s" calcMode="discrete"></animate>
                              </rect>
                              <rect x="19" y="61" width="20" height="20" rx="5" ry="5" fill="#1d3f72">
                                  <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s"
                                           repeatCount="indefinite" begin="0.75s" calcMode="discrete"></animate>
                              </rect>
                              <rect x="40" y="61" width="20" height="20" rx="5" ry="5" fill="#1d3f72">
                                  <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s"
                                           repeatCount="indefinite" begin="0.625s" calcMode="discrete"></animate>
                              </rect>
                              <rect x="61" y="61" width="20" height="20" rx="5" ry="5" fill="#1d3f72">
                                  <animate attributeName="fill" values="#5699d2;#1d3f72;#1d3f72" keyTimes="0;0.125;1" dur="1s"
                                           repeatCount="indefinite" begin="0.5s" calcMode="discrete"></animate>
                              </rect>
                          </svg>
                      </div>
                  </div>
              </ng-template>
          </div>
      </ng-container>
  `
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