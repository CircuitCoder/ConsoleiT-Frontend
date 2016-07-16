import {Http} from "@angular/http";
import {Injectable} from "@angular/core";

import {CIHttp} from "./http";
import {CINotifier} from "./notifier";

import {CIConfFormMetadata} from "./data";

export interface CIConfRegistrantPreview {
  locked: boolean;
  payment: boolean;
  user: number;
  profile: {
    _id: number;
    realname: string;
    schoolName: string;
  };
  submission: any;
}

export interface CIConfRegistrantEntry extends CIConfRegistrantPreview {
  visible?: boolean;
  selected?: boolean;
  previewed?: boolean;
  preview?: boolean;
  cache?: any;
  loaded?: boolean;
}

export interface CIConfCommitteePreview {
  title: string;
  name: string;
}

export interface CIConfCommitteeSpec extends CIConfCommitteePreview {
  conf: number;
}

export interface CIConfSeatSpec {
  id: string;
  title: string;
  count: number;
  group?: string;
}

export interface CIConfCommitteeData extends CIConfCommitteeSpec {
  admins: number[];
  daises: number[];
  seats: CIConfSeatSpec[];
}

export interface CIConfFormPreview {
  name: string;
  title: string;
  role: string;
}

export interface CIConfParticipant {
  user: number;
  group: string;
}

export interface CIConfParticipantPreview extends CIConfParticipant {
  profile: {
    _id: number;
    realname: string;
    schoolName: string;
    email: string;
  };
}

@Injectable()
export class CIConfService extends CIHttp {
  constructor(_http: Http, private _notifier: CINotifier) {
    super(_http, "/conf");
  }

  private conf: any;
  private members: any;
  private group: any;
  private forms: CIConfFormPreview[];
  private committees: CIConfCommitteePreview[];

  private registrants: CIConfRegistrantPreview[];
  private keywords: any;

  registerConf(data: any) {
    this.conf = data.conf;
    this.members = data.members;
    this.group = data.group;
    this.forms = data.forms;
    this.committees = data.committees;
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
    let filtered = this.forms.filter(e => e.name === formId);
    if(filtered.length === 0) return null;
    else return filtered[0];
  }

  getCommittees() {
    return this.committees;
  }

  registerFormResults(data: any) {
    this.registrants = data.registrants;
    this.keywords = data.keywords;
  }

  getRegistrants() {
    return this.registrants;
  }

  getKeywords() {
    return this.keywords;
  }

  hasPerm(uid: number, perm: string) {
    let roleMap = this.getRoleMap();
    let roleId = -1;
    this.conf.members.forEach((e: any) => {
      if(e._id === uid) roleId = e.role;
    });
    if(roleId === -1) return false;
    let permObj = roleMap[roleId].perm;

    let seg = perm.split(".");
    for(let i = 0; i < seg.length; ++i) {
      if(permObj.all) return true;
      else if(!(seg[i] in permObj)) return false;
      else {
        permObj = permObj[seg[i]];
        if(typeof permObj === "boolean") return permObj;
      }
    }

    return false;
  }

  getList(cb: (res: any) => void) {
    this.get("/", (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      }
      else if(res.error) this._notifier.show(res.error);
      else cb(res.confs.sort((a: any, b: any) => {
        return ((!!a.pinned) !== (!!b.pinned)) ? a.pinned : a.title.localeCompare(b.title);
      }));
    });
  }

  getAvailList(cb: (res: any) => void) {
    this.get("/available", (err, res) => {
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
    this.get(`/${this.conf._id}/form/all`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  createForm(id: string, title: string, cb: (data: any) => void) {
    this.post(`/${this.conf._id}/form`, {
      id, title
    }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
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

  postForm(formId: string, data: {
    content: any[],
    indicators: any[],
    meta: CIConfFormMetadata,
    title: string
  }, cb: (result: any) => void) {
    this.post(`/${this.conf._id}/form/${formId}/content`, data, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  postFormStatus(formId: string, status: string, cb: (result: any) => void) {
    this.put(`/${this.conf._id}/form/${formId}/settings/${status}`, {}, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  deleteForm(formId: string, cb: (result: any) => void) {
    this.delete(`/${this.conf._id}/form/${formId}`, (err, res) => {
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
        res.application.status = res.application.new ? "未提交"
            : (res.application.status ? res.application.status : "已提交");
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

  performAction(formId: string, action: string, applicants: number[], cb: (result: any) => void) {
    this.post(`/${this.conf._id}/form/${formId}/perform/${action}`, { applicants }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  /**
   * Committees
   */

  getAllCommittees(cb: (committees: CIConfCommitteeSpec[]) => void) {
    this.get(`/${this.conf._id}/committee/all`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getCommittee(commId: string, cb: (result: any) => void) {
    this.get(`/${this.conf._id}/committee/${commId}`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  createCommittee(commId: string, title: string, cb: (result: any) => void) {
    this.post(`/${this.conf._id}/committee`, { id: commId, title }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  updateMembers(commId: string, role: string, uids: number[], cb: (result: any) => void) {
    this.post(`/${this.conf._id}/committee/${commId}/${role}`, { uids }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  getParticipants(commId: string, cb: (result: CIConfParticipantPreview[]) => void) {
    this.get(`/${this.conf._id}/committee/${commId}/participants`, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(<CIConfParticipantPreview[]> res);
      }
    });
  }

  syncParticipants(commId: string, participants: CIConfParticipant[], cb: (result: any) => void) {
    this.post(`/${this.conf._id}/committee/${commId}/participants`, { participants }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }

  syncSeats(commId: string, seats: CIConfSeatSpec[], cb: (result: any) => void) {
    this.post(`/${this.conf._id}/committee/${commId}/seats`, { seats }, (err, res) => {
      if(err) {
        console.log(err);
        this._notifier.show("$Unknown");
      } else {
        cb(res);
      }
    });
  }
}
