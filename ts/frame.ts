import {Component, ElementRef} from "@angular/core";
import {ROUTER_DIRECTIVES, RouteConfig, Router} from "@angular/router-deprecated";
import {Http} from "@angular/http";

import {CIFrameService, CIFrameTabDefination, CIFrameFabDefination} from "./frame.service";

import {CICardService} from "./card";
import {CINotifier} from "./notifier";
import {CIDataNotif} from "./data";
import {CIAvatar} from "./avatar";
import {CIUser, CILoginService} from "./login";
import {CIConfService} from "./conf";
import {CIUserService} from "./user";

import {CIDashboard} from "./views/dashboard";
import {CILogin} from "./views/login";
import {CIProfile} from "./views/profile";
import {CIConf} from "./views/conf";
import {CIConfList} from "./views/conf-list";
import {CIAbout} from "./views/misc";

import * as CIUtil from "./util";

import particlesConfig from "./particles.config";

@Component({
  selector: "ci-frame",
  template: require("html/tmpl/frame.html"),
  directives: [ROUTER_DIRECTIVES, CIAvatar],
  providers: [CILoginService, CINotifier, CIConfService, CICardService, CIFrameService, CIUserService]
})

@RouteConfig([

  /* Pages */
  {
    path: "/dashboard",
    name: "Dashboard",
    component: CIDashboard,
    useAsDefault: true
  },

  /* Accounts */
  {
    path: "/login",
    name: "Login",
    component: CILogin,
    data: {action: "login"}
  }, {
    path: "/register",
    name: "Register",
    component: CILogin,
    data: {action: "register"}
  }, {
    path: "/profile",
    name: "Profile",
    component: CIProfile
  },

  /* Conf */
  {
    path: "/conf/list",
    name: "ConfList",
    component: CIConfList
  }, {
    path: "/conf/:id/...",
    name: "Conf",
    component: CIConf
  },

  /* Settings */
  {
    path: "/settings",
    name: "Settings",
    component: CIDashboard
  }, {
    path: "/about",
    name: "About",
    component: CIAbout
  },

  /* Fallback */
  {
    path: "/**",
    redirectTo: ["Dashboard"]
  }
])

export class CIFrame {
  notif: CIDataNotif[] = [];
  user: CIUser = null;
  started: boolean = false;
  showParticles: boolean = false;
  confs: any[] = [];
  tabs: CIFrameTabDefination[] = [];
  fab: CIFrameFabDefination = null;
  title: string = "";

  titleAnimating: boolean = false;
  tabAnimating: boolean = false;
  fabAnimating: boolean = false;
  showSubfabs: boolean = false;

  constructor(private _login: CILoginService,
              private _router: Router,
              private _notifier: CINotifier,
              private _conf: CIConfService,
              private _frame: CIFrameService,
              private _http: Http,
              private _el: ElementRef) {

    let outer = this;

    _frame.setFrame(this);

    _login.addListener({
      onLogin: (user: CIUser) => {
        outer.user = user;
        outer._router.navigate(["Dashboard"]);
        this.updateSidebar();
      },

      onLogout: () => {
        outer.user = null;
        outer._router.navigate(["Login"]);
      },

      onRestore: (error: string, user: CIUser) => {
        if(error) {
          console.log(error);
          if(!this.isComponentActive(CILogin)) {
            outer._notifier.show(error);
            outer._router.navigate(["Login"]);
          }
        } else {
          outer.user = user;
          if(this.isComponentActive(CILogin)) {
            outer._notifier.show("AlreadyLoggedIn");
            outer._router.navigate(["Dashboard"]);
          }
        }

        outer.started = true;
        if(outer.user) this.updateSidebar();
      }
    });
  }

  ngAfterViewInit() {
    // Initialize particles js
    window.particlesJS("particles-background", particlesConfig);

    setTimeout(() => {
      this.showParticles = true;
    });

    this._login.doRestore();
  }

  setTitle(title: string) {
    this.titleAnimating = true;
    setTimeout(() => {
      this.title = title;
      this.titleAnimating = false;
    }, 200);
  }

  setTabs(tabs: CIFrameTabDefination[]) {
    this.tabAnimating = true;
    setTimeout(() => {
      this.tabs = tabs;
      this.tabAnimating = false;
      setTimeout(() => {
        CIUtil.upgradeMDL(this._el.nativeElement.getElementsByClassName("mdl-layout")[0]);
      }, 0);
    }, 200);
  }

  setFab(fab: CIFrameFabDefination) {
    this.fabAnimating = true;
    this.showSubfabs = false;
    setTimeout(() => {
      this.fab = fab;
      this.fabAnimating = false;
    }, 200);
  }

  toggleSubfabs() {
    this.showSubfabs = !this.showSubfabs;
  }

  isRouteActive(route: any[], router?: any) {
    return (router ? router : this._router).isRouteActive(router.generate(route));
  }

  isComponentActive(comp: any, router?: any) {
    // TODO: may be fixed in the new release
    return (router ? router : this._router).currentInstruction.component.componentType === comp;
  }

  logout() {
    this._login.doLogout();
  }

  closeDrawer($event: any) {
    let drawer = this._el.nativeElement.getElementsByClassName("ci-drawer")[0];
    let target = $event.target;
    while(true) {
      if(target.tagName === "A" || target.tagName === "BUTTON") {
        this._el.nativeElement.getElementsByClassName("mdl-layout")[0].MaterialLayout.toggleDrawer();
        return;
      }
      else if(target === drawer) return;
      else target = target.parentNode;
    }
  }

  updateSidebar() {
    this._conf.getList((res) => {
      this.confs = res;
    });
  }
}
