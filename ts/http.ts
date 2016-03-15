import {HTTP_PROVIDERS, Http, Response, Headers, RequestOptions} from 'angular2/http'

import * as Config from './config'

export class CIHttp {
  private urlBase = 'http://' + Config.backend.host + ':' + Config.backend.port;
  private reqOpt = new RequestOptions({
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });

  constructor(private _http: Http, prefix: string) {
    this.urlBase += prefix;
  }

  protected get(action: string, cb: (err: any, res: any) => void) {
    let req = this._http.get(
      this.urlBase + action,
      this.reqOpt
    );

    req.subscribe((res) => {
      cb(false, res.json());
    }, (error) => {
      cb(error, null);
    });
  }

  protected post(action: string, data: any, cb: (err: any, res: any) => void) {
    let req = this._http.post(
      this.urlBase + action,
      JSON.stringify(data),
      this.reqOpt
    );
    req.subscribe((res) => {
      cb(false, res.json());
    }, (error) => {
      cb(error, null);
    });
  }
}
