import {Component} from 'angular2/core'
import {CICardView, CICard, CICardService} from '../card'
import {CILoginService, CIUser} from '../login'
import {MDL} from '../mdl'

@Component({
  templateUrl: 'view/dashboard.html',
  directives: [CICard, MDL],
  providers: [CICardService]
})

export class CIDashboard extends CICardView{

  user: CIUser;

  constructor(_cardService: CICardService, private _loginService: CILoginService) {
    super(_cardService);
    this.user = _loginService.getUser();
  }

  gotoGithub() {
    window.location.href="https://github.com/CircuitCoder/ConsoleiT-Frontend";
  }

  gotoConsoleiT() {
    window.location.href="https://bjmun.org/console-it/client/"
  }
}
