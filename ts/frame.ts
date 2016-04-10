import {Injectable, Component, ElementRef} from 'angular2/core'
import {ROUTER_DIRECTIVES, RouteConfig, Router} from 'angular2/router'
import {Http, Response, Headers, RequestOptions} from 'angular2/http'

import {CIFrameService, CIFrameTabDefination} from './frame.service'

import {CICardService} from './card'
import {CINotifier} from './notifier'
import {CIDataNotif} from './data'
import {MDL} from './mdl'
import {CIUser, CILoginService} from './login'
import {CIConfService} from './conf'

import {CIDashboard} from './views/dashboard'
import {CILogin} from './views/login'
import {CIProfile} from './views/profile'
import {CIConf, CIConfList} from './views/conf'
import {CIAbout} from './views/misc'

import * as CIUtil from './util'

@Component({
  selector: 'ci-frame',
  templateUrl: 'tmpl/frame.html',
  directives: [ROUTER_DIRECTIVES],
  providers: [CILoginService, CINotifier, CIConfService, CICardService, CIFrameService]
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

  /* Conf */
  {
    path: "/conf/list",
    name: 'ConfList',
    component: CIConfList
  }, {
    path: "/conf/:id/...",
    name: 'Conf',
    component: CIConf
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
  confs: any[];
  tabs: CIFrameTabDefination[];
  title: string;

  titleAnimating: boolean;
  tabAnimating: boolean;

  constructor(private _loginService: CILoginService,
              private _router: Router,
              private _notifier: CINotifier,
              private _confService: CIConfService,
              private _frameService: CIFrameService,
              private _http: Http,
              private _el: ElementRef) {

    this.notif = new Array();
    this.user = null;
    this.avatarUrl = "";
    this.started = false;
    this.confs = [];

    this.tabs = [];
    this.title = ""
    this.titleAnimating = false;
    this.tabAnimating = false;

    var outer = this;

    _frameService.setFrame(this);

    _loginService.addListener({
      onLogin: (user: CIUser) => {
        outer.user = user;
        outer.avatarUrl = CIUtil.generateGravatar(user.email);
        outer._router.navigate(['Dashboard']);
        this.updateSidebar();
      },

      onLogout: () => {
        console.log("Logout");
        outer.user = null;
        outer._router.navigate(['Login']);
      },

      onRestore: (error: string, user: CIUser) => {
        if(error) {
          console.log(error);
          if(!this.isComponentActive(CILogin)) {
            outer._notifier.show(error);
            outer._router.navigate(['Login']);
          }
        } else {
          outer.user = user
          outer.avatarUrl = CIUtil.generateGravatar(user.email);
          console.log(outer.avatarUrl);
          if(this.isComponentActive(CILogin)) {
            outer._notifier.show("AlreadyLoggedIn");
            outer._router.navigate(['Dashboard']);
          }
        }

        outer.started = true;
        if(outer.user) this.updateSidebar();
      }
    });
  }

  ngAfterViewInit() {
    this._loginService.doRestore();
  }

  setState(title: string, tabs: CIFrameTabDefination[]) {
    console.log(tabs);
    if(title) {
      this.titleAnimating = true;
      setTimeout(() => {
        this.title = title;
        this.titleAnimating = false;
      }, 200)
    }

    if(tabs) {
      this.tabAnimating = true;
      setTimeout(() => {
        this.tabs = tabs;
        this.tabAnimating = false;
        setTimeout(() => {
          CIUtil.upgradeMDL(this._el.nativeElement.getElementsByClassName("mdl-layout")[0]);
        }, 0);
      }, 200)
    }
  }

  isRouteActive(route: any[], router?: any) {
    return (router ? router:this._router).isRouteActive(router.generate(route));
  }

  isComponentActive(comp: any, router?: any) {
    return (router ? router:this._router).currentInstruction.component.componentType == comp;
  }

  logout() {
    this._loginService.doLogout();
  }

  closeDrawer($event: any) {
    let drawer = this._el.nativeElement.getElementsByClassName('ci-drawer')[0];
    let target = $event.target;
    while(true) {
      if(target.tagName == "A" || target.tagName == "BUTTON") {
        this._el.nativeElement.getElementsByClassName("mdl-layout")[0].MaterialLayout.toggleDrawer();
        return;
      }
      else if(target == drawer) return;
      else target = target.parentNode;
    }
  }

  updateSidebar() {
    this._confService.getList((res) => {
      this.confs = res;
      console.log(res);
    });
  }
}
