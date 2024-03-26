import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss']
})
export class PriceComponent implements OnInit {
  isLoading: boolean = false;
  priceDetail: Array<PriceDetail>;

  constructor(private http: CoreHttpService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.http.get("Price/GetPriceDetail").then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.priceDetail = [];
        this.priceDetail = res.ResponseBody;
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
