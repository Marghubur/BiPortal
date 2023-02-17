import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[OnlyNumber]'
})
export class AllownumberDirective {
  input: number = 0;
  constructor(private el: ElementRef) { }
  private regex: RegExp;

  @Input()
  set OnlyNumber(value: string) {
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
    this.regex = new RegExp(`^[0-9]{0,${this.input}}$`);
    const currentValue: string = this.el.nativeElement.value;
    const nextValue: string = currentValue.concat(event.key);
    if (nextValue && !String(nextValue).match(this.regex)) {
      event.preventDefault();
    }
  }

  // @HostListener('keydown', ['$event']) onKeyDown(e) {
  //   if (this.input) {
  //     var keyCode = (e.which) ? e.which : keyCode;
  //     if ([46, 9, 8, 37, 38, 39, 40].indexOf(keyCode) !== -1 || e.key == ".") {
  //       return;
  //     }

  //     if (e.target.value.length >= this.input) {
  //       e.preventDefault();
  //     }

  //     if (// Allow: Ctrl+A
  //       (keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
  //       // Allow: Ctrl+C
  //       (keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
  //       // Allow: Ctrl+V
  //       (keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
  //       // Allow: Ctrl+X
  //       (keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
  //       // Allow: home, end, left, right
  //       (keyCode >= 35 && keyCode <= 39)) {
  //       // let it happen, don't do anything
  //       return;
  //     }
  //     // Ensure that it is a number and stop the keypress
  //     if ((e.shiftKey || (keyCode < 48 || keyCode > 57)) && (keyCode < 96 || keyCode > 105)) {
  //       e.preventDefault();
  //     }
  //   }
  // }
}
