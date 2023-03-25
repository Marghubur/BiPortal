import { AfterViewChecked, Component, ComponentRef, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
declare var $: any;
import 'bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, AfterViewChecked, OnDestroy {
  showingSourceCode: boolean = false;
  isInEditMode: boolean = true;
  richTextField: any;
  imageURL: string = "";
  innerHtmlText: any = null;
  doc: any = null;
  rows: number = 0;
  columns: number = 0;
  IsSideIcon: boolean = true;
  containerHeight: number = 0;
  private eventSubscription: Subscription;

  @ViewChild('textFrame', {static: false}) iframe: ElementRef;

  constructor(private sanitizer: DomSanitizer,
    private vcRef: ViewContainerRef){ }

  @Input()
  set content(textContent: any) {
    if (textContent && textContent != "") {
      this.innerHtmlText = this.sanitizer.bypassSecurityTrustHtml(textContent);
    }
  }

  @Input()
  set height(value: number) {
    this.containerHeight = value;
  }

  @Input() cleanUp: Observable<void>;

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit() {
    if(this.cleanUp) {
      this.eventSubscription = this.cleanUp.subscribe(() => this.cleanUpIFrame())
    }
    this.richTextField = document.getElementById("richTextField");
    this.toggleEdit();
  }

  ngOnDestroy() {
    if(this.cleanUp) {
      this.eventSubscription.unsubscribe();
    }
  }

  cleanUpIFrame() {
    if(!this.richTextField) {
      this.richTextField = document.getElementById("richTextField");
    }

    this.richTextField.contentWindow.document.body.innerHTML = '';
  }

  execCmd (command) {
      this.richTextField.contentDocument.execCommand(command, false, null);
  }

  execCommandWithArg (command, arg) {
    let value = arg.target.value;
      this.richTextField.contentDocument.execCommand(command, false, value);
  }
  toggleSource () {
      if(this.showingSourceCode){
          this.richTextField.contentDocument.getElementsByTagName('body')[0].innerHTML =
          this.richTextField.contentDocument.getElementsByTagName('body')[0].textContent;
          this.showingSourceCode = false;
      }else{
          this.richTextField.contentDocument.getElementsByTagName('body')[0].textContent =
          this.richTextField.contentDocument.getElementsByTagName('body')[0].innerHTML;
          this.showingSourceCode = true;
      }
  }

  enableEditor(e: any) {
    if(!this.richTextField) {
      this.richTextField = document.getElementById("richTextField");
    }

    e.target.classList.remove('iframe-wrapper-container');
    this.toggleEdit();
  }

  toggleEdit() {
    if(!this.richTextField) {
      this.richTextField = document.getElementById("richTextField");
    }

    if(this.isInEditMode){
        this.richTextField.contentDocument.designMode = 'Off';
        this.isInEditMode = false;
    }else{
        this.richTextField.contentDocument.designMode = 'On';
        this.isInEditMode = true;
    }
  }

  toggleDarkLight() {
      var element = document.getElementById("richtextcontainer");
      element.classList.toggle("dark-mode");
  }

  uploadProfilePicture(event: any) {
    this.imageURL = "";
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.imageURL = event.target.result;
      };
      this.richTextField.contentDocument.execCommand('insertImage', false, this.imageURL);
    }
  }

  fireBrowserFile() {
    $("#uploarichimage").click();
  }

  tabelPopUp() {
    $('#tableModal').modal('show');
  }

  addTable() {
    var html = this.generateTable();
    this.richTextField.contentDocument.execCommand('insertHTML', false, html.toString());
    $('#tableModal').modal('hide');
  }

  generateTable() {
    let myRows = this.rows;
    let myColumns = this.columns;
    var html = '<table style="border-collapse: collapse; width: 100%;"><tbody>';
    for (let i = 0; i <myRows; i++) {
      html += "<tr>";
      for (let j = 0; j <myColumns; j++) {
        html += "<td style='padding: 15px; border: 1px solid #222; vertical-align: middle;'>&nbsp;</td>"
      }
      html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
  }
}



// export class EditorComponent implements OnInit {
//   innerHtmlText: any = null;
//   target: HTMLElement = null;
//   popover: HTMLElement = null;
//   imageUrl: string = "";
//   isSectionEdited: boolean = false;
//   targetElem: HTMLElement = null;

//   @Input()
//   set content(textContent: any) {
//     if (textContent && textContent != "") {
//       this.innerHtmlText = textContent;
//     }
//   }

//   constructor() { }

//   ngOnInit(): void {
//     this.target = (<HTMLElement> document.getElementById("content-container"));
//     this.popover = (<HTMLElement> document.getElementById('popoverTemplate'));
//   }

//   manipulateSection(e: any){
//     this.targetElem = e.target;
//     e.preventDefault();
//     e.target.focus();
//     this.popover.classList.remove('d-none');
//     this.popover.setAttribute('style', `left: ${e.pageX}px; top: ${e.pageY}px`);
//   }

