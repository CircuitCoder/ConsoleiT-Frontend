import {ElementRef, ViewChild, Component} from "@angular/core";
import {CanDeactivate, Router, RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {CICardView, CICard, CICardService} from "../../card";
import {CIFrameService} from "../../frame.service";
import {CIConfService} from "../../conf";
import {CILoginService} from "../../login";
import {CINotifier} from "../../notifier";
import {MDL} from "../../mdl";

import {CIConfFormMetadata} from "../../data";

import * as CIUtil from "../../util";

@Component({
  template: require("html/view/conf/application.html"),
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

export class CIConfApplication extends CICardView implements CanDeactivate {

  formId: any;
  formName: string;
  form: any[] = [];
  formMeta: CIConfFormMetadata = null;

  userId: number;
  operatorId: number;

  role: string;
  canModify: boolean;
  canModerate: boolean;

  data: any = {};
  istatus: any = null; // TODO: interface
  savedData: any;
  locked: boolean;
  new: boolean;
  status: string;

  registrants: any;

  showModerator: boolean;
  moderatorNote: string;

  @ViewChild("importer") importer: ElementRef;

  constructor(_card: CICardService,
    params: RouteParams,
    private _frame: CIFrameService,
    private _router: Router,
    private _conf: CIConfService,
    private _login: CILoginService,
    private _notifier: CINotifier) {
      super(_card);
      this.userId = +params.get("uid");
      this.formId = params.get("form");
      this.operatorId = _login.getUser()._id;

      let formDesc = _conf.getFormDesc(this.formId);
      if(!formDesc) {
        _notifier.show("$Unknown");
        return this;
      }

      this.role = formDesc.role;
      this.formName = formDesc.title;

      this.canModerate = this.role === "admin" || this.role === "moderator";

      if(this.role === "admin")  this.canModify = true;
      else this.canModify = this.operatorId === this.userId;

      if(this.role === "admin") {
        this.registrants = this._conf.getRegistrants();
        if(!this.registrants) { // Directly routed to this page
          this._conf.getFormResults(this.formId, (res) => {
            this._conf.registerFormResults(res);
            this.registrants = this._conf.getRegistrants();
          });
        }
      }

      if(this.canModerate) {
        _frame.setFab({
          icon: "bookmark",
          action: () => {
            this.showModerator = !this.showModerator ;
          }
        });
      } else {
        _frame.setFab(null);
      }

      if(this.canModerate) {
        _conf.getNote(this.formId, this.userId, (note) => {
          this.moderatorNote = note;
        });
      }

      this.showModerator = false;
    }

  routerOnActivate() {
    let formPromise = new Promise((resolve, reject) => {
      this._conf.getForm(this.formId, (form) => {
        resolve(form);
      });
    });

    let resultPromise = new Promise((resolve, reject) => {
      this._conf.getFormResult(this.formId, this.userId, (data) => {
        resolve(data);
      });
    });

    Promise.all([formPromise, resultPromise]).then((results: any[]) => {
      this.form = results[0].content;
      this.formMeta = results[0].meta;
      this.role = results[0].role;
      this.status = results[0].status;
      this.formName = results[0].title;
      return results[1];
    }).then((data: any) => {
      this.form.forEach((e: any, i: number) => {
        if(e.type === "checkbox" && !data.submission[i]) data.submission[i] = {};
      });

      this.data = data.submission;
      this.istatus = data.internalStatus;
      this.locked = data.locked;
      this.new = data.new;
      this.status = data.status;

      this.savedData = CIUtil.deepClone(this.data);
    });

    window.onbeforeunload = () => {
      if(this.isDataDifferent(this.savedData, this.data)) return "请确认已保存";
      else return null;
    };

    return super.routerOnActivate();
  }

  routerOnDeactivate() {
    window.onbeforeunload = function() { };
    return super.routerOnDeactivate();
  }

  routerCanDeactivate() {
    if(this.isDataDifferent(this.savedData, this.data)) return confirm("请确认已保存");
    else return true;
  }

  submit() {
    /* Check for required fields */
    let invalids: any = [];

    this.form.forEach((e: any, i: any) => {
      if(e.required) {
        if(e.type === "checkbox") {
          let flag = false;
          for(let field in this.data[i]) if(this.data[i][field]) flag = true;
          if(!flag) invalids.push(i + 1);
        } else {
          if(!(i in this.data) || this.data[i] === null || this.data[i] === undefined || this.data[i] === "") invalids.push(i + 1);
        }
      }
    });

    if(invalids.length > 0) this._notifier.show(`非法字段: ${invalids.join(", ")}`);
    else {
      this._conf.postApplication(this.formId, this.userId, this.data, (res) => {
        if(res.msg === "OperationSuccessful") {
          this._notifier.show(res.msg);
          this.status = "审核中";
        } else if(res.error) this._notifier.show(res.error);
      });
    }
  }

  lock() {
    this._conf.lockFormResult(this.formId, this.userId, (res) => {
      if(res.error) this._notifier.show(res.error);
      else {
        this._notifier.show(res.msg);
        this.locked = true;
      }
    });
  }

  unlock() {
    this._conf.unlockFormResult(this.formId, this.userId, (res) => {
      if(res.error) this._notifier.show(res.error);
      else {
        this._notifier.show(res.msg);
        this.locked = false;
      }
    });
  }

  saveNote() {
    this._conf.postNote(this.formId, this.userId, this.moderatorNote, () => {
      this._notifier.show("OperationSuccessful");
    });
  }

  exportForm() {
    try {
      CIUtil.saveFile(this.formName, [CIUtil.exportForm(this.form, this.data, this.formName)]);
    } catch(e) {
      this._notifier.show("抱歉，您所使用的浏览区不支持导出");
    }
  }

  showImportForm() {
    let e = new Event("click");
    this.importer.nativeElement.dispatchEvent(e);
  }

  importForm() {
    let fr = new FileReader();

    fr.onerror = () => {
      this._notifier.show("加载失败");
    };

    fr.onload = () => {
      this.data = CIUtil.parseForm(this.form, fr.result);
      this._notifier.show("导入成功");
    };

    let file = this.importer.nativeElement.files[0];
    fr.readAsText(file);
  }

  private isDataDifferent(dataA: any[], dataB: any[]) {
    return !this.form.reduce((prev: boolean, field: any, index: number) => {
      if(!prev) {
        console.log("ALREADY DIFFERENT: %d", index);
        return false;
      }
      else if(field.type === "title") return true;
      else if(field.type === "checkbox") {
        let selectedA: boolean[] = [];
        let selectedB: boolean[] = [];
        if(dataA[index] === undefined) {
          for(let i = 0; i < field.choices.length; ++i) selectedA[i] = false;
        } else {
          for(let i = 0; i < field.choices.length; ++i) selectedA[i] = i in dataA[index] && dataA[index][i];
        }

        if(dataB[index] === undefined) {
          for(let i = 0; i < field.choices.length; ++i) selectedB[i] = false;
        } else {
          for(let i = 0; i < field.choices.length; ++i) selectedB[i] = i in dataB[index] && dataB[index][i];
        }

        for(let i = 0; i < field.choices.length; ++i) if(selectedA[i] !== selectedB[i]) return false;
        return true;
      } else if(field.type === "radio") {
        let AEmpty = dataA[index] === undefined || dataA[index] === null;
        let BEmpty = dataB[index] === undefined || dataB[index] === null;
        if(AEmpty) return BEmpty;
        else return dataA[index] === dataB[index];
      }
      else if(field.type === "input" || field.type === "area") {
        let AEmpty = !dataA[index];
        let BEmpty = !dataB[index];
        if(AEmpty) return BEmpty;
        else return dataA[index] === dataB[index];
      }
      else return dataA[index] === dataB[index];
    }, true);
  }
}

