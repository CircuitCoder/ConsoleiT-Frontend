import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {CICardView, CICard, CICardService} from "../card";
import {CIFrameService} from "../frame.service";
import {CILoginService, CIUser} from "../login";
import {MDL} from "../mdl";

@Component({
  template: require("html/view/dashboard.html"),
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

export class CIDashboard extends CICardView {

  user: CIUser;

  constructor(_card: CICardService, private _login: CILoginService, _frame: CIFrameService) {
    super(_card);
    this.user = _login.getUser();
    _frame.setTitle("主页");
    _frame.setTabs([]);
    _frame.setFab(null);
  }

  gotoConsoleiT() {
    window.location.href = "https://bjmun.org/console-it/client/";
  }
}
