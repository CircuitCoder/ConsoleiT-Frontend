import {ElementRef, Directive} from 'angular2/core';

export interface MDLHandler {
  upgradeElement(el: any): void;
  upgradeDom(): void;
  upgradeDom(el: any): void;
}

declare var componentHandler: MDLHandler;

@Directive({
  selector: '[ci-mdl]'
})
export class MDL {
  constructor(private _el: ElementRef) { }
  
  ngAfterViewInit() {
    componentHandler.upgradeDom();
  }
}
