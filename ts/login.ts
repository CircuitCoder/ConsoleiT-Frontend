import {Injectable, Component} from 'angular2/core'
import {CICard} from './card'
import {MDL} from './mdl'

@Injectable()
export class CILoginService {

  private static listeners = new Array<CILoginService.Listener>();

  constructor() {
  }
  
  addListener(l: CILoginService.Listener) {
    CILoginService.listeners.push(l);
  }

  doLogin(username: String, passwd: String) {
    // Pretend to login
    var user = {
      username: "CircuitCoder",
      realname: "Liu Xiaoyi"
    }

    CILoginService.listeners.forEach((l) => {
      l.onLogin(user);
    });
  }

  doLogout() {
    CILoginService.listeners.forEach((l) => {
      l.onLogout();
    });
  }
}

export module CILoginService {
  export interface Listener {
    onLogin: (user: Object) => void;
    onLogout: () => void;
  }
}

@Component({
  templateUrl: 'view/login.html',
  directives: [CICard, MDL],
  providers: [CILoginService]
})

export class CILogin {
  username: String;
  passwd: String;
  isRegister: boolean;

  constructor(private _loginService: CILoginService) {
    this.username = "";
    this.passwd = "";
    this.isRegister = false;
  }

  doLogin() {
    this._loginService.doLogin(this.username, this.passwd);
  }
}
