import { Component, HostListener } from '@angular/core';
import { Login } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(private nav: iNavigation) { }

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

}
