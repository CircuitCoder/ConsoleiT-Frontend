import {Directive, ViewChild, Component, ElementRef, Injectable, Input} from 'angular2/core'
import {NgClass} from 'angular2/common'
import {OnActivate, OnDeactivate} from 'angular2/router'

@Injectable()
export class CICardService {
  private static animationSpeed = 3;
  private static cards = new Array<CICard>();
  private static shownCard = 0;

  private static visible = false;
  
  public register(card: CICard) {
    CICardService.cards.push(card);
    if(CICardService.visible) {
      setTimeout(() => card.setVisible(true), 50); // TODO: ensure the animation performs
    }
  }

  public setVisibleAll(visible: boolean) {
    CICardService.visible = visible;

    let startPoint = CICardService.cards.reduce((prev: number, c: CICard) => {
      let p = c.getPosition();
      return Math.min(prev, p.top*2 + p.left);
    }, Infinity);

    return Promise.all(CICardService.cards.map((c:CICard) => {
      let p = c.getPosition();
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          c.setVisible(visible).then(() => {
            return resolve();
          });
        }, CICardService.cards.length > 10 ? 0 : (p.top*2+p.left-startPoint)/CICardService.animationSpeed);
      })
    }));
  }

  public clearCard() {
    CICardService.cards = new Array<CICard>();
  }
}

@Directive({
  selector: '.ci-card-content',
})
class CICardContent {
  constructor(private _el: ElementRef) {
  }

  getItemCount() {
    return this._el.nativeElement.children.length;
  }

  toggle() {
    return new Promise((resolve) => {
      for(var i = 0; i< this._el.nativeElement.children.length; ++i) {
        ((_i: number) => {
          setTimeout(() => {
            this._el.nativeElement.children[_i].classList.toggle('visible');
          }, _i*100);
        })(i);
      }

      setTimeout(resolve, this._el.nativeElement.children.length*100 + 100); // Wait for animation
    });
  }
}

@Component({
  selector: 'ci-card',
  templateUrl: '/tmpl/card.html',
  directives: [NgClass, CICardContent]
})

export class CICard {
  public visible = false;
  @ViewChild(CICardContent) private contentWrapper:CICardContent;

  constructor(private _el: ElementRef,
              private _card: CICardService) { }

  ngAfterViewInit() {
    this._card.register(this);
  }

  setVisible(visible: boolean): Promise<any> {
    if(visible == this.visible) return Promise.resolve();

    else if(visible) {
      this.visible = visible;
      return Promise.all([
        new Promise((resolve) => {
          setTimeout(resolve, 400);
        }),
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(this.contentWrapper.toggle());
          }, 200);
        })
      ]);

    } else {
      this.visible = visible;
      return Promise.all([
        new Promise((resolve) => {
          setTimeout(resolve, this.contentWrapper.getItemCount() * 100 - 200);
        }),
        this.contentWrapper.toggle()
      ]);
    }
  }

  getPosition() {
    var rect = this._el.nativeElement.getBoundingClientRect();
    return rect;
  }

  toggleContent() {
    return this.contentWrapper.toggle();
  }
}

export class CICardView implements OnDeactivate, OnActivate {
  constructor(protected _card: CICardService) { }

  ngAfterViewInit() {
    this._card.setVisibleAll(true);
  }

  routerOnActivate() {
    this._card.clearCard();
  }

  routerOnDeactivate() {
    return this._card.setVisibleAll(false);
  }
}
