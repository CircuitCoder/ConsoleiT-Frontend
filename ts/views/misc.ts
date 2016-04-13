import {Component} from 'angular2/core'
import {RouteConfig} from 'angular2/router'

import {CICardView, CICard, CICardService} from '../card'
import {CIFrameService} from '../frame.service'
import {MDL} from '../mdl'

@Component({
  templateUrl: 'view/about.html',
  directives: [CICard, MDL]
})

export class CIAbout extends CICardView {
  constructor(_cardService: CICardService, _frame: CIFrameService) {
    super(_cardService);
    _frame.setTitle("关于");
    _frame.setTabs([]);
  }

  gotoJoin() {
    window.open("//bjmun.org/tt/join");
  }

  gotoGithubFrontend() {
    window.open("//github.com/CircuitCoder/ConsoleiT-Frontend");
  }

  gotoGithubBackend() {
    window.open("//github.com/CircuitCoder/ConsoleiT-Backend");
  }

  gotoAuthor() {
    window.open("//github.com/CircuitCoder");
  }
}
