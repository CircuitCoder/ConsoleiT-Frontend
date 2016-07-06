import {ElementRef, ViewChild, Component} from "@angular/core";
import {Router, RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Observable} from "rxjs/Rx";

import {CICardView, CICard, CICardService} from "../../card";
import {CIConfService, CIConfRegistrantEntry} from "../../conf";
import {CIFrameService, CIFrameSubfabDefination} from "../../frame.service";
import {CINotifier} from "../../notifier";
import {MDL} from "../../mdl";

@Component({
  template: require("html/view/conf/application-list.html"),
  directives: [CICard, ROUTER_DIRECTIVES, MDL]
})

export class CIConfApplicationList extends CICardView {

  formId: string;

  loaded: boolean = false;
  registrants: CIConfRegistrantEntry[] = [];
  keywords: any[] = [];

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

  @ViewChild("searchInput") searchInput: ElementRef;

  constructor(_card: CICardService,
              params: RouteParams,
              private _notifier: CINotifier,
              private _conf: CIConfService,
              private _frame: CIFrameService,
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

      this.registrants.forEach((e) => {
        e.visible = true;
        e.selected = false;
      });

      this.sortBy("name");
      this.visible = this.registrants.length;

      this.loaded = true;
    });

    this._conf.getForm(this.formId, (res) => {
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

      this._frame.setFab({
        icon: "more_vert",
        action: () => {
          this._frame.toggleSubfabs();
        },
        subfabs: subfabs
      });
    });

    return super.routerOnActivate();
  }

  ngAfterViewInit() {
    const searchChanged = Observable.fromEvent(this.searchInput.nativeElement, "keyup").debounceTime(200).distinctUntilChanged();
    searchChanged.subscribe(() => this.refilter());
    super.ngAfterViewInit();
  }

  getKwRepr(kw: any, value: any) {
    if(kw.type === "checkbox") {
      if(!value) return "";
      else return kw.choices.filter((e: any, i: any) => value[i].title).join(", ");
    } else if(kw.type === "radio") {
      return (kw.choices[value] === undefined || kw.choices[value].title === undefined) ? "" : kw.choices[value].title;
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
      else if(e.profile.realname && e.profile.realname.indexOf(this.searchStr) !== -1) e.visible = true;
      else if(e.profile.schoolName && e.profile.schoolName.indexOf(this.searchStr) !== -1) e.visible = true;
      else {
        // Search in keywords
        e.visible = this.keywords.some(k => this.getKwRepr(k.field, e.submission[k.id]).indexOf(this.searchStr) !== -1);
      }

      if(e.visible) {
        ++this.visible;
        if(e.selected) ++this.visibleSelected;
      }
    });
  }

  /* Jump */
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
}
