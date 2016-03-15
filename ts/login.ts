import {HTTP_PROVIDERS, Http, Response, Headers, RequestOptions} from 'angular2/http'

import {Injectable} from 'angular2/core'
import {CILoginData} from './data'
import {CINotifier} from './notifier'
import {CIHttp} from './http'
import * as Config from './config'

export interface CIUser {
  realname: string,
  email: string
}

@Injectable()
export class CILoginService extends CIHttp {

  private static listeners = new Array<CILoginService.Listener>();

  private static user:CIUser = null;

  constructor(
    _http: Http,
    private _notifier: CINotifier
  ) {
    super(_http, '/account');
  }
  
  addListener(l: CILoginService.Listener) {
    CILoginService.listeners.push(l);
  }

  doLogin(email: String, passwd: String) {
    this.post('/login', { email, passwd }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else if(res.error) {
        this._notifier.show(res.error);
      } else {
        CILoginService.user = <CIUser> res.user;
        CILoginService.listeners.forEach((l) => {
          if(l.onLogin) l.onLogin(<CIUser> res.user);
        });
      }
    });
  }

  doLogout() {
    this.get('/logout', (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else if(res.error) {
        this._notifier.show(res.error);
      } else {
        this._notifier.show(res.msg);
        CILoginService.user = null;
        CILoginService.listeners.forEach((l) => {
          if(l.onLogout) l.onLogout();
        });
      }
    });
  }

  doRegister(email: String, realname: String, next: () => void) {
    this.post('/register', { email, realname }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else if(res.error) {
        this._notifier.show(res.error);
      } else {
        this._notifier.show(res.msg);
        return next();
      }
    });
  }

  doRestore() {
    this.get('/restore', (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show('$Unknown');
      } else {
        if(res.user) {
          CILoginService.user = res.user;
        }

        CILoginService.listeners.forEach((l) => {
          if(l.onRestore) l.onRestore(res.error, <CIUser> res.user);
        });
      }
    });
  }

  doChangePasswd(oripasswd: String, passwd: String, next: () => void) {
    this.post('/settings/passwd', { oripasswd, passwd }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else if(res.error) {
          this._notifier.show(res.error);
      } else {
        this._notifier.show(res.msg);
        return next();
      }
    });
  }

  getUser() {
    return CILoginService.user;
  }

  isLoggedIn() {
    return CILoginService.user != null;
  }
}

export module CILoginService {
  export interface Listener {
    onLogin?: (user: CIUser) => void;
    onLogout?: () => void;
    onRestore?: (error: string, user: CIUser) => void;
  }
}
