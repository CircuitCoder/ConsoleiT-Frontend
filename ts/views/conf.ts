import {ViewChild, Inject, Component, OnInit} from '@angular/core'
import {CanDeactivate, Router, RouteConfig, RouteParams, ROUTER_DIRECTIVES, RouterOutlet} from '@angular/router-deprecated'

import {CICardView, CICard, CICardService} from '../card'
import {CIFrameService} from '../frame.service'
import {CIConfService} from '../conf'
import {CILoginService} from '../login'
import {CINotifier} from '../notifier'
import {CIFuncFilter} from '../pipes'
import {MDL} from '../mdl'

import * as CIUtil from '../util'

@Component({
  template: require('html/view/conf/application-list.html'),
  directives: [CICard, ROUTER_DIRECTIVES, MDL],
  pipes: [CIFuncFilter]
})

class CIConfApplicationList extends CICardView {

  formId: string;

  submissions: any[];

  searchStr: string;

  constructor(_card: CICardService, private _conf: CIConfService, params: RouteParams, _frame: CIFrameService) {
    super(_card);
    this.submissions = [];
    this.searchStr = "";
    this.formId = params.get('form');
    _frame.setFab(null);
  }

  routerOnActivate() {
    this._conf.getFormResults(this.formId, (res) => {
      this._conf.registerSubmissions(res);
      this.submissions = this._conf.getSubmissions();
    });

    return super.routerOnActivate();
  }

  flt(value: any, str: string, membersMap: any, getStatusText: any) {
    if(str == "") return true;
    else return value.status === str || value.realname.indexOf(str) != -1;
  }
}

