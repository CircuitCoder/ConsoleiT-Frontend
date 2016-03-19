import {ElementRef, Directive} from 'angular2/core';

export interface MDLHandler {
  upgradeElements(el: any): void;
  upgradeDom(): void;
  downgradeElements(el: any): void;
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
