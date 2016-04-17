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

  constructor(_card: CICardService,
    private _login: CILoginService,
    private _notifier: CINotifier,
    _frame: CIFrameService) {
      super(_card);
      this.user = _login.getUser();
      _frame.setTitle("个人资料");
      _frame.setTabs([]);
      _frame.setFab(null);
    }

  updatePasswd() {
    if(!this.passwd || this.passwd == "") return this._notifier.show("InvalidInput");
    else {
      this._login.doChangePasswd(this.oripasswd, this.passwd, () => {
        // Do nothing
      });
    }
  }

  gotoGravatar() {
    window.open("//gravatar.lug.ustc.edu.cn/");
  }
}
