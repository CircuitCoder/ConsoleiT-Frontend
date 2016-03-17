import {Component} from 'angular2/core'
import {RouteConfig} from 'angular2/router'

import {CICardView, CICard, CICardService} from '../card'
import {MDL} from '../mdl'

@Component({
  templateUrl: 'view/about.html',
  directives: [CICard, MDL]
})

export class CIAbout extends CICardView {
  constructor(_cardService: CICardService) {
    super(_cardService);
  }

  gotoGithubFrontend() {
    window.location.href = "//github.com/CircuitCoder/ConsoleiT-Frontend";
  }

  gotoGithubBackend() {
    window.location.href = "//github.com/CircuitCoder/ConsoleiT-Backend";
  }
}
