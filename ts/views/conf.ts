import {ViewChild, Inject, Component, OnInit} from 'angular2/core'
import {CanDeactivate, Router, RouteConfig, RouteParams, ROUTER_DIRECTIVES, RouterOutlet} from 'angular2/router'

import {CICardView, CICard, CICardService} from '../card'
import {CIFrameService} from '../frame.service'
import {CIConfService} from '../conf'
import {CILoginService} from '../login'
import {CINotifier} from '../notifier'
import {CIFuncFilter} from '../pipes'
import {MDL} from '../mdl'

import * as CIUtil from '../util'

@Component({
  templateUrl: 'view/conf/application-list.html',
  directives: [CICard, ROUTER_DIRECTIVES, MDL],
  pipes: [CIFuncFilter]
})

class CIConfApplicationList extends CICardView {

  formType: string;

  membersMap: any;
  submissions: any[];

  searchStr: string;

  constructor(_card: CICardService, private _conf: CIConfService, params: RouteParams) {
    super(_card);
    this.submissions = [];
    this.searchStr = "";
    this.formType = params.get('type');
  }

  routerOnActivate() {
    this._conf.getFormResults(this.formType, (res) => {
      console.log(res.members);
      this.membersMap = res.members.reduce((prev: any,e: any) => {
        prev[e._id] = e;
        return prev;
      }, {});
      console.log(this.membersMap);
      this.submissions = res.list;
    });

    return super.routerOnActivate();
  }

  flt(value: any, str: string, membersMap: any, getStatusText: any) {
    if(str == "") return true;
    else return getStatusText(value.status) == str || membersMap[value._id].realname.indexOf(str) != -1;
  }

  getStatusText(id: number) {
    if(id == 1) {
      return "等待审核";
    } else if(id == 2) {
      return "通过";
    } else if(id == 3) {
      return "拒绝";
    } else return String(id);
  }
}

