import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss']
})
export class PriceComponent implements OnInit {
  isLoading: boolean = false;
  priceDetail: Array<PriceDetail>;

  constructor(private http: AjaxService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.http.get("Price/GetPriceDetail").then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.priceDetail = [];
        for (let index = 0; index < 4; index++) {
          this.priceDetail.push(res.ResponseBody[0]);
        }
        this.isLoading = false;
      }
    }).catch(e => {
      console.log(e);
      this.isLoading = false;
    })
  }

}

interface PriceDetail {
  PlanName: string,
  Description: string,
  Price: string,
  EmployeeLimit: string,
  AdditionalPriceDetail: string,
  AdditionalPrice: string,
  PlanSpecification: string,
  Features: Array<Feature>,
}

interface Feature {
  FeatureName: string,
  FeatureDetail: Array<string>
}
