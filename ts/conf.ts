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
  private static members: any;
  private static group: any;

  private static STATUS_MAP: {[id: number]: string;} = {
    0: "进行准备",
    1: "招募学术团队",
  };

  registerConf(data: any) {
    CIConfService.conf = data.conf;
    CIConfService.members = data.members;
    CIConfService.group = data.group;
  }

  getConf() {
    return CIConfService.conf;
  }

  getMemberMap() {
    return CIConfService.members.reduce((prev: any, e: any) => {
      prev[e._id] = e;
      return prev;
    }, {});
  }

  getRoleMap() {
    return CIConfService.conf.roles.reduce((prev: any, e: any) => {
      prev[e._id] = e;
      return prev;
    }, {});
  }

  getGroup() {
    return CIConfService.group;
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

  getData(id: number, cb: (res: any) => void) {
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
  updateMember(id: number, role: number) {
  }

  deleteMember(id: number) {
  }

  /* Forms */
  updateForm() {
  }

  getForm(formType: string, cb: (form: any) => void) {
    let id = CIConfService.conf._id;
    this.get('/' + id + '/' + formType + '/form', (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  postForm(formType: string, data: any, cb: (result: any) => void) {
    let id = CIConfService.conf._id;
    this.post('/' + id + '/' + formType + '/form', {form: data}, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getFormResult(formType: string, uid: number, cb: (result: any) => void) {
    this.get('/' + CIConfService.conf._id + '/' + formType + '/' + uid, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getFormResults() {
  }
}
