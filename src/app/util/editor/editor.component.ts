import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
declare var $: any;
import 'bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  showingSourceCode: boolean = false;
  isInEditMode: boolean = true;
  richTextField: any;
  imageURL: string = "";
  innerHtmlText: any = null;
  doc: any = null;
  rows: number = 0;
  columns: number = 0;
  IsSideIcon: boolean = true;
  containerHeight: number = 55;
  private eventSubscription: Subscription;

  @ViewChild('textFrame', {static: false}) iframe: ElementRef;

  // constructor(private sanitizer: DomSanitizer,
  //   private vcRef: ViewContainerRef){ }

  @Input()
  set content(textContent: any) {
    if (textContent && textContent != "") {
      //this.innerHtmlText = this.sanitizer.bypassSecurityTrustHtml(textContent);
    }
  }

  @Input() isEdit: boolean = true;

  @Input()
  set height(value: number) {
    this.containerHeight = value;
  }

  @Input() cleanUp: Observable<void>;

//   ngAfterViewChecked(): void {
//     $('[data-bs-toggle="tooltip"]').tooltip({
//       trigger: 'hover'
//     });

//     $('[data-bs-toggle="tooltip"]').on('click', function () {
//       $(this).tooltip('dispose');
//     });
//   }

//   ngOnInit() {
//     if(this.cleanUp) {
//       this.eventSubscription = this.cleanUp.subscribe(() => this.cleanUpIFrame())
//     }
//     this.richTextField = document.getElementById("richTextField");
//     if (this.isEdit) {
//       document.getElementsByClassName('iframe-wrapper-container')[0].classList.remove('iframe-wrapper-container');
//     }
//     this.toggleEdit();
//   }

//   ngOnDestroy() {
//     if(this.cleanUp) {
//       this.eventSubscription.unsubscribe();
//     }
//   }

//   cleanUpIFrame() {
//     if(!this.richTextField) {
//       this.richTextField = document.getElementById("richTextField");
//     }

//     this.richTextField.contentWindow.document.body.innerHTML = '';
//   }

//   execCmd (command) {
//       this.richTextField.contentDocument.execCommand(command, false, null);
//   }

//   execCommandWithArg (command, arg) {
//     let value = arg.target.value;
//     let text = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.getSelection().toString();
//     if (text && text != "" ) {
//       if (Number(value) == 0 && command === "fontSize") {
//         let tags = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.querySelectorAll<HTMLElement>('font');
//         for (let i = 0; i < tags.length; i++) {
//           if (tags[i].innerText === text) {
//             let parentNode = tags[i].parentNode;
//             tags[i].parentNode.removeChild(tags[i]);
//             parentNode.appendChild(document.createTextNode(text));
//             (parentNode as HTMLElement).style.fontSize = "18px";

//           }
//         }
//       }else if (command === "formatBlock") {
//         let tags = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.querySelectorAll<HTMLElement>('div');
//         for (let i = 0; i < tags.length; i++) {
//           if (tags[i].innerText === text) {
//             tags[i].removeAttribute("fontsize")
//           }
//         }
//         this.richTextField.contentDocument.execCommand(command, false, value);
//       } else {
//         this.richTextField.contentDocument.execCommand(command, false, value);
//       }
//     }
//   }
//   toggleSource () {
//     if(this.showingSourceCode){
//       this.richTextField.contentDocument.getElementsByTagName('body')[0].innerHTML =
//       this.richTextField.contentDocument.getElementsByTagName('body')[0].textContent;
//       this.showingSourceCode = false;
//     }else{
//       this.richTextField.contentDocument.getElementsByTagName('body')[0].textContent =
//       this.richTextField.contentDocument.getElementsByTagName('body')[0].innerHTML;
//       this.showingSourceCode = true;
//     }
//   }

//   enableEditor(e: any) {
//     if (this.isEdit) {
//       if(!this.richTextField) {
//         this.richTextField = document.getElementById("richTextField");
//       }
//       e.target.classList.remove('iframe-wrapper-container');
//       this.toggleEdit();
//     }
//   }

//   toggleEdit() {
//     if(!this.richTextField) {
//       this.richTextField = document.getElementById("richTextField");
//     }

