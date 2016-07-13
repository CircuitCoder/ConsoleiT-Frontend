import {Component} from "@angular/core";
import {Router, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {CICardView, CICard, CICardService} from "../../card";
import {CIFrameService} from "../../frame.service";
import {CIConfService, CIConfCommitteeSpec} from "../../conf";
import {CILoginService} from "../../login";
import {CINotifier} from "../../notifier";
import {MDL} from "../../mdl";

@Component({
  template: require("html/view/conf/committee.html"),
  directives: [MDL, CICard, ROUTER_DIRECTIVES]
})

export class CIConfCommittee extends CICardView {
  constructor(
    _card: CICardService,
    _frame: CIFrameService,
    private _router: Router,
    private _notifier: CINotifier,
    private _login: CILoginService,
    private _conf: CIConfService) {
      super(_card);
    }
}
