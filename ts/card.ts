import {Directive, ViewChild, Component, ElementRef, Injectable, Input} from 'angular2/core'
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
    }, 100);
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
      }, 100);
    });
  }
}

@Directive({
  selector: '.ci-card-content',
})
class CICardContent {
  constructor(private _el: ElementRef) {
  }

  setVisible(visible: boolean) {
    if(visible) {
      for(var i = 0; i< this._el.nativeElement.children.length; ++i) {
        ((_i: number) => {
          setTimeout(() => {
            this._el.nativeElement.children[_i].classList.add('visible');
          }, 200+_i*100);
        })(i);
      }
    }
  }
}

@Component({
  selector: 'ci-card',
  templateUrl: '/tmpl/card.html',
  providers: [CICardService],
  directives: [NgClass, CICardContent]
})

export class CICard {
  visible = false;
  @ViewChild(CICardContent) contentWrapper:CICardContent;

  constructor(private _el: ElementRef,
              private _cardService: CICardService) {
  }

  ngAfterViewInit() {
    this._cardService.registerCard(this);
  }

  setVisible(visible: boolean) {
    console.log("VISIBLE", this._el.nativeElement);
    if(this.visible != visible) {
      this.visible = visible;
      this.contentWrapper.setVisible(true);
    }
  }
}

