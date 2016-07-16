import {ElementRef, ViewChild, Component} from "@angular/core";
import {Router, RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Observable} from "rxjs/Rx";

import {CICardView, CICard, CICardService} from "../../card";
import {CIConfService, CIConfRegistrantEntry, CIConfCommitteePreview, CIConfParticipant} from "../../conf";
import {CIFrameService, CIFrameSubfabDefination} from "../../frame.service";
import {CILoginService} from "../../login";
import {CINotifier} from "../../notifier";
import {MDL} from "../../mdl";
import * as CIUtil from "../../util";

interface PairingRow {
  reg: CIConfRegistrantEntry;
  ptname: string;
  ptreg?: CIConfRegistrantEntry;

  selected: boolean;
};

@Component({
  template: require("html/view/conf/application-list.html"),
  directives: [CICard, ROUTER_DIRECTIVES, MDL]
})

export class CIConfApplicationList extends CICardView {

  formId: string;

  loaded: boolean = false;
  registrants: CIConfRegistrantEntry[] = [];
  keywords: any[] = [];

  /* Preview */
  form: any[] = [];
  cache: { applicant: any, application: any }[] = [];

  currentSort: {
    name: string,
    spec: number,
    ascending: boolean
  } = {
    name: undefined,
    spec: undefined,
    ascending: true
  };

  meta: any = {};

  searchStr: string = "";

  /* Assignment dialog */
  selectedCommittee: number = 0;
  pairingKeyword: number = 0;
  pairingKeywordPool: any[] = [];
  assignment: boolean = false;
  assignmentDialogCreated: boolean = false;
  @ViewChild("assignmentSelect") assignmentSelect: ElementRef;

  pairingSucceeded: PairingRow[] = [];
  pairingFailed: PairingRow[] = [];
  pairing: boolean = false;
  pairingDialogCreated: boolean = false;
  pairingPerforming: boolean = false;
  @ViewChild("pairingSelect") pairingSelect: ElementRef;

  committees: CIConfCommitteePreview[] = [];

  @ViewChild("searchInput") searchInput: ElementRef;

  constructor(_card: CICardService,
              params: RouteParams,
              private _notifier: CINotifier,
              private _conf: CIConfService,
              private _frame: CIFrameService,
              private _login: CILoginService,
              private _router: Router) {
    super(_card);
    this.formId = params.get("form");
    _frame.setFab(null);
  }

  routerOnActivate() {
    this._conf.getFormResults(this.formId, (res) => {
      this._conf.registerFormResults(res);
      this.registrants = this._conf.getRegistrants();
      this.keywords = this._conf.getKeywords();
      this.pairingKeywordPool = this.keywords.filter(e => e.field.type === "input" || e.field.type === "area");

      this.registrants.forEach((e) => {
        e.visible = true;
        e.selected = false;
      });

      this.sortBy("name");
      this.visible = this.registrants.length;

      this.loaded = true;
    });

    this._conf.getForm(this.formId, (res) => {
      this.form = res.content;
      this.meta = res.meta;
      let subfabs: CIFrameSubfabDefination[]  = [{
        icon: "lock_outline",
        action: () => {
          this.perform("lock");
        },
      }, {
        icon: "lock_open",
        action: () => {
          this.perform("unlock");
        },
      }];

      if(this.meta.payment) {
        subfabs.push({
          icon: "credit_card",
          action: () => {
            this.perform("payment");
          }
        });
      }

      if(this._conf.hasPerm(this._login.getUser()._id, "committee.manipulate")) {
        subfabs.push({
          icon: "assignment_ind",
          action: () => {
            this.assignParticipant();
          }
        });
      }

      this._frame.setFab({
        icon: "more_vert",
        action: () => {
          this._frame.toggleSubfabs();
        },
        subfabs: subfabs
      });
    });

    this.committees = this._conf.getCommittees();

    return super.routerOnActivate();
  }

  routerOnDeactivate() {
    const promises: Promise<void>[] = [];
    if(!this.assignment) {
      promises.push(new Promise<void>((resolve, reject) => {
        this.assignmentDialogCreated = false;

        setTimeout(resolve);
      }));
    } else {
      this.assignment = false;
      promises.push(Promise.resolve());
    }

    if(!this.pairing) {
      promises.push(new Promise<void>((resolve, reject) => {
        this.pairingDialogCreated = false;

        setTimeout(resolve);
      }));
    } else {
      this.pairing = false;
      promises.push(Promise.resolve());
    }

    return Promise.all(promises).then(() => super.routerOnDeactivate());
  }

  ngAfterViewInit() {
    const searchChanged = Observable.fromEvent(this.searchInput.nativeElement, "keyup").debounceTime(200).distinctUntilChanged();
    searchChanged.subscribe(() => this.refilter());

    super.ngAfterViewInit();
  }

