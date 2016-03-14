import {HTTP_PROVIDERS, Http, Response, Headers, RequestOptions} from 'angular2/http'

import {Injectable} from 'angular2/core'
import {CILoginData} from './data'
import {CINotifier} from './notifier'
import * as Config from './config'

export interface CIUser {
  realname: string,
  email: string
}

@Injectable()
export class CILoginService {

  private static listeners = new Array<CILoginService.Listener>();
  private static urlBase = 'http://' + Config.backend.host + ':' + Config.backend.port + '/account/';
  private static reqOpt = new RequestOptions({
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });

  private static user:CIUser = null;

  constructor(
    private _http: Http,
    private _notifier: CINotifier
  ) { }
  
  addListener(l: CILoginService.Listener) {
    CILoginService.listeners.push(l);
  }

  doLogin(email: String, passwd: String) {
    let req = this._http.post(
      CILoginService.urlBase + 'login',
      JSON.stringify({ email, passwd }),
      CILoginService.reqOpt
    );
    req.subscribe((res) => {
      let data = res.json();
      if(data.error) {
        this._notifier.show(data.error);
      } else {
        CILoginService.user = <CIUser> data.user;
        CILoginService.listeners.forEach((l) => {
          if(l.onLogin) l.onLogin(<CIUser> data.user);
        });
      }
    }, (error) => {
      console.log(error);
      this._notifier.show("$Unknown");
    });
  }

  doLogout() {
    let req = this._http.get(
      CILoginService.urlBase + 'logout',
      CILoginService.reqOpt
    );
    req.subscribe((res) => {
      var data = res.json();
      if(data.error) {
        this._notifier.show(data.error);
      } else {
        this._notifier.show(data.msg);
        CILoginService.user = null;
        CILoginService.listeners.forEach((l) => {
          if(l.onLogout) l.onLogout();
        });
      }
    }, (error) => {
      console.log(error);
      this._notifier.show('$Unknown');
    });
  }

  doRegister(email: String, realname: String, next: () => void) {
    let req = this._http.post(
      CILoginService.urlBase + 'register',
      JSON.stringify({ email, realname }),
      CILoginService.reqOpt
    );
    req.subscribe((res) => {
      let data = res.json();
      if(data.error) {
        this._notifier.show(data.error);
      } else {
        this._notifier.show(data.msg);
        return next();
      }
    }, (error) => {
      console.log(error);
      this._notifier.show("$Unknown");
    });
  }

  doRestore() {
    let req = this._http.get(
      CILoginService.urlBase + 'restore',
      CILoginService.reqOpt
    );
    req.subscribe((res) => {
      let data = res.json();
      if(data.user) {
        CILoginService.user = data.user;
      }

      CILoginService.listeners.forEach((l) => {
        if(l.onRestore) l.onRestore(data.error, <CIUser> data.user);
      });
    }, (error) => {
      console.log(error);
      this._notifier.show('$Unknown');
    });
  }

  doChangePasswd(oripasswd: String, passwd: String, next: () => void) {
    let req = this._http.post(
      CILoginService.urlBase + 'settings/passwd',
      JSON.stringify({ oripasswd, passwd }),
      CILoginService.reqOpt
    );
    req.subscribe((res) => {
      let data = res.json();
      if(data.error) {
        this._notifier.show(data.error);
      } else {
        this._notifier.show(data.msg);
        return next();
      }
    }, (error) => {
      console.log(error);
      this._notifier.show("$Unknown");
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
