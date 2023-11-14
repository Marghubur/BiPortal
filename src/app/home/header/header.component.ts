import { Component, HostListener } from '@angular/core';
import { Login } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  browserName: string = '';

  constructor(private nav: iNavigation) { }

  @HostListener('body:scroll', [])
  // @HostListener('document:mousewheel')
  onScroll() {
    let element = document.querySelector('.sticky-top') as HTMLElement;
    if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10)
      element.classList.add('shadow');
    else
      element.classList.remove('shadow');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const targetElement = event.target as HTMLElement;

    // Check if the click is outside the menu
    const menu = document.getElementById("myMenu");
    if (event.target !== menu && !menu?.contains(targetElement) && targetElement.tagName.toLowerCase() !== "a") {
      menu.style.display = "none";
    }
    const item = document.getElementById("supportMenu");
    if (event.target !== item && !item?.contains(targetElement) && targetElement.tagName.toLowerCase() !== "a") {
      item.style.display = "none";
    }
  }

  ngOnInit() {
      this.browserName = this.detectBrowserName();
  }

  doLogin() {
    this.nav.navigate(Login, null);
  }

  toggleMenu(e: any) {
    var menu = e.currentTarget.nextElementSibling
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
    if (menu.getAttribute("id") == "myMenu") {
      let item = document.getElementById("supportMenu");
      if (item.style.display === "block")
        item.style.display = "none";
    } else if (menu.getAttribute("id") == "supportMenu") {
      let item = document.getElementById("myMenu");
      if (item.style.display === "block")
        item.style.display = "none";
    }
  }

  closeToggeMenu() {
    let item = document.getElementById("supportMenu");
    if (item.style.display === "block")
      item.style.display = "none";

    item = document.getElementById("myMenu");
    if (item.style.display === "block")
      item.style.display = "none";
  }

  detectBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase()
    switch (true) {
      case (agent.indexOf('edg') > -1 || agent.indexOf('edge') > -1):
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }

}
