import {Injectable, Component} from 'angular2/core'

import {CICard, CICardView, CICardService} from '../card'
import {CILoginService, CIUser} from '../login'
import {CIFrameService} from '../frame.service'
import {CIUserService} from '../user'
import {CINotifier} from '../notifier'
import {MDL} from '../mdl'

@Component({
  templateUrl: 'view/profile.html',
  directives: [CICard, MDL]
})

export class CIProfile extends CICardView {
  oripasswd: String;
  passwd: String;

  account: CIUser;
  user: any;

  constructor(_card: CICardService,
    private _login: CILoginService,
    private _notifier: CINotifier,
    private _user: CIUserService,
    _frame: CIFrameService) {
      super(_card);
      this.account = _login.getUser();
      this.user = null;
      _frame.setTitle("个人资料");
      _frame.setTabs([]);
      _frame.setFab(null);

      _user.getSelfInfo(this.account._id, (data: any) => {
        this.user = data;
      });
    }

  updatePasswd() {
    if(!this.passwd || this.passwd == "") return this._notifier.show("InvalidInput");
    else {
      this._login.doChangePasswd(this.oripasswd, this.passwd, () => {
        // Do nothing
      });
    }
  }

  updateInfo() {
    this._user.updateUserInfo(this.account._id, { user: this.user }, (res) => {
      if(res.err) this._notifier.show(res.err);
      else this._notifier.show(res.msg);
    });
  }

  gotoGravatar() {
    window.open("//gravatar.lug.ustc.edu.cn/");
  }
}
