import { CommonService } from "../providers/common-service/common.service";
import { PipeTransform, Pipe } from "@angular/core";

@Pipe({ name: "joinNames" })
export class JoinString implements PipeTransform {
  constructor(private commonService: CommonService) {}
  transform(secontPart: string, firstPart: string): string {
    let NewName = "";
    if (
      this.commonService.IsValidString(firstPart) &&
      this.commonService.IsValidString(secontPart)
    ) {
      NewName = firstPart + secontPart;
    }
    return NewName;
  }
}
