import {ElementRef, Directive} from 'angular2/core';

interface MDLHandler {
  upgradeElement(el: any): void;
}

declare var componentHandler: MDLHandler;

@Directive({
  selector: '[ci-mdl]'
})
export class MDL {
  constructor(el: ElementRef) {
    componentHandler.upgradeElement(el.nativeElement);
  }
}
