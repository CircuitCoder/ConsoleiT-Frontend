import {Component} from 'angular2/core'
import {CICardView, CICard, CICardService} from './card'
import {MDL} from './mdl'

@Component({
  templateUrl: 'view/dashboard.html',
  directives: [CICard, MDL],
  providers: [CICardService]
})

export class CIDashboard extends CICardView{
  constructor(cardService: CICardService) {
    super(cardService);
  }

  gotoGithub() {
    window.location.href="https://github.com/CircuitCoder/ConsoleiT-Frontend";
  }

  gotoConsoleiT() {
    window.location.href="https://bjmun.org/console-it/client/"
  }
}
