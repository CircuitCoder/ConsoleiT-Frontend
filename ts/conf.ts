import {Http, Response, Headers, RequestOptions} from 'angular2/http'
import {Injectable} from 'angular2/core'

import {CIHttp} from './http'
import {CINotifier} from './notifier'

@Injectable()
export class CIConfService extends CIHttp {
  constructor(_http: Http, private _notifier: CINotifier) {
    super(_http, '/conf');
  }

  private conf: any;
  private members: any;
  private group: any;

  private submissions: any;
  private applicants: any;

  private STATUS_MAP: {[id: number]: string;} = {
    0: "进行准备",
    1: "招募学术团队",
    2: "审核学术团队",
  };

  registerConf(data: any) {
    this.conf = data.conf;
    this.members = data.members;
    this.group = data.group;
  }

  getConf() {
    return this.conf;
  }

  getMemberMap() {
    return this.members.reduce((prev: any, e: any) => {
      prev[e._id] = e;
      return prev;
    }, {});
  }

  getRoleMap() {
    return this.conf.roles.reduce((prev: any, e: any) => {
      prev[e._id] = e;
      return prev;
    }, {});
  }

  getGroup() {
    return this.group;
  }

  registerSubmissions(data: any) {
    this.submissions = data.list;
    this.applicants = data.members;
  }

  getApplicantMap() {
    return this.applicants.reduce((prev: any,e: any) => {
      prev[e._id] = e;
      return prev;
    }, {});
  }

  getSubmissions() {
    return this.submissions;
  }

  getStatus(conf?: any) {
    if(conf) return this.STATUS_MAP[conf.status];
    else return this.STATUS_MAP[this.conf.status];
  }

  hasPerm(uid: number, perm: string) {
    let roleMap = this.getRoleMap();
    let roleId = -1;
    this.conf.members.forEach((e: any) => {
      if(e._id == uid) roleId = e.role;
    });
    if(roleId == -1) return false;
    let permObj = roleMap[roleId].perm;

    let seg = perm.split('.');
    for(let i = 0; i< seg.length; ++i) {
      if(permObj.all) return true;
      else if(!(seg[i] in permObj)) return false;
      else {
        permObj = permObj[seg[i]];
        if(typeof permObj == "boolean") return permObj;
      }
    }

    return false;
  }

  getList(cb: (res: any) => void) {
    this.get('/', (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      }
      else if(res.error) this._notifier.show(res.error);
      else cb(res.confs.sort((a: any,b: any) => {
        return ((!!a.pinned)!==(!!b.pinned)) ? a.pinned : a.title.localeCompare(b.title);
      }));
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
    this.get(`/${id}`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      }
      else if(res.error) this._notifier.show(res.error);
      else cb(res);
    });
  }

  /* Settings */
  postSettings(id: number, settings: any, cb: (res: any) => void) {
    this.post(`/${id}`, settings, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      }
      else if(res.error) this._notifier.show(res.error);
      else cb(res);
    });
  }

  updateMember(id: number, role: number) {
  }

  deleteMember(id: number) {
  }

  /* Forms */

  getForm(formType: string, cb: (form: any) => void) {
    let id = this.conf._id;
    this.get(`/${id}/${formType}/form`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  postForm(formType: string, data: any, cb: (result: any) => void) {
    let id = this.conf._id;
    this.post(`/${id}/${formType}/form`, {form: data}, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getFormResult(formType: string, uid: number, cb: (result: any) => void) {
    this.get(`/${this.conf._id}/${formType}/${uid}`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb({
          status: res.status?res.status:0,
          locked: res.locked,
          submission: res.submission?JSON.parse(res.submission):{}
        });
      }
    });
  }

  lockFormResult(formType: string, uid: number, cb: (result: any) => void) {
    this.put(`/${this.conf._id}/${formType}/${uid}/lock`, {}, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  unlockFormResult(formType: string, uid: number, cb: (result: any) => void) {
    this.delete(`/${this.conf._id}/${formType}/${uid}/lock`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getNote(formType: string, uid: number, cb: (note: string) => void) {
    this.get(`/${this.conf._id}/${formType}/${uid}/note`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res.note);
      }
    });
  }

  postNote(formType: string, uid: number, note: string, cb: () => void) {
    this.post(`/${this.conf._id}/${formType}/${uid}/note`, { note }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb();
      }
    });
  }

  deleteFormResult(formType: string, uid: number, cb: (result: any) => void) {
    this.delete(`/${this.conf._id}/${formType}/${uid}`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  postApplication(formType: string, uid: number, data: any, cb: (result: any) => void) {
    this.post(`/${this.conf._id}/${formType}/${uid}`, {content: data}, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getFormResults(formType: string, cb: (result: any) => void) {
    this.get(`/${this.conf._id}/${formType}/all`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }
}
