import {Inject, Component, OnInit} from 'angular2/core'
import {Router, RouteConfig, RouteParams, ROUTER_DIRECTIVES, OnActivate, RouterOutlet} from 'angular2/router'

import {CICardView, CICard, CICardService} from '../card'
import {CIFrameService} from '../frame.service'
import {CIConfService} from '../conf'
import {CILoginService} from '../login'
import {CINotifier} from '../notifier'
import {MDL} from '../mdl'

import * as CIUtil from '../util'

@Component({
  templateUrl: 'view/conf/application-list.html',
  directives: [CICard, ROUTER_DIRECTIVES]
})

class CIConfApplicationList extends CICardView {
  results: any[];

  constructor(_card: CICardService, private _conf: CIConfService) {
    super(_card);
    this.results = [];
  }
}

@Component({
  templateUrl: 'view/conf/application.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

class CIConfApplication extends CICardView {

  formType: any;
  formName: string;
  userId: number;

  form: any;
  data: any;
  status: number;
  statusText: string;

  constructor(_card: CICardService,
    params: RouteParams,
    private _router: Router,
    private _conf: CIConfService,
    private _notifier: CINotifier) {
      super(_card);
      this.form = [];
      this.data = {};
      this.userId = +params.get('uid');
      this.formType = params.get('type');

      if(this.formType == 'academic') this.formName = "学术团队申请";
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

    return super.routerOnActivate();
  }

  submit() {
    this._conf.postApplication(this.formType, this.userId, this.data, (res) => {
      this._notifier.show(res.msg);
      if(res.msg == "OperationSuccessful") {
        this.statusText = "等待审核";
        this.status = 1;
      }
    });
  }
}

@Component({
  templateUrl: 'view/conf/index.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

class CIConfHome extends CICardView {

  confData: any;
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
    this.confData.members.sort((e: any) => e.role );
    Object.keys(this.confMembers).forEach((e: any) => {
      this.confMembers[e].gravatar = CIUtil.generateGravatar(this.confMembers[e].email);
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

      if(this.formType == 'academic') this.formName = "学术团队申请";
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
          choices: e.choices ? e.choices.join("\n") : ""
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
          choices: choices
        }
      }
      else {
        return {
          title: e.title,
          desc: e.desc,
          type: e.type
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
        this._frame.setState("会议 - " + data.conf.title, [
          {
            title: "主页",
            route: ['/Conf', {id: this.confId}, 'Home'],
            router: this._router
          }, {
            title: "学术团队报名",
            route: ['/Conf', {id: this.confId}, 'Application', {type: 'academic', uid: this.userId}],
            router: this._router
          }
        ]);
        resolve();
      });
    });
  }
}

