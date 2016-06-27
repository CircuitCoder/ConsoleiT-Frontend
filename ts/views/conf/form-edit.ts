import {ElementRef, ViewChild, Component} from "@angular/core";
import {Router, RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {CICardView, CICard, CICardService} from "../../card";
import {CIFrameService} from "../../frame.service";
import {CIConfService} from "../../conf";
import {CINotifier} from "../../notifier";
import {MDL} from "../../mdl";
import {CIConfFormMetadata} from "../../data";

import {FORM_STATUS_MAP} from "./const";

@Component({
  template: require("html/view/conf/form-edit.html"),
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

export class CIConfFormEdit extends CICardView {

  formId: any;
  content: any[] = [];
  formStatus: string = "";
  formStatusStr: string = "";
  formName: string = "";

  meta: CIConfFormMetadata = {
    payment: false,
  };

  selected: any = null;
  selectedId: number = -1;
  selectedChoice: number = -1;

  indicators: any[] = [];

  selectedIndicator: any = null;
  selectedIndicatorId: number = -1;

  @ViewChild("choiceInput") choiceInput: ElementRef;

  constructor(_card: CICardService,
    params: RouteParams,
    private _router: Router,
    private _conf: CIConfService,
    private _frame: CIFrameService,
    private _notifier: CINotifier) {
      super(_card);
      this.formId = params.get("form");

      _frame.setFab({
        icon: "save",
        action: () => {
          this.submit();
        }
      });
    }

  routerOnActivate() {
    this._conf.getForm(this.formId, (res) => {
      this.content = res.content;
      this.indicators = res.indicators;
      this.meta = res.meta;
      this.formName = res.title;
      this.formStatus = res.status;

      if(res.status in FORM_STATUS_MAP) this.formStatusStr = FORM_STATUS_MAP[<string> res.status];
      else this.formStatusStr = res.status;
    });

    return super.routerOnActivate();
  }

  /* Editing - Field */

  select(i: number) {
    this.selectedChoice = -1;
    this.selectedId = i;
    if(i !== -1) {
      this.selected = this.content[i];
      this.selectIndicator(-1);
    }
  }

  pushField() {
    let newLen = this.content.push({
      type: "input"
    });

    this.select(newLen - 1);
  }

  deleteField(i: number) {
    if(this.selectedId === i) {
      this.selected = null;
      this.selectedId = -1;
      this.selectedChoice = -1;
    }

    this.content.splice(i, 1);
  }

  moveUp(i: number) {
    if(i === 0) return;
    let tmp = this.content[i];
    this.content[i] = this.content[i - 1];
    this.content[i - 1] = tmp;
  }

  moveDown(i: number) {
    if(i === this.content.length - 1) return;
    let tmp = this.content[i];
    this.content[i] = this.content[i + 1];
    this.content[i + 1] = tmp;
  }

  /* Editing - Choices */

  selectChoice(i: number) {
    this.selectedChoice = i;
  }

  pushChoice() {
    // TODO: merge
    //
    if(!Array.isArray(this.selected.choices)) this.selected.choices = [];

    this.selectedChoice = this.selected.choices.push({ title: "", disabled: false }) - 1;

    setTimeout(() => this.choiceInput.nativeElement.focus(), 0);
  }

  deleteChoice(i: number) {
    if(this.selectedChoice === i)
      this.selectedChoice = -1;
  }

  moveChoiceUp(i: number) {
    if(i === 0) return;
    let tmp = this.selected.choices[i];
    this.selected.choices[i] = this.selected.choices[i - 1];
    this.selected.choices[i - 1] = tmp;
  }

  moveChoiceDown(i: number) {
    if(i === this.selected.choices.length - 1) return;
    let tmp = this.selected.choices[i];
    this.selected.choices[i] = this.selected.choices[i + 1];
    this.selected.choices[i + 1] = tmp;
  }

  enableChoice(j: number, $event: any) {
    $event.stopPropagation();
    this.selected.choices[j].disabled = false;
  }

  disableChoice(j: number, $event: any) {
    $event.stopPropagation();
    this.selected.choices[j].disabled = true;
  }

  /* Editing - Indicators */

  selectIndicator(i: number) {
    this.selectedIndicatorId = i;
    if(i !== -1) {
      this.selectedIndicator = this.indicators[i];
      this.select(-1);
    }
  }

  pushIndicator() {
    let newLen = this.indicators.push({
      type: "Boolean",
    });

    this.selectIndicator(newLen - 1);
  }

  deleteIndicator(i: number) {
    if(this.selectedIndicatorId === i) {
      this.selectedIndicator = null;
      this.selectedIndicatorId = -1;
    }

    this.indicators.splice(i, 1);
  }

  moveIndicatorUp(i: number) {
    if(i === 0) return;
    let tmp = this.indicators[i];
    this.indicators[i] = this.indicators[i - 1];
    this.indicators[i - 1] = tmp;
  }

  moveIndicatorDown(i: number) {
    if(i === this.indicators.length - 1) return;
    let tmp = this.indicators[i];
    this.indicators[i] = this.indicators[i + 1];
    this.indicators[i + 1] = tmp;
  }

  /* Editing - Actions */

  submit() {
    this._conf.postForm(this.formId, {
      content: this.content,
      indicators: this.indicators,
      meta: this.meta,
      title: this.formName,
    }, res => {
      if(res.msg === "OperationSuccessful") {
        this._notifier.show("操作成功，您可能需要刷新浏览器才能看到效果");
      }
    });
  }

  /* Status - Actions */
  statusOpen() {
    this._conf.postFormStatus(this.formId, "open", (res: any) => {
      if(res.error)
        this._notifier.show(res.error);
      else {
        this._notifier.show(res.msg);
        this.formStatus = "open";
        this.formStatusStr = FORM_STATUS_MAP["open"];
      }
    });
  }

  statusClose() {
    this._conf.postFormStatus(this.formId, "close", (res: any) => {
      if(res.error)
        this._notifier.show(res.error);
      else {
        this._notifier.show(res.msg);
        this.formStatus = "closed";
        this.formStatusStr = FORM_STATUS_MAP["closed"];
      }
    });
  }

  statusArchive() {
    this._conf.postFormStatus(this.formId, "archive", (res: any) => {
      if(res.error)
        this._notifier.show(res.error);
      else {
        this._notifier.show(res.msg);
        this.formStatus = "archived";
        this.formStatusStr = FORM_STATUS_MAP["archived"];
      }
    });
  }

  statusDelete() {
    this._conf.deleteForm(this.formId, (res: any) => {
      if(res.error)
        this._notifier.show(res.error);
      else {
        this._notifier.show(res.msg);
        this._router.navigate(["Settings"]);
      }
    });
  }
}
