import { Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import * as lodash from 'lodash';
import { plural, PluralOptions } from 'easy-i18n-js';

@Directive({
  selector: '[plural]'
})
export class PluralDirective implements OnDestroy {

  @Input('plural')
  set plural(key: string) {
    if (key !== this.currentKey) {
      this.currentKey = key;

      this.render(true);
    }
  }

  @Input()
  set pluralValue(value: number) {
    if (value !== this.currentValue) {
      this.currentValue = value;

      this.render(true);
    }
  }

  @Input()
  set pluralNamespace(namespace: string) {
    if (namespace !== this.currentParams?.namespace) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        namespace
      };

      this.render(true);
    }
  }

  @Input()
  set pluralGender(gender: 'male' | 'female' | 'other') {
    if (gender !== this.currentParams?.gender) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        gender
      };

      this.render(true);
    }
  }

  @Input()
  set pluralArgs(args: string[]) {
    if (!lodash.isEqual(args, this.currentParams?.args)) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        args
      };

      this.render(true);
    }
  }

  @Input()
  set pluralNamedArgs(namedArgs: Record<string, string>) {
    if (!lodash.isEqual(namedArgs, this.currentParams?.namedArgs)) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        namedArgs
      };

      this.render(true);
    }
  }

  @Input('pluralName')
  set pluralName(name: string) {
    if (name !== this.currentParams?.name) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        name
      };

      this.render(true);
    }
  }

  @Input('pluralNumberFormatterFn')
  set pluralNumberFormatterFn(numberFormatterFn: (value: number) => string) {
    if (numberFormatterFn !== this.currentParams?.numberFormatterFn) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        numberFormatterFn
      };

      this.render(true);
    }
  }

  private currentKey?: string;

  private currentValue?: number;
  private lastValue?: number;

  private currentParams?: PluralOptions;
  private lastParams?: PluralOptions;

  private changes: MutationObserver;

  constructor(
    private el: ElementRef<HTMLElement>
  ) {
    this.changes = new MutationObserver(() => {
      this.render();
    });

    this.changes.observe(el.nativeElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  private render(paramsOnly = false): void {
    const nodes = this.el.nativeElement.childNodes;
    if (nodes.length > 0) {
      nodes.forEach((node: any) => {
        if (node.nodeType === 3) { // Seulement les node de type 3, text
          // Si une clef a été définie, on l'utilise
          if (this.currentKey) {
            this.updateValue(this.currentKey, node);
          } else {
            const content = this.getContent(node);
            let key: string | null = null;

            // Si le contenu actuel est différent de la valeur traduite, la clef a changé
            if (content !== node.currentValue) {
              key = content.trim();
              // On stocke la valeur originale qui doit ête la clef
              node.originalContent = content ?? node.originalContent;
            } else if (node.originalContent && paramsOnly) { // Le contenu actuel est la version traduite, si on a l'original
              // On prend la clef originale et on va vérifier si un paramètre a changé
              key = node.originalContent.trim();
            }
            if (key) {
              this.updateValue(key, node);
            }
          }
        }
      });
    }
  }

  private updateValue(key: string, node: any): void {
    if (!key) {
      return;
    }

    // Si rien n'a changé on arrête
    if (node.lastKey === key && this.currentValue === this.lastValue && this.lastParams === this.currentParams) {
      return;
    }

    node.lastKey = key;
    this.lastValue = this.currentValue;
    this.lastParams = this.currentParams;

    if (!node.originalContent) {
      node.originalContent = this.getContent(node);
    }

    const res = this.currentValue != null ? plural(key, this.currentValue, this.currentParams) : '';
    node.currentValue = res ?? node.originalContent ?? key;
    this.setContent(node, node.originalContent.replace(key, node.currentValue));
  }

  private getContent(node: any): string {
    return node.textContent != null ? node.textContent : node.data;
  }

  private setContent(node: any, content: string): void {
    if (node.textContent != null) {
      node.textContent = content;
    } else {
      node.data = content;
    }
  }
}
