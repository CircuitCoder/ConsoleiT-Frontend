import {Injectable, Component} from 'angular2/core'

import {CICard, CICardView, CICardService} from '../card'
import {CILoginService, CIUser} from '../login'
import {CIFrameService} from '../frame.service'
import {CINotifier} from '../notifier'
import {MDL} from '../mdl'

@Component({
  templateUrl: 'view/profile.html',
  directives: [CICard, MDL]
})

export class CIProfile extends CICardView {
  oripasswd: String;
  passwd: String;

  user: CIUser;

  constructor(_cardService: CICardService,
    private _loginService: CILoginService,
    private _notifier: CINotifier,
    _frame: CIFrameService) {
      super(_cardService);
      this.user = _loginService.getUser();
      _frame.setState("个人资料", []);
    }

  updatePasswd() {
    if(!this.passwd || this.passwd == "") return this._notifier.show("InvalidInput");
    else {
      this._loginService.doChangePasswd(this.oripasswd, this.passwd, () => {
        // Do nothing
      });
    }
  }

  gotoGravatar() {
    window.open("//gravatar.lug.ustc.edu.cn/");
  }
}
