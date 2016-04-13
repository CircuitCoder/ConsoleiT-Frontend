import {Injectable} from 'angular2/core'
import {CIFrame} from './frame'

export interface CIFrameTabDefination {
  route: any[],
  title: string,
  router?: any
}

@Injectable()
export class CIFrameService {
  private frame: CIFrame;

  constructor() { }

  setFrame(frame: CIFrame) {
    this.frame = frame;
  }

  setTitle(title: string) {
    this.frame.setTitle(title);
  }

  setTabs(tabs: CIFrameTabDefination[]) {
    this.frame.setTabs(tabs);
  }
}
