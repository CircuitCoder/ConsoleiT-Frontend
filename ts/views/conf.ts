import {Component} from 'angular2/core'
import {RouteParams, ROUTER_PROVIDERS} from 'angular2/router'

import {CICardView, CICard, CICardService} from '../card'
import {MDL} from '../mdl'

@Component({
  templateUrl: 'view/conf/index.html',
  directives: [CICard, MDL],
  providers: [CICardService, ROUTER_PROVIDERS]
})

export class CIConf extends CICardView {

  confId: string;

  constructor(_cardService: CICardService, routeParams: RouteParams) {
    super(_cardService);
    this.confId = routeParams.get('id');
    console.log(this.confId);
  }
}
