import {Http, Response, Headers, RequestOptions} from 'angular2/http'
import {Injectable} from 'angular2/core'

import {CIHttp} from './http'
import {CINotifier} from './notifier'

@Injectable()
export class CIConfService extends CIHttp {
  constructor(_http: Http, private _notifier: CINotifier) {
    super(_http, '/conf');
  }

  private static conf: any;

  private static STATUS_MAP: {[id: number]: string;} = {
    0: "进行准备",
    1: "招募学术团队",
  };

  registerConf(conf: any) {
    CIConfService.conf = conf;
  }

  getConf() {
    return CIConfService.conf;
  }

  getStatus() {
    return CIConfService.STATUS_MAP[CIConfService.conf.status];
  }

  getList(cb: (res: any) => void) {
    this.get('/', (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      }
      else if(res.error) this._notifier.show(res.error);
      else cb(res.confs);
    });
  }

  getAvailList(cb: (res: any) => void) {
    this.get('/available', (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      }
      else if(res.error) this._notifier.show(res.error);
      else cb(res.confs);
    });
  }

  getData(id: Number, cb: (res: any) => void) {
    this.get('/' + id, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      }
      else if(res.error) this._notifier.show(res.error);
      else cb(res);
    });
  }

  /* Settings */
  updateMember(id: Number, role: Number) {
  }

  deleteMember(id: Number) {
  }

  /* Forms */
  updateForm() {
  }

  getForm() {
  }

  postForm() {
  }

  getFormResults() {
  }
}
