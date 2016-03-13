import {Injectable, Component} from 'angular2/core'
import {CICard, CICardView, CICardService} from './card'
import {CILoginService} from './login'
import {CINotifier} from './notifier'
import {MDL} from './mdl'

@Component({
  templateUrl: 'view/profile.html',
  directives: [CICard, MDL],
  providers: [CICardService, CILoginService]
})

export class CIProfile extends CICardView {
  oripasswd: String;
  passwd: String;

  constructor(_cardService: CICardService, private _loginService: CILoginService, private _notifier: CINotifier) {
    super(_cardService);
  }

  updatePasswd() {
    if(!this.passwd || this.passwd == "") return this._notifier.show("InvalidInput");
    else {
      this._loginService.doChangePasswd(this.oripasswd, this.passwd, () => {
        // Do nothing
      });
    }
  }
}
