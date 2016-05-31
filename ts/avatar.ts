import {Input, Component} from "@angular/core";

import {generateGravatar} from "./util";

@Component({
  selector: "ci-avatar",
  template: require("html/tmpl/avatar.html")
})
export class CIAvatar {
  @Input() name: string;
  @Input() email: string;

  showImg: boolean = false;
  loaded: boolean = false;

  ngAfterViewInit() {
    this.loaded = true;
  }

  loadSuccess() {
    this.showImg = true;
  }

  getInitials() {
    return this.name.split(" ").reduce((prev, e) => {
      return prev + e.charAt(0);
    }, "");
  }

  getGravatar() {
    return generateGravatar(this.email);
  }
}
