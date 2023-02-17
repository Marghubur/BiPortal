import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[DecimalNumber]'
})
export class DecimalnumberDirective {
  input: number = 0;
  private regex: RegExp;
  constructor(private el: ElementRef) { }
  prec: number = 2;

  @Input()
  set DecimalNumber(value: string) {
    if (value !== null && value !== "") {
      this.input = parseInt(value);
    } else {
      this.input = 0;
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace' || event.key === 'Tab' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      return;
    }
    this.regex = new RegExp(`^[0-9]{0,${this.input}}(\\.[0-9]{0,2})?$`);
    const currentValue: string = this.el.nativeElement.value;
    const nextValue: string = currentValue.concat(event.key);
    if (nextValue && !String(nextValue).match(this.regex)) {
      event.preventDefault();
    }
  }

  // @HostListener('keydown', ['$event']) onKeyDown(e) {
  //   if (this.input) {
  //     var keyCode = (e.which) ? e.which : keyCode;
  //     if ([46, 8, 9, 27, 13, 190].indexOf(e.keyCode) !== -1 ||
  //       // Allow: Ctrl+A
  //       (e.keyCode == 65 && e.ctrlKey === true) ||
  //       // Allow: Ctrl+C
  //       (e.keyCode == 67 && e.ctrlKey === true) ||
  //       // Allow: Ctrl+V
  //       (e.keyCode == 86 && e.ctrlKey === true) ||
  //       // Allow: Ctrl+X
  //       (e.keyCode == 88 && e.ctrlKey === true) ||
  //       // Allow: home, end, left, right
  //       (e.keyCode >= 35 && e.keyCode <= 39)) {
  //         // let it happen, don't do anything
  //         return;
  //       }
  //     // Ensure that it is a number and stop the keypress
  //     if (!this.isValid(e.key))
  //        e.preventDefault();
  //   }
  // }

  // @HostListener('paste', ['$event']) onPaste(e) {
  //   // get and validate data from clipboard
  //   let pastedText = e.clipboardData.getData('text/plain');
  //   if (pastedText) {
  //     if (!this.isValid(pastedText)) {
  //       event.preventDefault();
  //     }
  //   }
  // }

  // private isValid(elegible: string): boolean {
  //   var current: string = this.el.nativeElement.value;
  //   if (current.indexOf('.') != -1) {
  //     let value = current.split('.')[1];
  //     if (value.length >= this.prec)
  //       return;

  //     if (elegible == '.')
  //       return;
  //   }
  //   const next: string = current.concat(elegible);
  //   return  !this.isOverSize(next);
  // }

  // private isOverSize(str: string): boolean {
  //   if (this.input && str) {
  //     return str.length > this.input;
  //   }
  //   return false;
  // }
}
