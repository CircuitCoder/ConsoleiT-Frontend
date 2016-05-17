import {ViewChild, Injectable, Component} from '@angular/core'
import {ROUTER_DIRECTIVES, RouteParams, RouteData, Router} from '@angular/router-deprecated'
import {Http, Response, Headers, RequestOptions} from '@angular/http'

import {CIUser, CILoginService} from '../login'
import {CIFrameService} from '../frame.service'
import {CICard, CICardView, CICardService} from '../card'
import {MDL} from '../mdl'
import {CILoginData} from '../data'
import {CINotifier} from '../notifier'

@Component({
  template: require('html/view/login.html'),
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

export class CILogin extends CICardView {
  isRegister: boolean;
  data: CILoginData;

  isStarted: boolean = false;
  needInit: boolean = false;
  showInit: boolean = false;
  schoolList: string[];
  @ViewChild(CICard) private loginCard:CICard;

  constructor(
    _card: CICardService,
    _frame: CIFrameService,
    private _login: CILoginService,
    private _notifier: CINotifier,
    private _router: Router,
    private _routeData: RouteData,
    private _routeParams: RouteParams) {
      super(_card);

      _frame.setTitle("");
      _frame.setTabs([]);
      _frame.setFab(null);

      this.data = {
        realname: "",
        email: "",
        passwd: ""
      };
      this.isRegister = this._routeData.get('action') == 'register';

      let msg = this._routeParams.get('msg');
      if(msg) setTimeout(() => this._notifier.show(msg), 0);
    }

  routerOnActivate() {
    setTimeout(() => this.isStarted = true, 0);
    super.routerOnActivate();
  }

  routerOnDeactivate() {
    this.isStarted = false;
    this.showInit = false;
    return super.routerOnDeactivate();
  }

  commit() {
    if(this.isRegister)
      this._login.doRegister(this.data.email, this.data.realname, () => {
        this.switchState();
      });
    else this._login.doLogin(this.data.email, this.data.passwd, (data: any) => {
      // Need initialization
      this.schoolList = data.schoolList;

      this.needInit = true;
      setTimeout(() => this.showInit = true, 0); // For animation
    });
  }

  init() {
    this._login.doInit(this.data);
  }

  switchState() {
    if(this.isRegister) this._router.navigate(['Login']);
    else this._router.navigate(['Register']);
    this.loginCard.toggleContent().then(() => {
      this.isRegister = !this.isRegister;
      this.loginCard.toggleContent();
    });
  }

  requestReset() {
    if(!this.data.email || this.data.email == "") this._notifier.show("请输入邮箱");
    else this._login.doRequestReset(this.data.email, () => {});
  }
}
