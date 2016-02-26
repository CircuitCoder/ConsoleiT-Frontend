import {Component, ElementRef, Injectable} from 'angular2/core'
import {NgClass} from 'angular2/common'

@Injectable()
export class CICardService {
  private static animating = false;
  private static intervalId = 0;
  private static cards = new Array();
  private static shownCard = 0;
  private static clearing = false;
  
  registerCard(card: CICard) {
    if(CICardService.clearing) return;
    CICardService.cards.push(card);

    if(CICardService.animating) return;
    CICardService.animating = true;
    console.log(CICardService.cards);

    CICardService.intervalId = setInterval(function() {
      CICardService.cards[CICardService.shownCard].setVisible(true);
      ++CICardService.shownCard;
      if(CICardService.shownCard == CICardService.cards.length) {
        clearInterval(CICardService.intervalId);
        CICardService.animating = false;
      }
    }, 500);
    console.log(CICardService.intervalId);
  }

  clearCard() {
    return new Promise<void>(function(resolve) {
      if(CICardService.clearing) return;
      CICardService.clearing = true;
      
      if(CICardService.animating) {
        clearInterval(CICardService.intervalId);
      }
      CICardService.animating = true;

      CICardService.intervalId = setInterval(function() {
        CICardService.cards[CICardService.shownCard].setVisible(false);
        --CICardService.shownCard;
        if(CICardService.shownCard == 0) {
          clearInterval(CICardService.intervalId);
          CICardService.animating = false;
          CICardService.clearing = false;
        }
      }, 500);
    });
  }
}

@Component({
  selector: 'ci-card',
  templateUrl: '/tmpl/card.html',
  providers: [CICardService],
  directives: [NgClass]
})

export class CICard {
  _visible = false;
  constructor(private _el: ElementRef, private _cardService: CICardService) {
    _cardService.registerCard(this);
  }

  setVisible(visible: boolean) {
    console.log("VISIBLE", this._el.nativeElement);
    if(this._visible != visible) {
      this._visible = visible;
    }
  }
}
