import { Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import * as lodash from 'lodash';
import { tr, TrOptions } from 'easy-i18n-js';

@Directive({
  selector: '[tr]'
})
export class TrDirective implements OnDestroy {

  @Input()
  set trKey(key: string) {
    if (key !== this.currentKey) {
      this.currentKey = key;

      this.render(true);
    }
  }

  @Input()
  set trNamespace(namespace: string) {
    if (namespace !== this.currentParams?.namespace) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        namespace
      };

      this.render(true);
    }
  }

  @Input()
  set trGender(gender: 'male' | 'female' | 'other') {
    if (gender !== this.currentParams?.gender) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        gender
      };

      this.render(true);
    }
  }

  @Input()
  set trArgs(args: string[]) {
    if (!lodash.isEqual(args, this.currentParams?.args)) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        args
      };

      this.render(true);
    }
  }

  @Input()
  set trNamedArgs(namedArgs: Record<string, string>) {
    if (!lodash.isEqual(namedArgs, this.currentParams?.namedArgs)) {
      this.currentParams = {
        ...(this.currentParams ?? {}),
        namedArgs
      };

      this.render(true);
    }
  }

  private currentKey?: string;

  private currentParams?: TrOptions;
  private lastParams?: TrOptions;

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
    const nodes: NodeList = this.el.nativeElement.childNodes;

    nodes.forEach((node: any) => {
      if (node.nodeType === 3) { // Seulement les node de type 3, text
        if (node.lookupKey != null) {
          this.updateValue(node.lookupKey, node);
        } else if (this.currentKey != null) {
          this.updateValue(this.currentKey, this.el.nativeElement);
        } else {
          let key: string | null = null;
          const content = this.getContent(node);
          node.lookupKey = content.trim();

          // Si le contenu actuel est différent de la valeur traduite, la clef a changé
          if (content !== node.currentValue) {
            key = node.lookupKey;
            // On stocke la valeur originale qui doit ête la clef
            node.originalContent = content ?? node.originalContent;
          } else if (node.originalContent && paramsOnly) { // Le contenu actuel est la version traduite, si on a l'original
            // On prend la clef originale et on va vérifier si un paramètre a changé
            key = node.originalContent.trim();
          }

          this.updateValue(key, node);
        }
      }
    });
  }

  private updateValue(key: string | null, node: any): void {
    if (!key) {
      return;
    }

    // Si rien n'a changé on arrête
    if (node.lastKey === key && this.lastParams === this.currentParams) {
      return;
    }

    node.lastKey = key;
    this.lastParams = this.currentParams;

    if (!node.originalContent) {
      node.originalContent = this.getContent(node);
    }

    const res = tr(key, this.currentParams);

    if (this.currentKey && res === key) {
      return;
    }

    node.currentValue = res ?? node.originalContent ?? key;
    this.setContent(node, this.currentKey ? node.currentValue : node.originalContent.replace(key, node.currentValue));
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