//   addHorizontalLine() {
//     let tag = document.createElement("hr");
//     tag.className="w-100";
//     this.targetElem.insertAdjacentElement("afterend", tag);
//     this.closePopOver();
//   }

//   addindex() {
//     // if (!this.projectDetail.ProjectContent[0].SectionName.includes('Index')) {
//     //   this.titleValue = '';
//     //   this.titleValue = 'Index';
//     //   this.projectDetail.ProjectContent.unshift({
//     //     SectionName: this.titleValue,
//     //     SectionDescription: ''
//     //   })
//     //   let len = this.wikiForm.controls.Wikis.value.length;
//     //   this.sectionIndex = len;
//     //   let project = this.wikiForm.get('Wikis') as FormArray;
//     //   project.insert(0, this.createIndex());
//     //   this.titleValue = '';
//     //   this.isSectionEdited = true;
//     // }
//   }

//   enableSection(e: any) {
//     e.preventDefault();
//     e.stopPropagation();
//     // if (this.target.getAttribute('contenteditable') == 'false') {
//     //   this.target = null;
//     //   ErrorToast("Please select section first");
//     // }
//     this.popover.classList.add('d-none');
//   }

//   addParagraphBelow() {
//     if (this.target == null) {
//       ErrorToast("Please select a section first");
//       this.closePopOver();
//       return;
//     }
//     let tag = document.createElement("p");
//     tag.className="mb-0";
//     tag.appendChild(document.createTextNode('YOUR TEXT'));
//     this.target.appendChild(tag);
//     this.target.focus();
//     this.selectedText(tag);
//     this.closePopOver();
//   }

//   enableListItem() {
//     if (this.target == null) {
//       ErrorToast("Please select a section first");
//       this.closePopOver();
//       return;
//     }
//     let dv = document.createElement('div');
//     let ol = document.createElement('ol');
//     let anc = document.createElement('a');
//     anc.setAttribute('href', 'javascript:void(0)')
//     let text = document.createTextNode("[ YOUR TEXT HERE ]");
//     anc.appendChild(text);
//     ol.setAttribute('type', '1');
//     let li = document.createElement("li");
//     li.appendChild(anc);
//     ol.appendChild(li);
//     dv.appendChild(ol);
//     this.target.appendChild(dv);
//     this.closePopOver();
//     anc.focus();
//     this.selectedText(anc);
//   }

//   enableBulletItem(e: any) {
//     if (this.target == null) {
//       ErrorToast("Please select a section first");
//       this.closePopOver();
//       return;
//     }
//     e.stopPropagation();
//     let dv = document.createElement('div');
//     let ul = document.createElement('ul');
//     let li = document.createElement("li");
//     ul.appendChild(li);
//     dv.appendChild(ul);
//     this.target.appendChild(dv);
//     this.closePopOver();
//     this.target.focus();
//   }

//   selectedText(tag: any) {
//     let selection = window.getSelection();
//     let range = document.createRange();
//     range.selectNodeContents(tag);
//     selection.removeAllRanges();
//     selection.addRange(range);
//   }

//   closePopOver(){
//     this.popover.classList.add('d-none');
//   }

//   onPaste(e: any) {
//     e.preventDefault();
//     let items = (e.clipboardData || e.orignalEvent.clipboardData).items;
//     let blob = null;
//     for (let i = 0; i < items.length; i++) {
//       if (items[i].type.indexOf('image/png') === 0)
//         blob = items[i].getAsFile();
//     }
//     if (blob != null) {
//       var reader = new FileReader();
//       reader.readAsDataURL(blob);
//       reader.onload = (event: any) => {
//         this.imageUrl = event.target.result;
//       };
//       this.addImage();
//     }
//   }

//   addImage() {
//     let tag = document.createElement('div');
//     let img = document.createElement('img');
//     img.setAttribute('src', this.imageUrl);
//     img.setAttribute('style', 'width:44vw;')
//     tag.appendChild(img);
//     this.target.appendChild(tag);
//     $('#addLinkModal').modal('hide');
//   }

//   enableCurrentSection(e: any) {
//     e.preventDefault();
//     e.stopPropagation();
//     this.target = (<HTMLElement> e.target.closest('div[name="content-container"]'));
//     if (this.target) {
//       if (this.target.classList.contains('enable-section')) {
//         this.deactivateTag();
//         this.isSectionEdited = false;
//       } else {
//         this.target.setAttribute('contenteditable', 'true');
//         this.target.classList.add('enable-section', 'py-2');
//         this.target.focus();
//         this.isSectionEdited = true;
//       }
//     }
//   }

//   deactivateTag() {
//     this.target.setAttribute('contenteditable', 'false');
//     this.target.classList.remove('enable-section', 'py-2');
//     this.target = null;
//   }

//   trackElement(e: any) {
//     alert(e);
//   }
// }
