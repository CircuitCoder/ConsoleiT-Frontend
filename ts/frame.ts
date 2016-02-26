import {Component} from 'angular2/core'
import {CICard} from './card'
import {MDL} from './mdl'
import {CIDataNotif} from './data'

@Component({
  selector: 'ci-frame',
  templateUrl: 'tmpl/frame.html',
  directives: [CICard, MDL]
})

export class CIFrame {
  notif: CIDataNotif[]

  constructor() {
    this.notif = new Array();
  }
}
