import {ElementRef, Directive} from "@angular/core";
import * as CIUtil from "./util";

@Directive({
  selector: "[ci-mdl]"
})
export class MDL {
  constructor(private _el: ElementRef) { }

  ngAfterViewInit() {
    CIUtil.upgradeMDL();
  }
}
