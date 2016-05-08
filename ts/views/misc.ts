import {Component} from '@angular/core'
import {RouteConfig} from '@angular/router-deprecated'

import {CICardView, CICard, CICardService} from '../card'
import {CIFrameService} from '../frame.service'
import {MDL} from '../mdl'

@Component({
  template: require('html/view/about.html'),
  directives: [CICard, MDL]
})

export class CIAbout extends CICardView {
  constructor(_card: CICardService, _frame: CIFrameService) {
    super(_card);
    _frame.setTitle("关于");
    _frame.setTabs([]);
    _frame.setFab(null);
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
