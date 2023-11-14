import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // @HostListener('document:mousewheel')
  @HostListener('indow.scroll', [])
  onWindowScroll() {
    let element = document.querySelector('.sticky-top') as HTMLElement;
    if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10)
      element.classList.add('shadow');
    else
      element.classList.remove('shadow');
  }
}
