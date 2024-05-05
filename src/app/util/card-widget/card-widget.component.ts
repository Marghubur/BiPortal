import { Component, Input } from '@angular/core';

@Component({
  selector: 'card-widget',
  templateUrl: './card-widget.component.html',
  styleUrls: ['./card-widget.component.scss'],
})
export class CardWidgetComponent {
  cardTitle: string = null;
  loading: boolean = false;

  @Input()
  set title(value: string) {
    this.cardTitle = value;
  }

  @Input()
  set isLoading(value: boolean) {
    this.loading = value;
  }

  get isLoading(): boolean {
    return this.loading;
  }
}
