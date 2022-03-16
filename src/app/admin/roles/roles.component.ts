import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
declare var $:any;

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  rolesForm: FormGroup;
  profileURL: string = "assets/images/faces/face1.jpg";
  isRolesLoaded: boolean = false;
  Menu: Array<any> = [];
  roleMenuForm: FormGroup;
  menuItems: FormArray;
  RoleName: number = 0;

  constructor(private fb: FormBuilder,
              private http: AjaxService) { }

  ngOnInit(): void {
  }

  getPermessionName(permissionValue: number) {
    switch(permissionValue) {
      case 1:
        return "Grant full access.";
      case 2:
        return "Read only permission.";
      case 3:
        return "Read & Write permission.";
      default:
        return "Pick one access type.";
    }
  }

  buildForm(menu: Array<any>) {
    let itemArray: FormArray = this.fb.array([]);
    let i = 0;
    while(i < menu.length) {
      if(menu[i].Childs != null) {
        itemArray.push(this.fb.group({
          Icon: new FormControl(menu[i].Icon),
          Catagory: new FormControl(menu[i].Catagory),
          Permission: new FormControl(0),
          ParentMenu: new FormControl(menu[i].Childs)
        }));
      }
      i++;
    }
    return itemArray;
  }

  initForm(menu: Array<any>) {
    this.rolesForm = this.fb.group({
      menuItems: this.buildForm(menu)
    });
  }

  loadMenu(e: any) {
    let accessLevelId = 1;
    if (accessLevelId > 0) {
      this.http.get(`OnlineDocument/GetMenu/${accessLevelId}`).then((response:ResponseModel) => {
        if (response.ResponseBody != null) {
          let menu = response.ResponseBody['Table'];
          let parentItems = menu.filter(x => x.Childs == null);
          if (parentItems.length > 0) {
            let i = 0;
            while(i < parentItems.length) {
              this.Menu.push({
                Name: parentItems[i].Catagory,
                ParentDetail: parentItems[i],
                value: menu.filter (x => x.Childs == parentItems[i].Catagory)
              });
              i++;
            }

            this.initForm(menu);
            this.isRolesLoaded = true;
          }
        }
      })
    }
  }

  selectPermission(i: any, position: number) {
    let items = this.rolesForm.controls["menuItems"] as FormArray;
    let elem: FormGroup = items.controls[position] as FormGroup;
    if(elem) {
      elem.get("Permission").setValue(i);
    }
  }

  submitRole() {
    let items = this.rolesForm.controls["menuItems"] as FormArray;
    this.http.post("Roles/AddUpdateRole", items.value).then(response => {

    });
  }
}
