import {Http, Response, Headers, RequestOptions} from '@angular/http'

import {Injectable} from '@angular/core'
import {CIHttp} from './http'
import {CINotifier} from './notifier'

@Injectable()
export class CIUserService extends CIHttp {
  constructor(
    _http: Http,
    private _notifier: CINotifier
  ) {
    super(_http, '/user');
  }

  getSelfInfo(id: number, cb: (data: any) => void) {
    this.get(`/${id}/self`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        return cb(res);
      }
    });
  }

  getUserInfo(id: number, cb: (data: any) => void) {
    this.get(`/${id}`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        return cb(res);
      }
    });
  }

  updateUserInfo(id: number, data: any, cb: (data: any) => void) {
    this.post(`/${id}`, data, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        return cb(res);
      }
    });
  }
}
