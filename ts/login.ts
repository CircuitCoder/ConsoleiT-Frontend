import {ViewChild, Injectable, Component} from 'angular2/core'
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteParams, RouteData, Router} from 'angular2/router'
import {HTTP_PROVIDERS, Http, Response, Headers, RequestOptions} from 'angular2/http'

import {CICard, CICardView, CICardService} from './card'
import {MDL} from './mdl'
import {CILoginData} from './data'
import {CINotifier} from './notifier'
import * as Config from './config'

@Injectable()
export class CILoginService {

  private static listeners = new Array<CILoginService.Listener>();
  private static urlBase = 'http://' + Config.backend.host + ':' + Config.backend.port + '/account/';
  private static reqOpt = new RequestOptions({
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });

  constructor(
    private _http: Http,
    private _notifier: CINotifier
  ) { }
  
  addListener(l: CILoginService.Listener) {
    CILoginService.listeners.push(l);
  }

  doLogin(email: String, passwd: String) {
    let req = this._http.post(
      CILoginService.urlBase + 'login',
      JSON.stringify({ email, passwd }),
      CILoginService.reqOpt
    );
    req.subscribe((res) => {
      let data = res.json();
      if(data.error) {
        this._notifier.show(data.error);
      } else {
        CILoginService.listeners.forEach((l) => {
          if(l.onLogin) l.onLogin(data.user);
        });
      }
    }, (error) => {
      console.log(error);
      this._notifier.show("$Unknown");
    });
  }

  doLogout() {
    CILoginService.listeners.forEach((l) => {
      if(l.onLogout) l.onLogout();
    });
  }

  doRegister(email: String, realname: String, next: () => void) {
    let req = this._http.post(
      CILoginService.urlBase + 'register',
      JSON.stringify({ email, realname }),
      CILoginService.reqOpt
    );
    req.subscribe((res) => {
      let data = res.json();
      if(data.error) {
        this._notifier.show(data.error);
      } else {
        this._notifier.show(data.msg);
        return next();
      }
    }, (error) => {
      console.log(error);
      this._notifier.show("$Unknown");
    });
  }
}

export module CILoginService {
  export interface Listener {
    onLogin: (user: Object) => void;
    onLogout: () => void;
  }
}

@Component({
  templateUrl: 'view/login.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES],
  providers: [
    CILoginService,
    CICardService,
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS
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
