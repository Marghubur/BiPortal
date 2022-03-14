import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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


  constructor(private fb: FormBuilder,
              private http: AjaxService) { }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.rolesForm = this.fb.group({
      RoleName: new FormControl(0),
      RolePermission: new FormControl(0)
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
            this.isRolesLoaded = true;
          }
        }
      })
    }
  }

  selectPermission() {
    $(this).siblings('input[type="checkbox"]').not(this).prop('checked', false);
  }
}
