import {Http, Response, Headers, RequestOptions} from '@angular/http'
import {Injectable} from '@angular/core'

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
  private forms: [{ name: string, title: string, role: string }];

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
    this.forms = data.forms;
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

  getFormDescs() {
    return this.forms;
  }

  getFormDesc(formId: string) {
    let filtered = this.forms.filter(e => e.name == formId);
    if(filtered.length == 0) return null;
    else return filtered[0];
  }

  registerSubmissions(data: any) {
    this.submissions = data;
  }

  getSubmissions() {
    return this.submissions;
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

  getAllForms(cb: (form: any) => void) {
    console.log("HA");
    this.get(`/${this.conf._id}/form/all`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    })
  }

  getForm(formId: string, cb: (form: any) => void) {
    this.get(`/${this.conf._id}/form/${formId}`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  postForm(formId: string, data: { content: any, title: string }, cb: (result: any) => void) {
    this.post(`/${this.conf._id}/form/${formId}/content`, data, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getFormResult(formId: string, uid: number, cb: (result: any) => void) {
    this.get(`/${this.conf._id}/form/${formId}/submission/${uid}`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb({
          status: res.new ? '未提交' : (res.status ? res.status : '审核中'),
          new: res.new,
          locked: res.locked,
          submission: res.submission
        });
      }
    });
  }

  lockFormResult(formId: string, uid: number, cb: (result: any) => void) {
    this.put(`/${this.conf._id}/form/${formId}/submission/${uid}/lock`, {}, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  unlockFormResult(formId: string, uid: number, cb: (result: any) => void) {
    this.delete(`/${this.conf._id}/form/${formId}/submission/${uid}/lock`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getNote(formId: string, uid: number, cb: (note: string) => void) {
    this.get(`/${this.conf._id}/form/${formId}/submission/${uid}/note`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res.note);
      }
    });
  }

  postNote(formId: string, uid: number, note: string, cb: () => void) {
    this.post(`/${this.conf._id}/form/${formId}/submission/${uid}/note`, { note }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb();
      }
    });
  }

  postApplication(formId: string, uid: number, data: any, cb: (result: any) => void) {
    this.post(`/${this.conf._id}/form/${formId}/submission/${uid}`, {content: data}, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getFormResults(formId: string, cb: (result: any) => void) {
    this.get(`/${this.conf._id}/form/${formId}/submissions`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }
}
