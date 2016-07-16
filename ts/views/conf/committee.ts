import {Component} from "@angular/core";
import {Router, RouteParams, ROUTER_DIRECTIVES} from "@angular/router-deprecated";

import {CICardView, CICard, CICardService} from "../../card";
import {CIFrameService} from "../../frame.service";
import {CIConfService, CIConfCommitteeData, CIConfParticipantPreview, CIConfSeatSpec} from "../../conf";
import {CILoginService} from "../../login";
import {CINotifier} from "../../notifier";
import {MDL} from "../../mdl";
import {CIAvatar} from "../../avatar";

import * as CIUtil from "../../util";

interface CICommitteeGroup {
  id: string;
  members: CIConfParticipantPreview[];
  seat?: CIConfSeatSpec;
};

enum CICommitteeSeatStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  UNASSIGNED = 'unassigned',
}

@Component({
  template: require("html/view/conf/committee.html"),
  directives: [MDL, CICard, ROUTER_DIRECTIVES, CIAvatar]
})

export class CIConfCommittee extends CICardView {

  commId: string;
  data: CIConfCommitteeData = null;
  participants: CIConfParticipantPreview[] = [];
  groups: CICommitteeGroup[] = [];
  seats: CIConfSeatSpec[] = [];

  isAdmin: boolean = false;
  isDais: boolean = false;

  ready: boolean = false;
  editing: boolean = false;
  moving: boolean = false;
  extended: boolean = false;
  assigning: boolean = false;

  seatRef: CIConfSeatSpec = {
    id: "",
    title: "",
    count: 0,
  }; // Dummy object

  fromGroup: CICommitteeGroup = null;
  movingTarget: CIConfParticipantPreview = null;

  seatStatus: { [key: string]: CICommitteeSeatStatus } = { };

  constructor(
    _card: CICardService,
    _frame: CIFrameService,
    _params: RouteParams,
    private _router: Router,
    private _login: CILoginService,
    private _notifier: CINotifier,
    private _conf: CIConfService) {
      super(_card, true, false);
      _frame.setFab(null);
      this.commId = _params.get("comm");
    }

  ngAfterViewInit() {
    return Promise.all([
      new Promise((resolve, reject) => {
        this._conf.getCommittee(this.commId, (res) => {
          this.data = res;
          this.seats = this.data.seats;

          for(const s of this.seats) this.seatStatus[s.id] = CICommitteeSeatStatus.VALID;

          const uid = this._login.getUser()._id;
          this.isAdmin = res.admins.indexOf(uid) !== -1;
          this.isDais = res.daises.indexOf(uid) !== -1;

          resolve();
        });
      }),
      new Promise((resolve, reject) => {
        this._conf.getParticipants(this.commId, (res) => {
          console.log(res);
          this.participants = res;

          const mapper: { [key: string]: CICommitteeGroup } = {};

          for(let p of this.participants) {
            if(p.group in mapper)
              mapper[p.group].members.push(p);
            else
              mapper[p.group] = { id: p.group, members: [p] };
          }

          for(let i in mapper) {
            this.groups.push(mapper[i]);
          }

          resolve();
        });
      })
    ])
    .then(() => new Promise((resolve, reject) => {
      const mapper: { [key: string]: CIConfSeatSpec } = {};
      for(let s of this.seats) {
        if(s.group) mapper[s.group] = s;
      };

      for(let g of this.groups) {
        if(g.id in mapper) g.seat = mapper[g.id];
      };

      this.reevaluate();

      this.ready = true;
      setTimeout(resolve);
    }))
    .then(() => super.ngAfterViewInit());
  }

  selectBg($event: Event) {
    this.extended = false;
    this.moving = false;
    this.assigning = false;
  }

  selectGroup(target: CICommitteeGroup, $event: Event) {
    if(this.assigning) {
      for(const g of this.groups)
        if(g.seat === this.seatRef) {
          g.seat = null;
          break;
        }

      target.seat = this.seatRef;

      this.reevaluate();

      this.assigning = false;
      this.moving = false;
    } else if(this.moving) {
      if(this.fromGroup) {
        const index = this.fromGroup.members.indexOf(this.movingTarget);
        if(index > -1) this.fromGroup.members.splice(index, 1);

        if(this.fromGroup.members.length === 0) {
          const gindex = this.groups.indexOf(this.fromGroup);
          this.groups.splice(gindex, 1);
        }
      }

      target.members.push(this.movingTarget);

      this.reevaluate();

      this.moving = false;
      this.fromGroup = null;
      this.movingTarget = null;
    }
  }

  selectSeat(target: CIConfSeatSpec, $event: Event) {
    $event.stopPropagation();
    this.assigning = true;
    this.extended = false;
    this.seatRef = target;
  }

  addSeat($event: Event) {
    $event.stopPropagation();
    const len = this.seats.push({
      id: CIUtil.generateUUID(),
      title: "新席位",
      count: 1,
    });

    this.assigning = true;
    this.extended = false;
    this.seatRef = this.seats[len-1];

    this.seatStatus[this.seat] = CICommitteeSeatStatus.VALID;
  }

  performMove(part: CIConfParticipantPreview, group: CICommitteeGroup, $event: Event) {
    $event.stopPropagation();
    this.moving = true;
    this.extended = false;

    this.fromGroup = group;
    this.movingTarget = part;
  }

  performExtend($event: Event) {
    if(!this.moving && !this.assigning) this.extended = !this.extended;
    $event.stopPropagation();
  }

  reevaluate() {
    for(let s of this.seats) this.seatStatus[s.id] = CICommitteeSeatStatus.UNASSIGNED;

    for(let g of this.groups) {
      if(!g.seat) continue;

      if(g.members.length === g.seat.count) this.seatStatus[g.seat.id] = CICommitteeSeatStatus.VALID;
      else this.seatStatus[g.seat.id] = CICommitteeSeatStatus.INVALID;
    }

    console.log(this.seats);
    console.log(this.seatStatus);
  }
}
