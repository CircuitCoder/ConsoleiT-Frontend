import {Injectable, Component} from 'angular2/core'
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, Router} from 'angular2/router'
import {HTTP_PROVIDERS, Http, Response, Headers, RequestOptions} from 'angular2/http'

import {CICard} from './card'
import {CIDataNotif} from './data'
import {MDL} from './mdl'

import {CIDashboard} from './dashboard'
import {CIUser, CILogin, CILoginService} from './login'
import {CINotifier} from './notifier'

declare var md5: any;

@Component({
  selector: 'ci-frame',
  templateUrl: 'tmpl/frame.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES],
  providers: [ROUTER_PROVIDERS, CILoginService, /*HTTP_PROVIDERS,*/ CINotifier]
})

@RouteConfig([
  {
    path:'/dashboard',
    name: 'Dashboard',
    component: CIDashboard,
    useAsDefault: true
  }, {
    path: '/login',
    name: 'Login',
    component: CILogin,
    data: {action: 'login'}
  }, {
    path: '/register',
    name: 'Register',
    component: CILogin,
    data: {action: 'register'}
  }, {
    path: '/**',
    redirectTo: ['Dashboard']
  }
])

export class CIFrame {
  notif: CIDataNotif[];
  user: CIUser;
  avatarUrl: string;
  started: boolean;

  constructor(private _loginService: CILoginService,
              private _router: Router,
              private _notifier: CINotifier,
              private _http: Http) {

    this.notif = new Array();
    this.user = null;
    this.avatarUrl = "";
    this.started = false;

    var outer = this;

    _loginService.addListener({
      onLogin(user) {
        console.log(user);
        outer.user = user;
        outer.avatarUrl = "https://gravatar.lug.ustc.edu.cn/avatar/" + md5(user.email) + "?d=mm&r=g";
        outer._router.navigate(['Dashboard']);
      },

      onLogout() {
        console.log("Logout");
        outer.user = null;
        outer._router.navigate(['Login']);
      }
    });
  }

  ngAfterViewInit() {
    this._loginService.doRestore((error, user) => {
      if(error) {
        if(!this._router.isRouteActive(this._router.generate(['Login'])) && 
           !this._router.isRouteActive(this._router.generate(['Register']))) {
          this._notifier.show(error);
          this._router.navigate(['Login']);
        }
      } else {
        this.user = user
        this.avatarUrl = "https://gravatar.lug.ustc.edu.cn/avatar/" + md5(user.email) + "?d=mm&r=g";
        console.log(this.avatarUrl);
        if(this._router.isRouteActive(this._router.generate(['Login'])) ||
           this._router.isRouteActive(this._router.generate(['Register']))) {
          this._notifier.show("AlreadyLoggedIn");
          this._router.navigate(['Dashboard']);
        }
      }

      this.started = true;
    });
  }

  logout() {
    this._loginService.doLogout();
  }
}
