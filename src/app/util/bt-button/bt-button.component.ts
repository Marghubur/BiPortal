import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'bt-button',
  templateUrl: './bt-button.component.html',
  styleUrls: ['./bt-button.component.scss']
})
export class BtButtonComponent {
  private _className: string = "";

  @Output() onClick = new EventEmitter();

  @Input() text: string = ""
  @Input() buttonType: number = 0;
  @Input() redirect: string = "";
  @Input() icon: string = "";

  @Input() set className(value: string) {
    this._className = ` btn rounded-pill
                        ${
                            value.includes('bt-success') ? `btn-success ${value}` :
                            value.includes('bt-dark') ? `btn-primary-dark  ${value}` :
                            value.includes('bt-primary') ? 'btn-primary-c' : value} `;
  }

  get className(): string {
    return this._className;
  }

  handleClick(): void {
    this.onClick.emit();
  }
}
