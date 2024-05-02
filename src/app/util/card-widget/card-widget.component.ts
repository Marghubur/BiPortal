import { Component, Input } from '@angular/core';

@Component({
  selector: 'card-widget',
  templateUrl: './card-widget.component.html',
  styleUrls: ['./card-widget.component.scss'],
})
export class CardWidgetComponent {
  cardTitle: string = null;

  @Input()
  set title(value: string) {
    this.cardTitle = value;
    console.log(value)
  }
}
