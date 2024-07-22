import { Component, Input } from '@angular/core';
import { BtButtonComponent } from '../bt-button/bt-button.component';

@Component({
  selector: 'button-submit',
  template: `<bt-button                   
                text="{{text}}"
                icon="{{icon}}"
                redirect="{{redirect}}"
                className="{{className}}"
                (onClick)="handleClick()">
              </bt-button>`,
  styleUrls: []
})
export class ButtonSubmitComponent extends BtButtonComponent {
}
