import {Component} from "@angular/core";
import {Router, RouteConfig, RouteParams, RouterOutlet} from "@angular/router-deprecated";

import {CIFrameService} from "../frame.service";
import {CIConfService} from "../conf";
import {CILoginService} from "../login";

/* Components */
import {CIConfApplicationList} from "./conf/application-list";
import {CIConfApplication} from "./conf/application";
import {CIConfHome} from "./conf/home";
import {CIConfFormEdit} from "./conf/form-edit";
import {CIConfSettings} from "./conf/settings";

@Component({
  template: "<router-outlet></router-outlet>",
  directives: [RouterOutlet],
})

@RouteConfig([
  {
    path: "/home",
    name: "Home",
    component: CIConfHome,
    useAsDefault: true
  }, {
    path: "/form/:form/list",
    name: "ApplicationList",
    component: CIConfApplicationList
  }, {
    path: "/form/:form/:uid",
    name: "Application",
    component: CIConfApplication
  }, {
    path: "/form/:form/edit",
    name: "FormEdit",
    component: CIConfFormEdit
  }, {
    path: "/settings",
    name: "Settings",
    component: CIConfSettings
  }
])

export class CIConf {

  confId: number;
  userId: number;

  constructor(routeParams: RouteParams,
    private _conf: CIConfService,
    private _router: Router,
    private _login: CILoginService,
    private _frame: CIFrameService) {
      this.confId = +routeParams.get("id");
      this.userId = _login.getUser()._id;
    }

  routerOnActivate() {
    let outer = this;

    return new Promise<void>((resolve, reject) => {
      outer._conf.getData(outer.confId, (data) => {
        outer._conf.registerConf(data);
        let forms = outer._conf.getFormDescs();
        let tabs: any = [
          {
            title: "主页",
            route: ["/Conf", {id: this.confId}, "Home"],
            router: this._router
          }
        ];

        // Inject forms
        forms.forEach(e => {
          if(e.role === "applicant" || !e.role)
            tabs.push({
              title: e.title,
              route: ["/Conf", {id: this.confId}, "Application", { form: e.name, uid: this.userId }],
              router: this._router
            });
          else
            tabs.push({
              title: e.title + " - 结果",
              route: ["/Conf", {id: this.confId}, "ApplicationList", { form: e.name }],
              router: this._router
            });
        });

        if(outer._conf.hasPerm(this.userId, "settings")) {
          tabs.push({
            title: "设置",
            route: ["/Conf", {id: this.confId}, "Settings"],
            router: this._router
          });
        }
        this._frame.setTitle(`会议 - ${data.conf.title}`);
        this._frame.setTabs(tabs);
        this._frame.setFab(null);
        resolve();
      });
    });
  }
}

