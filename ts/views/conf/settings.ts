import {ElementRef, ViewChild, Component} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {CICardView, CICard, CICardService} from "../../card";
import {CIFrameService} from "../../frame.service";
import {CIConfService, CIConfCommitteeSpec} from "../../conf";
import {CILoginService} from "../../login";
import {CINotifier} from "../../notifier";
import {MDL} from "../../mdl";

import {FORM_STATUS_MAP} from "./const";

import "codemirror/mode/gfm/gfm.js";
import * as CodeMirror from "codemirror";

@Component({
  template: require("html/view/conf/settings.html"),
  directives: [MDL, CICard, ROUTER_DIRECTIVES]
})

export class CIConfSettings extends CICardView {

  conf: any;
  memberMap: any;
  settings: any;
  forms: any = [];
  committees: CIConfCommitteeSpec[] = [];

  formId: string = "";
  formTitle: string = "";
  formCreation: boolean = false;
  formDialogCreated: boolean = false;
  formCreating: boolean = false;

  committeeId: string = "";
  committeeTitle: string = "";
  committeeCreation: boolean = false;
  committeeDialogCreated: boolean = false;
  committeeCreating: boolean = false;

  @ViewChild("descArea") descArea: ElementRef;

  descMirror: CodeMirror.Editor= null;

  constructor(
    _card: CICardService,
    _frame: CIFrameService,
    private _router: Router,
    private _notifier: CINotifier,
    private _login: CILoginService,
    private _conf: CIConfService) {
      super(_card);
      this.conf = _conf.getConf();
      this.memberMap = _conf.getMemberMap();

      this.settings = {
        title: this.conf.title,
        desc: this.conf.desc,
        currentStage: this.conf.currentStage,
      };

      _frame.setFab(null);
    }

  ngAfterViewInit() {
    Promise.all([
      new Promise((resolve, reject) => {
        this._conf.getAllForms((forms: any) => {
          this.forms = forms;
          resolve();
        });
      }),
      new Promise((resolve, reject) => {
        this._conf.getAllCommittees(comms => {
          this.committees = comms;
          resolve();
        });
      })
    ]).then(() => {
      super.ngAfterViewInit();
    }).catch(e => {
      throw e;
    });

    this.descMirror = CodeMirror.fromTextArea(this.descArea.nativeElement, {
      mode: "gfm",
      theme: "material",
      lineWrapping: true,
      lineNumbers: true,
    });
  }

  routerOnDeactivate() {
    if(!this.formCreation) {
      return new Promise((resolve, reject) => {
        // Hide dialog
        this.formDialogCreated = false;
        this.committeeDialogCreated = false;

        setTimeout(() => super.routerOnDeactivate().then(resolve, reject), 0);
      });
    } else {
      this.formCreation = false;
      return super.routerOnDeactivate();
    }
  }

  updateSettings() {
    this.settings.desc = this.descMirror.getValue();
    this._conf.postSettings(this.conf._id, { settings: this.settings }, res => {
      if(res.msg) this._notifier.show("更新成功, 您可能需要刷新才能看到效果");
    });
  }

  /**
   * Forms
   */

  getFormStatus(id: string) {
    if(id in FORM_STATUS_MAP) return FORM_STATUS_MAP[id];
    else return id;
  }

  showFormCreation() {
    this.formDialogCreated = true;
    setTimeout(() => this.formCreation = true, 0);
  }

  closeFormCreation(event: any) {
    if(event.target.className.indexOf("dialog-overlap") !== -1)
      this.formCreation = false;
  }

  performFormCreation() {
    /* Check id */
    if(this.formId.length === 0) {
      this._notifier.show("非法 ID");
      return;
    }

    for(let i = 0; i < this.formId.length; ++i) {
      let charCode = this.formId.charCodeAt(i);
      if(!((charCode < 123 && charCode > 96) || charCode === 45 || (charCode < 58 && charCode > 47))) {
        this._notifier.show("非法 ID");
        return;
      }
    }

    this.formCreating = true;
    this._conf.createForm(this.formId, this.formTitle, (res: any) => {
      if(res.error === "DuplicatedId") {
        this._notifier.show("重复 ID");
        this.formCreating = false;
      }
      else {
        // On deactivate will remove formCreation flag
        this._router.navigate(["FormEdit", { form: res.id }]);
      }
    });
  }

  /**
   * Committees
   */

  showCommitteeCreation() {
    this.committeeDialogCreated = true;
    setTimeout(() => this.committeeCreation = true, 0);
  }

  closeCommitteeCreation(event: any) {
    if(event.target.className.indexOf("dialog-overlap") !== -1)
      this.committeeCreation = false;
  }

  performCommitteeCreation() {
    /* Check id */
    if(this.committeeId.length === 0) {
      this._notifier.show("非法 ID");
      return;
    }

    for(let i = 0; i < this.committeeId.length; ++i) {
      let charCode = this.committeeId.charCodeAt(i);
      if(!((charCode < 123 && charCode > 96) || charCode === 45 || (charCode < 58 && charCode > 47))) {
        this._notifier.show("非法 ID");
        return;
      }
    }

    this.committeeCreating = true;
    this._conf.createCommittee(this.committeeId, this.committeeTitle, (res: any) => {
      if(res.error === "DuplicatedId") {
        this._notifier.show("重复 ID");
        this.committeeCreating = false;
      }
      else {
        this._conf.getAllCommittees(comms => {
          this.committees = comms;
          this.committeeCreation = false;
          this.committeeCreating = false;
        });
      }
    });
  }

  canModify(conf: any) {
    let userId = this._login.getUser()._id;
    return conf.admins && conf.admins.indexOf(userId) !== -1;
  }

  canView(conf: any) {
    let userId = this._login.getUser()._id;
    if(conf.admins && conf.admins.indexOf(userId) !== -1) return true;
    else if(conf.moderators && conf.moderators.indexOf(userId) !== -1) return true;
    else if(conf.viewers && conf.viewers.indexOf(userId) !== -1) return true;
    else return false;
  }

  jumpTo(anchor: string) {
    let elem = document.getElementById(anchor);
    elem.scrollIntoView();
  }
}
