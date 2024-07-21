import { Component } from '@angular/core';
import { BtButtonComponent } from '../bt-button/bt-button.component';

@Component({
  selector: 'button-cancel',
  template: `<bt-button                   
                text="{{text}}"
                icon="{{icon}}"
                redirect="{{redirect}}"
                className="{{className}}"
                (onClick)="handleClick()">
              </bt-button>`,
  styleUrls: []
})
export class ButtonCancelComponent extends BtButtonComponent {

}
