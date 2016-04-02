import {ViewChild, Injectable, Component} from 'angular2/core'
import {ROUTER_DIRECTIVES, RouteParams, RouteData, Router} from 'angular2/router'
import {Http, Response, Headers, RequestOptions} from 'angular2/http'

import {CIUser, CILoginService} from '../login'
import {CIFrameService} from '../frame.service'
import {CICard, CICardView, CICardService} from '../card'
import {MDL} from '../mdl'
import {CILoginData} from '../data'
import {CINotifier} from '../notifier'

@Component({
  templateUrl: 'view/login.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

export class CILogin extends CICardView {
  isRegister: boolean;
  isStarted: boolean;
  data: CILoginData;
  @ViewChild(CICard) private loginCard:CICard;

  constructor(
    _cardService: CICardService,
    _frame: CIFrameService,
    private _loginService: CILoginService,
    private _notifier: CINotifier,
    private _router: Router,
    private _routeData: RouteData,
    private _routeParams: RouteParams) {
      super(_cardService);

      _frame.setState("", []);

      this.data = {
        realname: "",
        email: "",
        passwd: ""
      };
      this.isRegister = this._routeData.get('action') == 'register';

      let msg = this._routeParams.get('msg');
      if(msg) setTimeout(() => this._notifier.show(msg), 0);

      this.isStarted = false;
    }

  routerOnActivate() {
    setTimeout(() => this.isStarted = true, 0);
    super.routerOnActivate();
  }

  commit() {
    if(this.isRegister)
      this._loginService.doRegister(this.data.email, this.data.realname, () => {
        this.switchState();
      });
    else this._loginService.doLogin(this.data.email, this.data.passwd);
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
    else this._loginService.doRequestReset(this.data.email, () => {});
  }
}
