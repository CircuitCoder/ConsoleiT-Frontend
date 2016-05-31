import {ElementRef, ViewChild, Component} from "@angular/core";
import {Router, RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {CICardView, CICard, CICardService} from "../../card";
import {CIFrameService} from "../../frame.service";
import {CIConfService} from "../../conf";
import {CINotifier} from "../../notifier";
import {MDL} from "../../mdl";

import {FORM_STATUS_MAP} from "./const";

@Component({
  template: require("html/view/conf/form-edit.html"),
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

export class CIConfFormEdit extends CICardView {

  formId: any;
  data: any;
  formStatus: string = "";
  formStatusStr: string = "";
  formName: string = "";

  selected: any = null;
  selectedId: number = -1;
  selectedChoice: number = -1;

  @ViewChild("choiceInput") choiceInput: ElementRef;

  constructor(_card: CICardService,
    params: RouteParams,
    private _router: Router,
    private _conf: CIConfService,
    private _frame: CIFrameService,
    private _notifier: CINotifier) {
      super(_card);
      this.formId = params.get("form");

      // TODO: formName
      this.data = [];

      _frame.setFab({
        icon: "save",
        action: () => {
          this.submit();
        }
      });
    }

  routerOnActivate() {
    this._conf.getForm(this.formId, (res) => {
      this.data = res.content;
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
    this.selected = this.data[i];
  }

  pushField() {
    let newLen = this.data.push({
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

    this.data.splice(i, 1);
  }

  moveUp(i: number) {
    if(i === 0) return;
    let tmp = this.data[i];
    this.data[i] = this.data[i - 1];
    this.data[i - 1] = tmp;
  }

  moveDown(i: number) {
    if(i === this.data.length - 1) return;
    let tmp = this.data[i];
    this.data[i] = this.data[i + 1];
    this.data[i + 1] = tmp;
  }

  /* Editing - Choices */

  selectChoice(i: number) {
    this.selectedChoice = i;
  }

  pushChoice() {
    if(!Array.isArray(this.selected.choices)) this.selected.choices = [];
    this.selectedChoice = this.selected.choices.push("") - 1;

    setTimeout(() => this.choiceInput.nativeElement.focus(), 0);
  }

  deleteChoice(i: number) {
    if(this.selectedChoice === i)
      this.selectedChoice = -1;

    this.selected.choices.splice(i, 1);
  }

  moveChoiceUp(i: number) {
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

  /* Editing - Actions */

  submit() {
    this._conf.postForm(this.formId, {
      content: this.data,
      title: this.formName
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
