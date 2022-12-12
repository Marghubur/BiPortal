import { AfterViewChecked, Component, ComponentRef, ElementRef, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ErrorToast } from 'src/providers/common-service/common.service';
declare var $: any;
import 'bootstrap';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, AfterViewChecked {
  showingSourceCode: boolean = false;
  isInEditMode: boolean = false;
  richTextField: any;
  imageURL: string = "";
  innerHtmlText: any = null;
  doc: any = null;

  @ViewChild('textFrame', {static: false}) iframe: ElementRef;

  constructor(private sanitizer: DomSanitizer,
    private vcRef: ViewContainerRef){ }

  @Input()
  set content(textContent: any) {
    if (textContent && textContent != "") {
      this.innerHtmlText = this.sanitizer.bypassSecurityTrustHtml(textContent);
    }
  }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });
  }

  ngOnInit() {
    this.richTextField = document.getElementById("richTextField");
    this.enableEditMode();
    // iframe.body.innerHTML = this.innerHtmlText;
  }


  enableEditMode (){
    let iframe = this.richTextField.contentDocument || this.richTextField.contentWindow.document;
    iframe.designMode  = 'On';
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

  toggleEdit() {
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

      // this.employeeForm.patchValue({
      //   ProfileImgPath: event.target.result,
      // });
    }
  }

  fireBrowserFile() {
    $("#uploarichimage").click();
  }

  // createComponent(){
  //   const comRef = this.vcRef.createComponent(this.innerHtmlText);
  //   comRef.location.nativeElement.id = "content-data";
  //   // (<EditorComponent>this.comRef.instance).firstInput = this.firstInput;
  //   // (<EditorComponent>this.comRef.instance).emitOutput.subscribe(response => {
  //   //console.log(response);
  //   //});
  //   this.doc.body.appendChild(comRef.location.nativeElement);
  // }

  // bindLoadedContent(iframe) {
  //   this.doc = iframe.contentDocument || iframe.contentWindow;
  //   this.createComponent();
  // }
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
