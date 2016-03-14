import {Injectable, Component, ElementRef} from 'angular2/core'
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, Router} from 'angular2/router'
import {HTTP_PROVIDERS, Http, Response, Headers, RequestOptions} from 'angular2/http'

import {CICard} from './card'
import {CINotifier} from './notifier'
import {CIDataNotif} from './data'
import {MDL} from './mdl'
import {CIUser, CILoginService} from './login'

import {CIDashboard} from './views/dashboard'
import {CILogin} from './views/login'
import {CIProfile} from './views/profile'
import {CIAbout} from './views/misc'

declare var md5: any;

@Component({
  selector: 'ci-frame',
  templateUrl: 'tmpl/frame.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES],
  providers: [ROUTER_PROVIDERS, CILoginService, /*HTTP_PROVIDERS,*/ CINotifier]
})

@RouteConfig([

  /* Pages */
  {
    path:'/dashboard',
    name: 'Dashboard',
    component: CIDashboard,
    useAsDefault: true
  },
  
  /* Accounts */
  {
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
    path: '/profile',
    name: 'Profile',
    component: CIProfile
  },

  /* Settings */
  {
    path: '/settings',
    name: 'Settings',
    component: CIDashboard
  }, {
    path: '/about',
    name: 'About',
    component: CIAbout
  },
  
  /* Fallback */
  {
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
              private _http: Http,
              private _el: ElementRef) {

    this.notif = new Array();
    this.user = null;
    this.avatarUrl = "";
    this.started = false;

    var outer = this;

    _loginService.addListener({
      onLogin: (user: CIUser) => {
        outer.user = user;
        outer.avatarUrl = "https://gravatar.lug.ustc.edu.cn/avatar/" + md5(user.email) + "?d=mm&r=g";
        outer._router.navigate(['Dashboard']);
      },

      onLogout: () => {
        console.log("Logout");
        outer.user = null;
        outer._router.navigate(['Login']);
      },

      onRestore: (error: string, user: CIUser) => {
        if(error) {
          if(!outer._router.isRouteActive(outer._router.generate(['Login'])) && 
             !outer._router.isRouteActive(outer._router.generate(['Register']))) {
            outer._notifier.show(error);
            outer._router.navigate(['Login']);
          }
        } else {
          outer.user = user
          outer.avatarUrl = "https://gravatar.lug.ustc.edu.cn/avatar/" + md5(user.email) + "?d=mm&r=g";
          console.log(outer.avatarUrl);
          if(outer._router.isRouteActive(outer._router.generate(['Login'])) ||
             outer._router.isRouteActive(outer._router.generate(['Register']))) {
            outer._notifier.show("AlreadyLoggedIn");
            outer._router.navigate(['Dashboard']);
          }
        }

        outer.started = true;
      }
    });
  }

  ngAfterViewInit() {
    this._loginService.doRestore();
  }

  logout() {
    this._loginService.doLogout();
  }

  closeDrawer($event: any) {
    if($event.target == this._el.nativeElement.getElementsByClassName('ci-drawer')[0]) return;
    this._el.nativeElement.getElementsByClassName("mdl-layout")[0].MaterialLayout.toggleDrawer();
  }
}
