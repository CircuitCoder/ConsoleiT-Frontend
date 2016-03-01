import {ViewChild, Injectable, Component} from 'angular2/core'
import {CICard, CICardView, CICardService} from './card'
import {MDL} from './mdl'
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteParams, Router} from 'angular2/router'
import {CILoginData} from './data'

@Injectable()
export class CILoginService {

  private static listeners = new Array<CILoginService.Listener>();

  constructor() {
  }
  
  addListener(l: CILoginService.Listener) {
    CILoginService.listeners.push(l);
  }

  doLogin(email: String, passwd: String) {
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

  doRegister(email: String, realname: String) {
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
  directives: [CICard, MDL, ROUTER_DIRECTIVES],
  providers: [CILoginService, CICardService, ROUTER_PROVIDERS]
})

export class CILogin extends CICardView {
  isRegister: boolean;
  data: CILoginData;
  @ViewChild(CICard) private loginCard:CICard;

  constructor(private _loginService: CILoginService,
              _cardService: CICardService,
              private _router: Router,
              private _routeParams: RouteParams) {
    super(_cardService);
    this.data = {
      realname: "",
      email: "",
      passwd: ""
    };
  }

  ngOnInit() {
    this.isRegister = this._routeParams.get('action') == 'register';
  }

  commit() {
    console.log(this.data);
    if(this.isRegister) this._loginService.doRegister(this.data.email, this.data.realname);
    else this._loginService.doLogin(this.data.email, this.data.passwd);
  }

  switchState() {
    if(this.isRegister) this._router.navigate(['Login']);
    else this._router.navigate(['Register']);
    this.loginCard.toggleContent().then(() => {
      this.isRegister = !this.isRegister;
      this.loginCard.toggleContent();
    });
  }
}