//     if(!this.isInEditMode){
//         this.richTextField.contentDocument.designMode = 'Off';
//         this.isInEditMode = false;
//       }else{
//         this.richTextField.contentDocument.designMode = 'On';
//         this.isInEditMode = true;
//       }
//     this.richTextField.contentWindow.document.body.focus();
//     var body = this.richTextField.contentWindow.document.querySelector('body');
//     body.style.fontSize = '18px';
// }

//   toggleDarkLight() {
//       var element = document.getElementById("richtextcontainer");
//       element.classList.toggle("dark-mode");
//   }

//   uploadProfilePicture(event: any) {
//     this.imageURL = "";
//     if (event.target.files) {
//       var reader = new FileReader();
//       reader.readAsDataURL(event.target.files[0]);
//       reader.onload = (event: any) => {
//         this.imageURL = event.target.result;
//       };
//       this.richTextField.contentDocument.execCommand('insertImage', false, this.imageURL);
//     }
//   }

//   fireBrowserFile() {
//     $("#uploarichimage").click();
//   }

//   tabelPopUp() {
//     $('#tableModal').modal('show');
//   }

//   addTable() {
//     var html = this.generateTable();
//     this.richTextField.contentDocument.execCommand('insertHTML', false, html.toString());
//     $('#tableModal').modal('hide');
//   }

