import {Component} from '@angular/core'
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated'

import {CICardView, CICard, CICardService} from '../card'
import {CIFrameService} from '../frame.service'
import {CIConfService} from '../conf'
import {MDL} from '../mdl'

@Component({
  template: require('html/view/conf-list.html'),
  directives: [MDL, ROUTER_DIRECTIVES, CICard]
})

export class CIConfList extends CICardView {
  confs: any;

  constructor(
    _card: CICardService,
    _frame: CIFrameService,
    private _conf: CIConfService) {
      super(_card);
      _frame.setTitle("会议列表");
      _frame.setTabs([]);
      _frame.setFab(null);
    }

  routerOnActivate() {
    this._conf.getAvailList( res => {
      this.confs = res;
    });

    return super.routerOnActivate();
  }
}
