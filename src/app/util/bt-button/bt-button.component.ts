import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'bt-button',
  templateUrl: './bt-button.component.html',
  styleUrls: ['./bt-button.component.scss']
})
export class BtButtonComponent {
  bt_lable: string;
  bt_link: string;
  bt_icon: string;
  icon_required: boolean = false;
  bt_class: string = " btn ";


  @Output() onClick = new EventEmitter();

  @Input()
  set lable(value: string) {
    this.bt_lable = value;
  }

  @Input()
  set redirect(value: string) {
    this.bt_link = value;
  }

  @Input()
  set icon(value: string) {
    if(value != "") {
      this.icon_required = true;
      this.bt_icon = value;
    }
  }

  @Input()
  set class(value: string) {
    this.bt_class += value;
  }

  @Input()
  set rounded(value: boolean) {
    this.bt_class += " rounded-pill ";
  }

  handleClick(event: Event): void {
    this.onClick.emit(event);
  }
}
