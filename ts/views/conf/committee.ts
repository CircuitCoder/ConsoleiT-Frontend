import {Component} from "@angular/core";
import {Router, RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {CICardView, CICard, CICardService} from "../../card";
import {CIFrameService} from "../../frame.service";
import {CIConfService, CIConfCommitteeSpec} from "../../conf";
import {CILoginService} from "../../login";
import {CINotifier} from "../../notifier";
import {MDL} from "../../mdl";
import {CIAvatar} from "../../avatar";

@Component({
  template: require("html/view/conf/committee.html"),
  directives: [MDL, CICard, ROUTER_DIRECTIVES, CIAvatar]
})

export class CIConfCommittee extends CICardView {

  commId: string;
  data: CIConfCommitteeSpec = null;
  isAdmin: boolean;
  isDais: boolean;

  constructor(
    _card: CICardService,
    _frame: CIFrameService,
    _params: RouteParams,
    private _router: Router,
    private _login: CILoginService,
    private _notifier: CINotifier,
    private _conf: CIConfService) {
      super(_card);
      _frame.setFab(null);
      this.commId = _params.get('comm');
    }

  ngAfterViewInit() {
    return new Promise((resolve, reject) => {
      this._conf.getCommittee(this.commId, (res) => {
        this.data = res;

        const uid = this._login.getUser()._id;
        this.isAdmin = res.admins.indexOf(uid) !== -1;
        this.isDais = res.daises.indexOf(uid) !== -1;

        setTimeout(resolve);
      });
    }).then(() => super.ngAfterViewInit());
  }
}
