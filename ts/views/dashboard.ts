import {Component} from 'angular2/core'
import {ROUTER_DIRECTIVES} from 'angular2/router'

import {CICardView, CICard, CICardService} from '../card'
import {CIFrameService} from '../frame.service'
import {CILoginService, CIUser} from '../login'
import {MDL} from '../mdl'

@Component({
  templateUrl: 'view/dashboard.html',
  directives: [CICard, MDL, ROUTER_DIRECTIVES]
})

export class CIDashboard extends CICardView{

  user: CIUser;

  constructor(_cardService: CICardService, private _loginService: CILoginService, _frame: CIFrameService) {
    super(_cardService);
    this.user = _loginService.getUser();
    _frame.setState("主页", []);
  }

  gotoGithub() {
    window.location.href="https://github.com/CircuitCoder/ConsoleiT-Frontend";
  }

  gotoConsoleiT() {
    window.location.href="https://bjmun.org/console-it/client/"
  }
}