  getFieldRepr(field: any, value: any) {
    if(field.type === "checkbox") {
      if(!value) return "";
      else return field.choices.filter((e: any, i: any) => value[i].title).join(", ");
    } else if(field.type === "radio") {
      return (field.choices[value] === undefined || field.choices[value].title === undefined) ? "" : field.choices[value].title;
    } else return value === undefined ? "" : value;
  }

  /* Selection & Refiltering */
  selected: number = 0;
  visibleSelected: number = 0;
  visible: number = 0;

  selectAll($e: Event) {
    $e.preventDefault();
    if(this.visible === 0) return;
    let target = this.visibleSelected !== this.visible;

    let modified = 0;
    this.registrants.forEach(e => {
      if(e.visible) {
        // Only apply on visible

        if(e.selected !== target) {
          e.selected = target;
          ++modified;
        }
      }
    });

    if(target) {
      this.selected += modified;
      this.visibleSelected = this.visible;
    }

    else {
      this.selected -= modified;
      this.visibleSelected = 0;
    }
  }

  select(i: number, $event: Event) {
    $event.stopPropagation();
    this.registrants[i].selected = !this.registrants[i].selected;
    if(this.registrants[i].selected) {
      ++this.selected;
      ++this.visibleSelected;
    } else {
      --this.selected;
      --this.visibleSelected;
    }
  }

  sortBy(name: string, spec?: number) {
    if(this.currentSort.name === name && this.currentSort.spec === spec) {
      this.currentSort.ascending = !this.currentSort.ascending;
    } else {
      this.currentSort.name = name;
      this.currentSort.spec = spec;
      this.currentSort.ascending = true;
    }

    if(name === "name") {
      this.registrants.sort((a, b) => {
        if(a.profile.realname === b.profile.realname) return 0;
        else return a.profile.realname < b.profile.realname ? -1 : 1;
      });
    } else if(name === "school") {
      this.registrants.sort((a, b) => {
        if(a.profile.schoolName === b.profile.schoolName) return 0;
        else return a.profile.schoolName < b.profile.schoolName ? -1 : 1;
      });
    } else if(name === "keyword") {
      this.registrants.sort((a, b) => {
        if(a.submission[spec] === undefined) return b.submission[spec] === undefined ? 0 : -1;
        else if(b.submission[spec] === undefined) return 1;

        if(a.submission[spec] === b.submission[spec]) return 0;
        else return a.submission[spec] < b.submission[spec] ? -1 : 1;
      });
    }

    if(!this.currentSort.ascending) this.registrants.reverse();
  }

  refilter() {
    this.visibleSelected = 0;
    this.visible = 0;

    this.registrants.forEach(e => {

      if(this.searchStr === "") e.visible = true;

      /* Search for meta */
      else if(this.searchStr === "已缴费") e.visible = e.payment;
      else if(this.searchStr === "未缴费") e.visible = !e.payment;
      else if(this.searchStr === "已锁定") e.visible = e.locked;
      else if(this.searchStr === "未锁定") e.visible = !e.locked;

      /* Search for profile */
      else if(e.profile.realname && e.profile.realname.indexOf(this.searchStr) !== -1) e.visible = true;
      else if(e.profile.schoolName && e.profile.schoolName.indexOf(this.searchStr) !== -1) e.visible = true;

      /* Search in keywords */
      else {
        e.visible = this.keywords.some(k => this.getFieldRepr(k.field, e.submission[k.id]).indexOf(this.searchStr) !== -1);
      }

      if(e.visible) {
        ++this.visible;
        if(e.selected) ++this.visibleSelected;
      }
    });
  }

  /* Preview & jump */
  previewApplicant($event: Event, form: string, entry: CIConfRegistrantEntry) {
    entry.preview = !entry.preview;

    // Toggle off
    if(!entry.preview) return;

    // Previously cached / requested
    if(entry.previewed) return;
    entry.previewed = true;
    this._conf.getFormResult(form, entry.user, (res: any) => {
      entry.cache = res.application.submission;
      setTimeout(() => {
        entry.loaded = true;
      });
    });
  }

  gotoApplicant($event: Event, form: string, applicant: number) {
    this._router.navigate(["Application", { form: form, uid: applicant }]);
  }

  gotoNewTab($event: Event, form: string, applicant: number) {
    $event.preventDefault();
    $event.stopPropagation();
    let url = this._router.generate(["Application", { form: form, uid: applicant }]).toLinkUrl();
    window.open(url);
  }

  /* Utility */
  stopEvent($event: Event) {
    $event.stopPropagation();
    $event.preventDefault();
  }

