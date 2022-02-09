import { Injectable } from "@angular/core";
import { ApplicationStorage } from "src/providers/ApplicationStorage";

@Injectable()
export class PageCache {
  pageStack: Array<string> = [];
  constructor(private storage: ApplicationStorage) {
    this.pageStack = new Array<string>();
  }

  public push(routeValue: string) {
    if(routeValue != "") {
      this.pageStack.push(routeValue);
    }
    console.log('After push: ' + JSON.stringify(this.pageStack));
  }

  public pop(): Array<string> {
    if(this.pageStack.length > 0) {
      this.pageStack.pop();
    }
    console.log('After pop: ' + JSON.stringify(this.pageStack));
    return this.pageStack;
  }
}
