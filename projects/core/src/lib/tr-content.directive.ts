import {
  AfterContentInit,
  ChangeDetectorRef,
  ContentChildren,
  Directive,
  Input,
  OnDestroy,
  QueryList,
  Renderer2,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { tr, TrOptions } from 'easy-i18n-js';
import * as lodash from 'lodash';

@Directive({
  selector: '[trElement]',
  standalone: true
})
export class TrElementDirective {

  @Input('trElement')
  public elementKey?: string;

  constructor(
    public readonly viewRef: ViewContainerRef,
    public readonly templateRef: TemplateRef<any>,
  ) {
  }
}

@Directive({
  selector: '[trContent]',
  standalone: true
})
export class TrContentDirective implements AfterContentInit, OnDestroy {

  @ContentChildren(TrElementDirective)
  private elements?: QueryList<TrElementDirective>;

  @Input('trContent')
  set trContent(key: string) {
    if (key !== this.currentKey) {
      this.currentKey = key;

      this.render();
    }
  }

  @Input()
  set trNamespace(namespace: string) {
    if (namespace !== this.currentParams?.namespace) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        namespace
      };

      this.render();
    }
  }

  @Input()
  set trGender(gender: 'male' | 'female' | 'other') {
    if (gender !== this.currentParams?.gender) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        gender
      };

      this.render();
    }
  }

  @Input()
  set trArgs(args: string[]) {
    if (!lodash.isEqual(args, this.currentParams?.args)) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        args
      };

      this.render();
    }
  }

  @Input()
  set trNamedArgs(namedArgs: Record<string, string>) {
    if (!lodash.isEqual(namedArgs, this.currentParams?.namedArgs)) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        namedArgs
      };

      this.render();
    }
  }

  @Input()
  set demarc(demarc: { start: string; end: string; }) {
    if (!lodash.isEqual(demarc, this._demarc)) {
      this.demarc = {
        ...this._demarc,
        ...demarc
      };

      this.render();
    }
  }

  private currentKey?: string;
  private currentParams?: TrOptions;

  private _demarc: { start: string; end: string; } = { start: '{', end: '}' };

  private subscription?: Subscription;

  constructor(
    private viewRef: ViewContainerRef,
    private renderer: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  ngAfterContentInit(): void {
    if (this.elements) {
      this.subscription = merge(
        new BehaviorSubject(this.elements.toArray()),
        this.elements.changes
      ).subscribe(next => this.render());
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private render(): void {
    if (this.elements == null || !this.currentKey || !this._demarc?.start || !this._demarc?.end) {
      return;
    }

    this.viewRef.clear();

    const childElements = this.viewRef.element.nativeElement.children;
    for (const child of childElements) {
      this.renderer.removeChild(this.viewRef.element.nativeElement, child);
    }
    this.viewRef.element.nativeElement.textContent = '';

    const raw = tr(this.currentKey, this.currentParams);

    let lastTokenEnd = 0;
    while (lastTokenEnd < raw.length) {
      const tokenStartDemarc = raw.indexOf(this._demarc?.start, lastTokenEnd);
      if (tokenStartDemarc < 0) {
        break;
      }
      const tokenStart = tokenStartDemarc + this._demarc?.start.length;
      const tokenEnd = raw.indexOf(this._demarc?.end, tokenStart);
      if (tokenEnd < 0) {
        throw new Error(`Encountered unterminated token in translation string '${this.currentKey}'`);
      }
      const tokenEndDemarc = tokenEnd + this._demarc?.end.length;

      const precedingText = raw.substring(lastTokenEnd, tokenStartDemarc);
      const precedingTextElement = this.renderer.createText(precedingText.replace(/ /g, '\u00A0'));
      this.renderer.appendChild(this.viewRef.element.nativeElement, precedingTextElement);

      const elementKey = raw.substring(tokenStart, tokenEnd);
      const embeddedElementTemplate = this.elements.toArray().find(element => element.elementKey === elementKey);
      if (embeddedElementTemplate) {
        const embeddedElementView = embeddedElementTemplate.viewRef.createEmbeddedView(embeddedElementTemplate.templateRef);
        this.renderer.appendChild(this.viewRef.element.nativeElement, embeddedElementView.rootNodes[0]);
      } else {
        const missingTokenText = raw.substring(tokenStartDemarc, tokenEndDemarc);
        const missingTokenElement = this.renderer.createText(missingTokenText);
        this.renderer.appendChild(this.viewRef.element.nativeElement, missingTokenElement);
      }

      lastTokenEnd = tokenEndDemarc;
    }

    const trailingText = raw.substring(lastTokenEnd);
    const trailingTextElement = this.renderer.createText(trailingText.replace(/ /g, '\u00A0'));
    this.renderer.appendChild(this.viewRef.element.nativeElement, trailingTextElement);

    this.changeDetectorRef.detectChanges();
  }
}