  /* Action */
  perform(action: string) {
    let uids = this.registrants.map(e => e.selected ? e.user : -1).filter(e => e > 0);
    if(uids.length === 0) {
      this._notifier.show("请点击复选框选出一些人。对，左边那个");
      return;
    }

    this._conf.performAction(this.formId, action, uids, (res: any) => {
      // Check if it needs to update current view
      this._notifier.show(res.msg);

      const uidSet = new Set(uids);
      const modified = this.registrants.filter(e => uidSet.has(e.user));

      if(action === "lock") {
        modified.forEach(e => {
          e.locked = true;
        });
      } else if(action === "unlock") {
        modified.forEach(e => {
          e.locked = false;
        });
      } else if(action === "payment") {
        modified.forEach(e => {
          e.payment = true;
        });
      }
    });
  }

  /* Assignment */
  assignParticipant() {
    const uids = this.registrants.filter(e => e.selected).map(e => e.user);
    if(uids.length === 0) {
      this._notifier.show("请点击复选框选出一些人。对，左边那个");
      return;
    }

    this.showAssignment();
  }

  showAssignment() {
    this.assignmentDialogCreated = true;

    setTimeout(() => {
      CIUtil.updateGetmdlSelects((it) => {
        this.selectedCommittee = it;
      }, this.assignmentSelect.nativeElement);

      CIUtil.updateGetmdlSelects((it) => {
        this.pairingKeyword = it;
      }, this.pairingSelect.nativeElement);

      CIUtil.upgradeMDL();

      this.assignment = true;
    }, 0);
  }

  closeAssignment(event: any) {
    if(event.target.className.indexOf("dialog-overlap") !== -1)
      this.assignment = false;
  }

  performPairing() {
    // Validate
    if(!this.pairingKeywordPool[this.pairingKeyword]) return this._notifier.show("请选择一个关键字");

    if(!this.pairingKeywordPool[this.pairingKeyword].id
       || !this.pairingKeywordPool[this.pairingKeyword].field)
         return this._notifier.show("喵，数据好像除了点问题，请刷新");

    if(this.pairingKeywordPool[this.pairingKeyword].field.type !== "input"
       && this.pairingKeywordPool[this.pairingKeyword].field.type !== "area")
         return this._notifier.show("由于我们使用姓名配对，请选择一个文本框或文本区类型的关键字");

    this.assignment = false;
    const kwid = this.pairingKeywordPool[this.pairingKeyword].id;

    // Perform pairing

    const selected = this.registrants.filter(e => e.selected);
    if(selected.length === 0) return this._notifier.show("请重新选择目标");

    this.pairingSucceeded = [];
    this.pairingFailed = [];

    const map: { [key: string]: CIConfRegistrantEntry } = {};
    for(let reg of selected) {
      const rn = reg.profile.realname;
      if(rn in map) // Duplicated name
        map[rn] = null;
      else
        map[rn] = reg;
    }

    for(let reg of selected) {
      if(!reg.submission) continue;

      const ptname: string = reg.submission[kwid];
      if(!ptname || !(ptname in map) || map[ptname] === null) this.pairingFailed.push({ reg: reg, ptname: ptname, selected: true });
      else {
        // Loop check
        const ptreg = map[ptname];
        if(ptreg.submission && ptreg.submission[kwid] === reg.profile.realname) {
          this.pairingSucceeded.push({ reg: reg, ptname: ptname, ptreg: ptreg, selected: true });
        } else {
          this.pairingFailed.push({ reg: reg, ptname: ptname, selected: true });
        }
      }
    }

    this.showPairing();
  }

  showPairing() {
    this.pairingDialogCreated = true;
    setTimeout(() => this.pairing = true, 0);
  }

  closePairing(event: any) {
    if(event.target.className.indexOf("dialog-overlap") !== -1)
      this.pairing = false;
  }

  confirmPairing() {
    this.pairingPerforming = true;

    const list: CIConfParticipant[] = [];

    for(let reg of this.pairingSucceeded) {
      if("uuid" in reg.ptreg)
        list.push({ user: reg.reg.user, group: (<any>reg.ptreg).uuid });
      else {
        const uuid = CIUtil.generateUUID();
        list.push({ user: reg.reg.user, group: uuid });
        (<any>reg.reg).uuid = uuid;
      }
    }

    for(let reg of this.pairingFailed) {
      if(reg.selected) list.push({ user: reg.reg.user, group: CIUtil.generateUUID() });
    }

    this._conf.appendParticipants(this.committees[this.selectedCommittee].name, list, (res) => {
      this._notifier.show(res.msg);

      this.pairingPerforming = false;
      this.pairing = false;
    });
  }

  /* Tracking */
  trackById(index: number, entry: CIConfRegistrantEntry) {
    return entry.user;
  }
}