//   generateTable() {
//     let myRows = this.rows;
//     let myColumns = this.columns;
//     var html = '<table style="border-collapse: collapse; width: 100%;"><tbody>';
//     for (let i = 0; i <myRows; i++) {
//       html += "<tr>";
//       for (let j = 0; j <myColumns; j++) {
//         html += "<td style='padding: 15px; border: 1px solid #222; vertical-align: middle;'>&nbsp;</td>"
//       }
//       html += "</tr>";
//     }
//     html += "</tbody></table>";
//     return html;
//   }

  createTable() {
    var table = document.createElement('table');
    table.classList.add("table", "table-bordered")
    for (var i = 0; i < this.rows; i++) {
      var row = table.insertRow(i);
      for (var j = 0; j < this.columns; j++) {
        var cell = row.insertCell(j);
        cell.classList.add("td");
        cell.textContent = 'Cell ' + (i + 1) + '-' + (j + 1);
      }
    }
    document.execCommand('insertHTML', false, table.outerHTML);
  }

  execCmd (command) {
    document.execCommand(command, false, null);
  }

  uploadImg(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      let profileURL = null;
      reader.onload = (event: any) => {
        profileURL = event.target.result;
      };

    }
  }

  tabelPopUp() {
    $('#tableModal').modal('show');
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();

    var clipboardData = event.clipboardData;
    var items = clipboardData.items;
    if (clipboardData) {
      if (clipboardData.items && clipboardData.items.length > 0) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            var blob = items[i].getAsFile();
            var reader = new FileReader();
            const imageUrl = URL.createObjectURL(items[i].getAsFile());
            var img = document.createElement('img');
            reader.onload = function(e) {
              img.src = e.target.result as string;
              img.setAttribute('style', 'width: 100% ; height: 100%; object-fit: fill !important;');
            };
            var selection = window.getSelection();
            var range = selection.getRangeAt(0);
            var div = document.createElement('div');
            div.setAttribute("id", "element");
            div.setAttribute("contenteditable", 'false');
            div.appendChild(img);
            div.setAttribute('style', 'position: relative; background-color: #f1f1f1; border: 1px solid #d3d3d3; margin-bottom: 2rem; left: 40px; top:  40px; width: 300px; height: 300px; border-radius: 5px;');
            div.addEventListener('click', () => this.handleImageClick("element"));
            //this.makeResizable(div)

            range.deleteContents();
            range.insertNode(div);

            reader.readAsDataURL(blob);
          }
        }
      }
    }
  }

  handleImageClick(e: any) {
    console.log()
    let elem = document.getElementById(e);
    this.makeResizable(elem);
  }

  execCommandWithArg (command, arg) {
    let value = arg.target.value;
    let text = (document.getElementById("editor") as HTMLIFrameElement).contentWindow.getSelection().toString();
    if (text && text != "" ) {
      if (Number(value) == 0 && command === "fontSize") {
        let tags = (document.getElementById("editor") as HTMLIFrameElement).contentWindow.document.body.querySelectorAll<HTMLElement>('font');
        for (let i = 0; i < tags.length; i++) {
          if (tags[i].innerText === text) {
            let parentNode = tags[i].parentNode;
            tags[i].parentNode.removeChild(tags[i]);
            parentNode.appendChild(document.createTextNode(text));
            (parentNode as HTMLElement).style.fontSize = "18px";

          }
        }
      }else if (command === "formatBlock") {
        let tags = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.querySelectorAll<HTMLElement>('div');
        for (let i = 0; i < tags.length; i++) {
          if (tags[i].innerText === text) {
            tags[i].removeAttribute("fontsize")
          }
        }
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false, value);
      }
    }
  }


  private makeResizable(element: HTMLElement, minW = 100, minH = 100, size = 20) {
    // const top = document.createElement('div');
    // top.style.width = '100%';
    // top.style.height = size + 'px';
    // top.style.backgroundColor = 'transparent';
    // top.style.position = 'absolute';
    // top.style.top = - (size / 2) + 'px';
    // top.style.left = '0px';
    // top.style.cursor = 'n-resize';

    // top.addEventListener('mousedown', resizeYNegative());

    // element.appendChild(top);

    const bottom = document.createElement('div');
    bottom.style.width = '100%';
    bottom.style.height = size + 'px';
    bottom.style.backgroundColor = 'transparent';
    bottom.style.position = 'absolute';
    bottom.style.bottom = - (size / 2) + 'px';
    bottom.style.left = '0px';
    bottom.style.cursor = 'n-resize';

    bottom.addEventListener('mousedown', resizeYPositive());

    element.appendChild(bottom);

    // const left = document.createElement('div');
    // left.style.width = size + 'px';
    // left.style.height = '100%';
    // left.style.backgroundColor = 'transparent';
    // left.style.position = 'absolute';
    // left.style.top = '0px';
    // left.style.left = - (size / 2) + 'px';
    // left.style.cursor = 'e-resize';

    // left.addEventListener('mousedown', resizeXNegative());

    // element.appendChild(left);

    const right = document.createElement('div');
    right.style.width = size + 'px';
    right.style.height = '100%';
    right.style.backgroundColor = 'transparent';
    right.style.position = 'absolute';
    right.style.top = '0px';
    right.style.right = - (size / 2) + 'px';
    right.style.cursor = 'e-resize';

    right.addEventListener('mousedown', resizeXPositive());

    element.appendChild(right);

    // const corner1 = document.createElement('div');
    // corner1.style.width = size + 'px';
    // corner1.style.border = "1px solid #d9d9d9";
    // corner1.style.background = "blanchedalmond !important";
    // corner1.style.height = size + 'px';
    // corner1.style.backgroundColor = 'transparent';
    // corner1.style.position = 'absolute';
    // corner1.style.top = - (size / 2) + 'px';
    // corner1.style.left = - (size / 2) + 'px';
    // corner1.style.cursor = 'nw-resize';
    // corner1.setAttribute("data-name", 'corner1');
    // corner1.addEventListener('mousedown', resizeXNegative());
    // corner1.addEventListener('mousedown', resizeYNegative());

    // element.appendChild(corner1);

    // const corner2 = document.createElement('div');
    // corner2.style.width = size + 'px';
    // corner2.style.border = "1px solid #d9d9d9";
    // corner2.style.background = "blanchedalmond !important";
    // corner2.style.height = size + 'px';
    // corner2.style.backgroundColor = 'transparent';
    // corner2.style.position = 'absolute';
    // corner2.style.top = - (size / 2) + 'px';
    // corner2.style.right = - (size / 2) + 'px';
    // corner2.style.cursor = 'ne-resize';
    // corner2.setAttribute("data-name", 'corner2');

    // corner2.addEventListener('mousedown', resizeXPositive());
    // corner2.addEventListener('mousedown', resizeYNegative());

    // element.appendChild(corner2);

    // const corner3 = document.createElement('div');
    // corner3.style.width = size + 'px';
    // corner3.style.border = "1px solid #d9d9d9";
    // corner3.style.background = "blanchedalmond !important";
    // corner3.style.height = size + 'px';
    // corner3.style.backgroundColor = 'transparent';
    // corner3.style.position = 'absolute';
    // corner3.style.bottom = - (size / 2) + 'px';
    // corner3.style.left = - (size / 2) + 'px';
    // corner3.style.cursor = 'sw-resize';
    // corner3.setAttribute("data-name", 'corner3');
    // corner3.addEventListener('mousedown', resizeXNegative());
    // corner3.addEventListener('mousedown', resizeYPositive());

    // element.appendChild(corner3);

    const corner4 = document.createElement('div');
    corner4.style.border = "1px solid #d9d9d9";
    corner4.style.background = "blanchedalmond !important";
    corner4.style.width = size + 'px';
    corner4.style.height = size + 'px';
    corner4.style.backgroundColor = 'transparent';
    corner4.style.position = 'absolute';
    corner4.style.bottom = - (size / 2) + 'px';
    corner4.style.right = - (size / 2) + 'px';
    corner4.style.cursor = 'se-resize';
    corner4.setAttribute("data-name", 'corner4');
    corner4.addEventListener('mousedown', resizeXPositive());
    corner4.addEventListener('mousedown', resizeYPositive());

    element.appendChild(corner4);

    function getComputedStyleProperty(key: string): number {
        return parseInt(window.getComputedStyle(element).getPropertyValue(key));
    }

    function resizeXPositive() {
        let offsetX: number;

        function dragMouseDown(e: MouseEvent) {
          if (e.button !== 0) return;
          e.preventDefault();
          const { clientX } = e;
          offsetX = clientX - element.offsetLeft - getComputedStyleProperty('width');
          document.addEventListener('mouseup', closeDragElement);
          document.addEventListener('mousemove', elementDrag);
        }

        function elementDrag(e: MouseEvent) {
            const { clientX } = e;
            let x = clientX - element.offsetLeft - offsetX;
            if (x < minW) x = minW;
            element.style.width = x + 'px';
        }

        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
        }

        return dragMouseDown;
    }

    function resizeYPositive() {
        let offsetY: number;

        function dragMouseDown(e: MouseEvent) {
            if (e.button !== 0) return;
            e.preventDefault();
            const { clientY } = e;
            offsetY = clientY - element.offsetTop - getComputedStyleProperty('height');
            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
        }

        function elementDrag(e: MouseEvent) {
            const { clientY } = e;
            let y = clientY - element.offsetTop - offsetY;
            if (y < minH) y = minH;
            element.style.height = y + 'px';
        }

        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
        }

        return dragMouseDown;
    }

    function resizeXNegative() {
        let offsetX: number;
        let startX: number;
        let startW: number;
        let maxX: number;

        function dragMouseDown(e: MouseEvent) {
            if (e.button !== 0) return;
            e.preventDefault();
            const { clientX } = e;
            startX = getComputedStyleProperty('left');
            startW = getComputedStyleProperty('width');
            offsetX = clientX - startX;
            maxX = startX + startW - minW;

            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
        }

        function elementDrag(e: MouseEvent) {
            const { clientX } = e;
            let x = clientX - offsetX;
            let w = startW + startX - x;
            if (w < minW) w = minW;
            if (x > maxX) x = maxX;
            element.style.left = x + 'px';
            element.style.width = w + 'px';
        }

        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
        }

        return dragMouseDown;
    }

    function resizeYNegative() {
        let offsetY: number;
        let startY: number;
        let startH: number;
        let maxY: number;

        function dragMouseDown(e: MouseEvent) {
            if (e.button !== 0) return;
            e.preventDefault();
            const { clientY } = e;
            startY = getComputedStyleProperty('top');
            startH = getComputedStyleProperty('height');
            offsetY = clientY - startY;
            maxY = startY + startH - minH;

            document.addEventListener('mouseup', closeDragElement);
            document.addEventListener('mousemove', elementDrag);
        }

        function elementDrag(e: MouseEvent) {
            const { clientY } = e;
            let y = clientY - offsetY;
            let h = startH + startY - y;
            if (h < minH) h = minH;
            if (y > maxY) y = maxY;
            element.style.top = y + 'px';
            element.style.height = h + 'px';
        }

        function closeDragElement() {
            document.removeEventListener('mouseup', closeDragElement);
            document.removeEventListener('mousemove', elementDrag);
        }

        return dragMouseDown;
    }
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