@Component({
  template: require('html/view/conf/application.html'),
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

class CIConfApplication extends CICardView implements CanDeactivate {

  formId: any;
  formName: string;
  userId: number;
  operatorId: number;

  canModify: boolean;
  canModerate: boolean;
  role: string;

  form: any;
  data: any;
  savedData: any;
  locked: boolean;
  new: boolean;
  status: string;

  submissions: any;
  applicants: any;

  showModerator: boolean;
  moderatorNote: string;

  @ViewChild("importer") importer: any;

  constructor(_card: CICardService,
    params: RouteParams,
    private _frame: CIFrameService,
    private _router: Router,
    private _conf: CIConfService,
    private _login: CILoginService,
    private _notifier: CINotifier) {
      super(_card);
      this.form = [];
      this.data = {};
      this.userId = +params.get('uid');
      this.formId = params.get('form');
      this.operatorId = _login.getUser()._id;

      var formDesc = _conf.getFormDesc(this.formId);
      if(!formDesc) {
        _notifier.show("$Unknown");
        return this;
      }

      this.role = formDesc.role;
      this.formName = formDesc.title;

      this.canModerate = this.role == 'admin' || this.role == 'moderator';

      if(this.role == 'admin')  this.canModify = true;
      else this.canModify = this.operatorId == this.userId;

      if(this.role == 'admin') {
        this.submissions = this._conf.getSubmissions();
        if(!this.submissions) { // Directly routed to this page
          this._conf.getFormResults(this.formId, (res) => {
            this._conf.registerSubmissions(res);
            this.submissions = this._conf.getSubmissions();
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
      this.role = results[0].role;
      this.status = results[0].status;
      this.formName = results[0].title;
      return results[1];
    }).then((data: any) => {
      this.form.forEach((e: any,i: number) => {
        if(e.type == "checkbox" && !data.submission[i]) data.submission[i] = {};
      });

      this.data = data.submission;
      this.locked = data.locked;
      this.new = data.new;
      this.status = data.status;

      this.savedData = CIUtil.deepClone(this.data);
    });

    window.onbeforeunload = function() {
      if(this.isDataDifferent(this.savedData,this.data)) return "请确认已保存";
      else return null;
    }

    return super.routerOnActivate();
  }

  routerOnDeactivate() {
    window.onbeforeunload = function() {};
    return super.routerOnDeactivate();
  }

  routerCanDeactivate() {
    if(this.isDataDifferent(this.savedData,this.data)) return confirm("请确认已保存");
    else return true;
  }

  submit() {
    /* Check for required fields */
    let invalids: any = [];
    
    this.form.forEach((e: any, i: any) => {
      if(e.required) {
        if(e.type == "checkbox") {
          let flag = false;
          for(let field in this.data[i]) if(this.data[i][field]) flag = true;
          if(!flag) invalids.push(i+1);
        } else {
          if(!this.data[i] || this.data[i] == "") invalids.push(i+1);
        }
      }
    });

    if(invalids.length > 0) this._notifier.show(`非法字段: ${invalids.join(", ")}`);
    else {
      this._conf.postApplication(this.formId, this.userId, this.data, (res) => {
        if(res.msg == "OperationSuccessful") {
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
    var e = new Event('click');
    this.importer.nativeElement.dispatchEvent(e);
  }

  importForm() {
    var fr = new FileReader();

    fr.onerror = () => {
      this._notifier.show("加载失败");
    }

    fr.onload = () => {
      this.data = CIUtil.parseForm(this.form, fr.result);
      this._notifier.show("导入成功");
    }

    var file = this.importer.nativeElement.files[0];
    fr.readAsText(file);
  }

  private isDataDifferent(dataA: any[], dataB: any[]) {
    return !this.form.reduce((prev: boolean, field: any, index: number) => {
      if(!prev) {
        console.log("ALREADY DIFFERENT: %d", index);
        return false;
      }
      else if(field.type == 'title') return true;
      else if(field.type == 'checkbox') {
        let selectedA:boolean[] = [];
        let selectedB:boolean[] = [];
        if(dataA[index] == undefined) {
          for(var i = 0; i < field.choices.length; ++i) selectedA[i] = false;
        } else {
          for(var i = 0; i < field.choices.length; ++i) selectedA[i] = i in dataA[index] && dataA[index][i];
        }

        if(dataB[index] == undefined) {
          for(var i = 0; i < field.choices.length; ++i) selectedB[i] = false;
        } else {
          for(var i = 0; i < field.choices.length; ++i) selectedB[i] = i in dataB[index] && dataB[index][i];
        }

        for(var i = 0 ;i < field.choices.length; ++i) if(selectedA[i] != selectedB[i]) return false;
        return true;
      } else if(field.type == 'radio') {
        let AEmpty = dataA[index] == undefined || dataA[index] == null;
        let BEmpty = dataB[index] == undefined || dataB[index] == null;
        if(AEmpty) return BEmpty;
        else return dataA[index] === dataB[index];
      }
      else if(field.type == 'input' || field.type == 'area') {
        let AEmpty = !dataA[index];
        let BEmpty = !dataB[index];
        if(AEmpty) return BEmpty;
        else return dataA[index] === dataB[index];
      }
      else return dataA[index] === dataB[index];
    }, true);
  }
}

@Component({
  template: require('html/view/conf/index.html'),
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

class CIConfHome extends CICardView {

  confData: any;
  confDescs: any;
  confDescTitles: any;
  confGroup: any;
  confMembers: any;
  confRoles: any;
  

  userId: number;

  constructor(_card: CICardService, private _conf: CIConfService, private _login: CILoginService) {
    super(_card);
    this.userId = _login.getUser()._id;
  }

  routerOnActivate() {
    this.confData = this._conf.getConf();
    this.confMembers = this._conf.getMemberMap();
    this.confGroup = this._conf.getGroup();
    this.confRoles = this._conf.getRoleMap();

    this.confData.members.sort((a: any, b: any) => a.role < b.role ? -1 : 1 );
    Object.keys(this.confMembers).forEach((e: any) => {
      this.confMembers[e].gravatar = CIUtil.generateGravatar(this.confMembers[e].email);
    });

    CIUtil.cardMarked(this.confData.desc, (titles, bodies) => {
      this.confDescs = bodies;
      this.confDescTitles = titles;
    });

    return super.routerOnActivate();
  }
}

@Component({
  template: require('html/view/conf/form-edit.html'),
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

class CIConfFormEdit extends CICardView {

  formId: any;
  data: any;
  formName: any;

  constructor(_card: CICardService,
    params: RouteParams,
    private _router: Router,
    private _conf: CIConfService,
    private _notifier: CINotifier) {
      super(_card);
      this.formId = params.get('form');
      
      let formDesc = _conf.getFormDesc(this.formId);
      this.formName = formDesc.title;
      //TODO: formName
      this.data = [];
    }

  routerOnActivate() {
    this._conf.getForm(this.formId,(res) => {
      this.data = res.content.map((e: any) => {
        return {
          title: e.title,
          desc: e.desc,
          type: e.type,
          choices: e.choices ? e.choices.join("\n") : "",
          required: e.required
        }
      });
      this.formName = res.title;
    });

    return super.routerOnActivate();
  }

  pushField() {
    this.data.push({
      type: "input"
    });

    console.log(this.data);
  }

  deleteField(i: number) {
    this.data.splice(i,i+1);
  }

  moveUp(i: number) {
    if(i == 0) return;
    let tmp=this.data[i];
    this.data[i] = this.data[i-1];
    this.data[i-1] = tmp;
  }

  moveDown(i: number) {
    if(i == this.data.length - 1) return;
    let tmp=this.data[i];
    this.data[i] = this.data[i+1];
    this.data[i+1] = tmp;
  }

  submit() {
    let content = this.data.map((e: any): any => {
      let choices = e.choices ? e.choices.split("\n") : [];
      if(e.type == "checkbox" || e.type == "radio") {
        return {
          title: e.title,
          desc: e.desc,
          type: e.type,
          choices: choices,
          required: e.required
        }
      }
      else {
        return {
          title: e.title,
          desc: e.desc,
          type: e.type,
          required: e.required
        }
      }
    });

    this._conf.postForm(this.formId, {
      content: content,
      title: this.formName
    }, res => {
      if(res.msg == "OperationSuccessful") {
        this._notifier.show("操作成功，您可能需要刷新浏览器才能看到效果");
      }
    });
  }
}

@Component({
  template: require('html/view/conf/settings.html'),
  directives: [MDL, CICard, ROUTER_DIRECTIVES]
})

export class CIConfSettings extends CICardView {

  conf: any;
  memberMap: any;
  settings: any;
  forms: any;

  constructor(
    _card: CICardService,
    _frame: CIFrameService,
    private _notifier: CINotifier,
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

      this.forms = [];
    }

  ngAfterViewInit() {
    this._conf.getAllForms((forms: any) => {
      this.forms = forms;
      super.ngAfterViewInit();
    });
  }

  routerOnDeactive() {
    console.log("DEACTIVE");
    super.routerOnDeactivate();
  }

  updateSettings() {
    this._conf.postSettings(this.conf._id, { settings: this.settings }, res => {
      if(res.msg) this._notifier.show("更新成功, 您可能需要刷新才能看到效果");
    });
  }

  getFormStatus(id: string) {
    if(id == "open") return "开放";
    else if(id == "closed") return "已关闭";
    else if(id == "archived") return "已存档";
    else return id;
  }

  jumpTo(anchor: string) {
    var elem = document.getElementById(anchor);
    elem.scrollIntoView();
  }
}

@Component({
  template: '<router-outlet></router-outlet>',
  directives: [RouterOutlet],
})

@RouteConfig([
  {
    path: '/home',
    name: 'Home',
    component: CIConfHome,
    useAsDefault: true
  }, {
    path: '/:form/list',
    name: 'ApplicationList',
    component: CIConfApplicationList
  }, {
    path: '/:form/:uid',
    name: 'Application',
    component: CIConfApplication
  }, {
    path: '/:form/edit',
    name: 'FormEdit',
    component: CIConfFormEdit
  }, {
    path: '/settings',
    name: 'Settings',
    component: CIConfSettings
  }
])

export class CIConf {

  confId: number;
  userId: number;

  constructor(routeParams: RouteParams,
    private _conf: CIConfService,
    private _router: Router,
    private _login: CILoginService,
    private _frame: CIFrameService) {
      this.confId = +routeParams.get('id');
      this.userId = _login.getUser()._id;
    }

  routerOnActivate() {
    var outer = this;

    return new Promise<void>((resolve, reject) => {
      outer._conf.getData(outer.confId, (data) => {
        outer._conf.registerConf(data);
        let forms = outer._conf.getFormDescs();
        let tabs: any = [
          {
            title: "主页",
            route: ['/Conf', {id: this.confId}, 'Home'],
            router: this._router
          }
        ];

        // Inject forms
        forms.forEach(e => {
          if(e.role == "applicant")
            tabs.push({
              title: e.title,
              route: ['/Conf', {id: this.confId}, 'Application', { form: e.name, uid: this.userId }],
              router: this._router
            });
          else
            tabs.push({
              title: e.title + ' - 结果',
              route: ['/Conf', {id: this.confId}, 'ApplicationList', { form: e.name }],
              router: this._router
            });
        });

        if(outer._conf.hasPerm(this.userId, 'settings')) {
          tabs.push({
            title: "设置",
            route: ['/Conf', {id: this.confId}, 'Settings'],
            router: this._router
          });
        }
        this._frame.setTitle(`会议 - ${data.conf.title}`);
        this._frame.setTabs(tabs);
        this._frame.setFab(null);
        resolve();
      });
    });
  }
}

@Component({
  template: require('html/view/conf-list.html'),
  directives: [MDL, ROUTER_DIRECTIVES, CICard],
  pipes: [CIFuncFilter]
})

export class CIConfList extends CICardView {
  confs: any;

  constructor(
    _card: CICardService,
    _frame: CIFrameService,
    private _conf: CIConfService) {
      super(_card);
      _frame.setTitle("会议列表");
      _frame.setTabs([]);
      _frame.setFab(null);
    }

  routerOnActivate() {
    this._conf.getAvailList( res => {
      this.confs = res;
    });

    return super.routerOnActivate();
  }
}
