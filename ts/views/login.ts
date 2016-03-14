import {ViewChild, Injectable, Component} from 'angular2/core'
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteParams, RouteData, Router} from 'angular2/router'
import {HTTP_PROVIDERS, Http, Response, Headers, RequestOptions} from 'angular2/http'

import {CIUser, CILoginService} from '../login'
import {CICard, CICardView, CICardService} from '../card'
import {MDL} from '../mdl'
import {CILoginData} from '../data'


@Component({
  templateUrl: 'view/login.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES],
  providers: [
    CILoginService,
    CICardService,
    ROUTER_PROVIDERS,
    /* HTTP_PROVIDERS */
  ]
})

export class CILogin extends CICardView {
  isRegister: boolean;
  data: CILoginData;
  @ViewChild(CICard) private loginCard:CICard;

  constructor(private _loginService: CILoginService,
              _cardService: CICardService,
              private _router: Router,
              private _routeData: RouteData,
              private _routeParams: RouteParams) {
    super(_cardService);

    this.data = {
      realname: "",
      email: "",
      passwd: ""
    };
    this.isRegister = this._routeData.get('action') == 'register';
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
}
