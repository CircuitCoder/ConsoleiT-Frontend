import {Inject, Component, OnInit} from 'angular2/core'
import {ComponentInstruction, CanActivate, Router,  AuxRoute, RouteConfig, RouteParams, ROUTER_DIRECTIVES, OnActivate, RouterOutlet} from 'angular2/router'

import {CICardView, CICard, CICardService} from '../card'
import {CIConfService} from '../conf'
import {MDL} from '../mdl'

import * as CIUtil from '../util'

@Component({
  templateUrl: 'view/conf/academic.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

class CIConfAcademic extends CICardView {
}


@Component({
  templateUrl: 'view/conf/index.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

class CIConfHome extends CICardView {

  confData: any;
  confStatus: string;
  confGroup: any;
  confMembers: any;
  confRoles: any;

  constructor(_card: CICardService, private _conf: CIConfService) {
    super(_card);
    console.log("construct");
  }

  routerOnActivate() {
    this.confData = this._conf.getConf();
    this.confStatus = this._conf.getStatus();
    this.confMembers = this._conf.getMemberMap();
    this.confGroup = this._conf.getGroup();
    this.confRoles = this._conf.getRoleMap();

    console.log(this.confRoles);
    this.confData.members.sort((e: any) => e.role );
    Object.keys(this.confMembers).forEach((e: any) => {
      this.confMembers[e].gravatar = CIUtil.generateGravatar(this.confMembers[e].email);
    });

    return super.routerOnActivate();
  }
}

@Component({
  template: '<router-outlet></router-outlet>',
  directives: [RouterOutlet],
})

@RouteConfig([
  {
    path: '/',
    name: 'Home',
    component: CIConfHome,
    useAsDefault: true
  }, {
    path: '/academic',
    name: 'Academic',
    component: CIConfHome
  }
])

export class CIConf {

  confId: number;

  constructor(routeParams: RouteParams, private _confService: CIConfService, @Inject(Router) private _router: Router) {
    this.confId = +routeParams.get('id');
  }

  routerOnActivate(next: ComponentInstruction) {
    var outer = this;
    console.log(next);

    return new Promise<void>((resolve, reject) => {
      outer._confService.getData(outer.confId, (data) => {
        console.log(data);
        outer._confService.registerConf(data);
        resolve();
      });
    });
  }
}

