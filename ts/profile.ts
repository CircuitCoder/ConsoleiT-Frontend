import {Injectable, Component} from 'angular2/core'
import {CICard, CICardView, CICardService} from './card'
import {MDL} from './mdl'

@Component({
  templateUrl: 'view/profile.html',
  directives: [CICard, MDL],
  providers: [CICardService]
})

export class CIProfile extends CICardView {
  constructor(_cardService: CICardService) {
    super(_cardService);
  }
}
