import {Inject, Component, OnInit} from 'angular2/core'
import {ComponentInstruction, CanActivate, Router,  AuxRoute, RouteConfig, RouteParams, ROUTER_DIRECTIVES, OnActivate, RouterOutlet} from 'angular2/router'

import {CICardView, CICard, CICardService} from '../card'
import {CIConfService} from '../conf'
import {MDL} from '../mdl'

@Component({
  templateUrl: 'view/conf/index.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

export class CIConfHome extends CICardView {

  confData: any;
  confStatus: string;

  constructor(_card: CICardService, private _conf: CIConfService) {
    super(_card);
    console.log("construct");
  }

  routerOnActivate() {
    this.confData = this._conf.getConf();
    this.confStatus = this._conf.getStatus();

    return super.routerOnActivate();
  }
}

@Component({
  template: '<router-outlet></router-outlet>',
  directives: [RouterOutlet],
})

@RouteConfig([
  {
    path: '/home',
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
    this._router.subscribe((next: any) => {
      console.log(next);
    });
    console.log(this._router.registry);
    console.log(this._router.recognize('/conf/1/home'));
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