@Component({
  templateUrl: 'view/conf/application.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

class CIConfApplication extends CICardView implements CanDeactivate {

  formType: any;
  formName: string;
  userId: number;
  operatorId: number;

  canModify: boolean;

  form: any;
  data: any;
  status: number;
  statusText: string;

  @ViewChild("importer") importer: any;

  constructor(_card: CICardService,
    params: RouteParams,
    private _router: Router,
    private _conf: CIConfService,
    private _login: CILoginService,
    private _notifier: CINotifier) {
      super(_card);
      this.form = [];
      this.data = {};
      this.userId = +params.get('uid');
      this.formType = params.get('type');
      this.operatorId = _login.getUser()._id;
      if(_conf.hasPerm(this.operatorId, `registrant.${this.formType}.modify`)) this.canModify = true;
      else this.canModify = this.operatorId == this.userId;
      console.log(this.operatorId==this.userId);
      

      if(this.formType == 'academic-en') this.formName = "学术团队申请 - 英文";
      else if(this.formType == 'academic-zh') this.formName = "学术团队申请 - 中文";
      else if(this.formType == 'participant') this.formName = "代表报名";
      else this.formName = this.formType;
    }

  routerOnActivate() {
    this._conf.getForm(this.formType, (form) => {
      this.form = form;
      this._conf.getFormResult(this.formType, this.userId, (data) => {
        this.form.forEach((e: any,i: number) => {
          if(e.type == "checkbox" && !data.submission[i]) data.submission[i] = {};
        });
        this.data = data.submission;

        this.status = data.status;
        if(this.status == 0)
          this.statusText = "未提交";
        else if(this.status == 1)
          this.statusText = "等待审核";
        else if(this.status == 2)
          this.statusText = "通过";
        else if(this.status == 3)
          this.statusText = "拒绝";
        else this.statusText = this.status.toString();
      });
    });

    window.onbeforeunload = function() {
      return "请确认已保存";
    }

    return super.routerOnActivate();
  }

  routerOnDeactivate() {
    window.onbeforeunload = function() {};
    return super.routerOnDeactivate();
  }

  routerCanDeactivate() {
    return confirm("请确认已保存");
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
      this._conf.postApplication(this.formType, this.userId, this.data, (res) => {
        this._notifier.show(res.msg);
        if(res.msg == "OperationSuccessful") {
          this.statusText = "等待审核";
          this.status = 1;
        }
      });
    }
  }

  exportForm() {
    try {
      CIUtil.saveFile(this.formName, [CIUtil.exportForm(this.form, this.formName)]);
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
}

@Component({
  templateUrl: 'view/conf/index.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

class CIConfHome extends CICardView {

  confData: any;
  confDescs: any;
  confDescTitles: any;
  confStatus: string;
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
    this.confStatus = this._conf.getStatus();
    this.confMembers = this._conf.getMemberMap();
    this.confGroup = this._conf.getGroup();
    this.confRoles = this._conf.getRoleMap();

    console.log(this.confRoles);
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
  templateUrl: 'view/conf/form.html',
  directives: [CICard, MDL]
})

class CIConfForm extends CICardView {

  formType: any;
  data: any;
  formName: any;

  constructor(_card: CICardService,
    params: RouteParams,
    private _router: Router,
    private _conf: CIConfService,
    private _notifier: CINotifier) {
      super(_card);
      this.formType = params.get('type');
      this.data = [];

      if(this.formType == 'academic-en') this.formName = "学术团队申请 - 英文";
      else if(this.formType == 'academic-zh') this.formName = "学术团队申请 - 中文";
      else if(this.formType == 'participant') this.formName = "代表报名";
      else this.formName = this.formType;
    }

  routerOnActivate() {
    this._conf.getForm(this.formType,(res) => {
      this.data = res.map((e: any) => {
        return {
          title: e.title,
          desc: e.desc,
          type: e.type,
          choices: e.choices ? e.choices.join("\n") : "",
          required: e.required
        }
      });

      console.log(this.data);
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
    let result = this.data.map((e: any): any => {
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

    this._conf.postForm(this.formType, result, res => {
      if(res.msg == "OperationSuccessful") {
        this._notifier.show(res.msg);
        this._router
      }
    });
  }
}

@Component({
  templateUrl: 'view/conf/settings.html',
  directives: [MDL, CICard]
})

export class CIConfSettings extends CICardView {

  conf: any;
  memberMap: any;
  settings: any;

  constructor(
    _card: CICardService,
    private _notifier: CINotifier,
    private _conf: CIConfService) {
      super(_card);
      this.conf = _conf.getConf();
      this.memberMap = _conf.getMemberMap();

      this.settings = {
        status: this.conf.status,
        title: this.conf.title,
        desc: this.conf.desc,
      };
    }

  updateSettings() {
    this._conf.postSettings(this.conf._id, { settings: this.settings }, res => {
      if(res.msg) this._notifier.show("更新成功, 您可能需要刷新才能看到效果");
    });
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
    path: '/:type/list',
    name: 'ApplicationList',
    component: CIConfApplicationList
  }, {
    path: '/:type/:uid',
    name: 'Application',
    component: CIConfApplication
  }, {
    path: '/settings/form/:type',
    name: 'Form',
    component: CIConfForm
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
    private _confService: CIConfService,
    private _router: Router,
    private _login: CILoginService,
    private _frame: CIFrameService) {
      this.confId = +routeParams.get('id');
      this.userId = _login.getUser()._id;
    }

  routerOnActivate() {
    var outer = this;

    return new Promise<void>((resolve, reject) => {
      outer._confService.getData(outer.confId, (data) => {
        outer._confService.registerConf(data);
        let tabs: any = [
          {
            title: "主页",
            route: ['/Conf', {id: this.confId}, 'Home'],
            router: this._router
          }
        ];

        if(outer._confService.hasPerm(this.userId, 'registrant.academicZh.view')) {
          tabs.push({
            title: "学术团队报名结果 - 中文",
            route: ['/Conf', {id: this.confId}, 'ApplicationList', {type: 'academic-zh'}],
            router: this._router
          });
        } else {
          tabs.push({
            title: "学术团队报名 - 中文",
            route: ['/Conf', {id: this.confId}, 'Application', {type: 'academic-zh', uid: this.userId}],
            router: this._router
          });
        }

        if(outer._confService.hasPerm(this.userId, 'registrant.academicEn.view')) {
          tabs.push({
            title: "学术团队报名结果 - 英文",
            route: ['/Conf', {id: this.confId}, 'ApplicationList', {type: 'academic-en'}],
            router: this._router
          });
        } else {
          tabs.push({
            title: "学术团队报名 - 英文",
            route: ['/Conf', {id: this.confId}, 'Application', {type: 'academic-en', uid: this.userId}],
            router: this._router
          });
        }

        if(outer._confService.hasPerm(this.userId, 'settings')) {
          tabs.push({
            title: "设置",
            route: ['/Conf', {id: this.confId}, 'Settings'],
            router: this._router
          });
        }
        this._frame.setState(`会议 - ${data.conf.title}`, tabs);
        resolve();
      });
    });
  }
}

@Component({
  templateUrl: 'view/conf-list.html',
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
      _frame.setState("会议列表", []);
    }

  routerOnActivate() {
    this._conf.getAvailList( res => {
      this.confs = res;
      this.confs.forEach((e: any) => {
        e.statusText = this._conf.getStatus(e);
      });
    });

    return super.routerOnActivate();
  }
}
