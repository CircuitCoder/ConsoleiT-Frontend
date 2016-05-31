import {ElementRef, ViewChild, Component} from "@angular/core";
import {RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";
import {Observable} from "rxjs/Rx";

import {CICardView, CICard, CICardService} from "../../card";
import {CIConfService} from "../../conf";
import {CIFrameService} from "../../frame.service";
import {MDL} from "../../mdl";

@Component({
  template: require("html/view/conf/application-list.html"),
  directives: [CICard, ROUTER_DIRECTIVES, MDL]
})

export class CIConfApplicationList extends CICardView {

  formId: string;

  registrants: any[] = [];
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

  searchStr: string = "";

  @ViewChild("searchInput") searchInput: ElementRef;

  constructor(_card: CICardService, private _conf: CIConfService, params: RouteParams, _frame: CIFrameService) {
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
      });

      this.sortBy("name");
    });

    return super.routerOnActivate();
  }

  ngAfterViewInit() {
    const searchChanged = Observable.fromEvent(this.searchInput.nativeElement, "keyup").debounceTime(200).distinctUntilChanged();
    searchChanged.subscribe(() => this.refilter());
    super.ngAfterViewInit();
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
    this.registrants.forEach(e => {
      // filter

      if(this.searchStr === "") e.visible = true;
      else if(e.profile.realname.indexOf(this.searchStr) !== -1) e.visible = true;
      else if(e.profile.schoolName.indexOf(this.searchStr) !== -1) e.visible = true;
      else {

        // Search in keywords
        e.visible = this.keywords.some(k => this.getKwRepr(k.field, e.submission[k.id]).indexOf(this.searchStr) !== -1);
      }
    });
  }

  getKwRepr(kw: any, value: any) {
    if(kw.type === "checkbox") {
      if(!value) return "";
      else return kw.choices.filter((e: any, i: any) => value[i]).join(", ");
    } else if(kw.type === "radio") {
      return kw.choices[value] === undefined ? "" : kw.choices[value];
    } else return value === undefined ? "" : value;
  }
}
