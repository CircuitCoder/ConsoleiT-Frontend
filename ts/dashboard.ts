import {Component} from 'angular2/core'

@Component({
  templateUrl: 'view/dashboard.html'
})

export class CIDashboard {
  constructor() {
    console.log("Dashboard");
  }
}
