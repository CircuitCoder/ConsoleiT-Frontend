import {Injectable} from 'angular2/core'
import {CIFrame} from './frame'

export interface CIFrameTabDefination {
  route: any[],
  title: string
}

@Injectable()
export class CIFrameService {
  private frame: CIFrame;

  constructor() { }

  setFrame(frame: CIFrame) {
    this.frame = frame;
  }

  setState(title: string, tabs: CIFrameTabDefination[]) {
    this.frame.setState(title, tabs);
  }
}
