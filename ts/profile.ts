import {Injectable, Component} from 'angular2/core'
import {CICard, CICardView, CICardService} from './card'

@Component({
  templateUrl: 'view/profile.html',
  directives: [CICard],
  providers: [CICardService]
})

export class CIProfile extends CICardView {
  constructor(_cardService: CICardService) {
    super(_cardService);
  }
}
