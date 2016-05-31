import {Component} from '@angular/core'
import {CanDeactivate, Router, RouteParams, ROUTER_DIRECTIVES} from '@angular/router-deprecated'

import {CICardView, CICard, CICardService} from '../../card'
import {CIFrameService} from '../../frame.service'
import {CIConfService} from '../../conf'
import {CILoginService} from '../../login'
import {MDL} from '../../mdl'
import {CIAvatar} from '../../avatar'

import {FORM_STATUS_MAP} from './const'

import * as CIUtil from '../../util'

@Component({
  template: require('html/view/conf/index.html'),
  directives: [CICard, MDL, ROUTER_DIRECTIVES, CIAvatar]
})

export class CIConfHome extends CICardView {

  confData: any;
  confDescs: any;
  confDescTitles: any;
  confGroup: any;
  confMembers: any;
  confRoles: any;
  
  userId: number;

  constructor(_card: CICardService, private _conf: CIConfService, private _login: CILoginService) {
    super(_card);
    this.userId = _login.getUser()._id;
  }

  routerOnActivate() {
    this.confData = this._conf.getConf();
    this.confMembers = this._conf.getMemberMap();
    this.confGroup = this._conf.getGroup();
    this.confRoles = this._conf.getRoleMap();

    this.confData.members.sort((a: any, b: any) => a.role < b.role ? -1 : 1 );

    CIUtil.cardMarked(this.confData.desc, (titles, bodies) => {
      this.confDescs = bodies;
      this.confDescTitles = titles;
    });

    return super.routerOnActivate();
  }
}

