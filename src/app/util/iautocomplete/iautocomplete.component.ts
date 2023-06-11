import { Component, OnInit, Input, Output, EventEmitter, forwardRef, OnDestroy, HostListener, ElementRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as $ from "jquery";
import { CommonService } from "src/providers/common-service/common.service";
import { API } from "src/providers/constants";

/*



  let value = [{
                value: 'value used for the item (any type i.e string, array or any object)',
                text: 'text to be displayed (allow only string or number)'
              }];

  let placehosderName = 'Placeholder name';

  <bot-autocomplete [data]="autoCompleteModal" [(ngModel)]="employeeId"
  (OnSelect)="your-fn($event)"></bot-autocomplete>






*/

@Component({
  selector: "bot-autocomplete, bot-multiselect",
  templateUrl: "./iautocomplete.component.html",
  styleUrls: ["./iautocomplete.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IautocompleteComponent),
      multi: true,
    },
  ],
})
export class IautocompleteComponent implements OnInit, OnDestroy , ControlValueAccessor {
  BindingData: any = [];
  AutofillDroopdownHeight: any;
  HeightValue: number;
  AutofillObject: any;
  InitValue: string = "";
  InitData: string = "";

  OriginalData: any = null;
  DropdownData: any = null;
  placeholder: string;
  currentValue: string;
  selectedIndex: number = -1;
  element: any;
  el: any;
  suggestions = [];
  badQueries = [];
  intervalId: any;
  cachedResponse = [];
  onChangeInterval: any;
  isLocal: any;
  ignoreValueChange: any;
  suggestionsContainer: any = null;
  options: any;
  classes: any;
  isShowEmptyRow: boolean = false;
  $CurrentAutoComplete: any;
  manualFocus: boolean = false;
  DefaultValue: any = null;
  IsMultiSelect: boolean = false;
  ClassName: string = ""
  Tabindex: string  = "0";

  @Output() OnSelect = new EventEmitter();
  @Output() onKeyup = new EventEmitter();
  @Output() onFocus = new EventEmitter();

  @Input()
  set data(dataModal: autoCompleteModal) {
    if (dataModal) {
      this.placeholder = dataModal.placeholder;
      this.ClassName = dataModal.className;
      this.DropdownData = dataModal.data;
      this.OriginalData = dataModal.data;
    }

    this.ManageBindingData();
  }

  get Data() {
    return this.OriginalData;
  }

  // Sync data changes

  onTuched: () => {};
  onChange: (_: any) => {};

  writeValue(value: string): void {
    this.DefaultValue = value !== null ? value : "";
    this.BindDefaultValue();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {}

  // ----------------------  ends ----------------------

  constructor(private commonService: CommonService,
    private elem: ElementRef) {

      this.HeightValue = 250;
      this.AutofillDroopdownHeight = this.HeightValue.toString() + "px";
      switch(elem.nativeElement.tagName) {
        case "BOT-MULTISELECT":
          this.IsMultiSelect = true;
          break;
        default:
          this.IsMultiSelect = false;
          break;
      }
    // this.RegisterListener();
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', null);
    console.log("Handler removed.");
  }

  @HostListener('document:click', ['$event'])
  CloseSuggestionBox(e: any) {
    if(this.IsMultiSelect) {
      if (e.target.getAttribute('title') == "bt-autocomplete") {
        // do nothing
      } else {
        if (this.$CurrentAutoComplete) {
          this.hide();
          this.killSuggestions();
        }
      }
    }
  }

  LoadFromApi(e: any) {
    alert(e.target.value);
    API.GETEMPLOYEEBYFILTER;
  }

  BindDefaultValue() {
    if (this.DefaultValue !== null && this.DropdownData) {
      let elems = this.DropdownData.filter(
        (x) => x.value === this.DefaultValue
      );
      if (elems.length === 1) {
        this.InitValue = elems[0].text;
        this.InitData = JSON.stringify(elems[0].value);
      } else if (elems.length > 1) {
      }
    }
  }

  NoAction() {
    event.stopPropagation();
    event.preventDefault();
  }

  ManageBindingData() {
    if (this.commonService.IsValid(this.DropdownData)) {
      this.BindingData = null;
      this.BindingData = this.DropdownData;
      if (this.$CurrentAutoComplete !== null) {
        this.suggestions = this.commonService.IsValid(this.DropdownData)
          ? this.DropdownData
          : [];
      }

      if (
        typeof this.BindingData !== "undefined" &&
        this.BindingData !== null
      ) {
        if (this.BindingData.length === 0) this.isShowEmptyRow = true;
        else this.isShowEmptyRow = false;
      } else {
        this.isShowEmptyRow = true;
      }
    }
  }

  ngOnInit() {}

  InitialSetup(a, b) {
    var c = function () {},
      cn = {
        autoSelectFirst: !1,
        appendTo: "iautofill-searchfield",
        serviceUrl: null,
        lookup: null,
        onValueSelect: null,
        width: "auto",
        minChars: 1,
        maxHeight: 200,
        deferRequestBy: 0,
        params: {},
        //formatResult: g.formatResult,
        delimiter: null,
        zIndex: 9999,
        type: "GET",
        noCache: !1,
        onSearchStart: c,
        onSearchComplete: c,
        containerClass: "autocomplete-suggestions",
        tabDisabled: !1,
        dataType: "text",
        lookupFilter: function (a, b, c) {
          return -1 !== a.value.toLowerCase().indexOf(c);
        },
        paramName: "query",
        transformResult: function (a) {
          return "string" === typeof a ? $.parseJSON(a) : a;
        },
      };
    this.element = a;
    this.el = $(a);
    this.suggestions = this.commonService.IsValid(b.lookup) ? b.lookup : [];
    this.badQueries = [];
    this.selectedIndex = -1;
    this.currentValue = this.element.value;
    this.intervalId = 0;
    this.cachedResponse = [];
    // this.onChange = this.onChangeInterval = null;
    this.isLocal = this.ignoreValueChange = !1;
    this.suggestionsContainer = $(a)
      .closest('div[name="autofill-container"]')
      .find('div[name="iautofill-div"]')[0];
    this.options = $.extend({}, cn, b);
    this.classes = {
      selected: "autocomplete-selected",
      suggestion: "autocomplete-suggestion",
    };
    this.setOptions(b);
    setTimeout(() => {
      this.moveOnTab();
    }, 100);
  }

  // InitAutoComplete() {
  //   $("#autocomplete").autocomplete({
  //     lookup: this.BindingData,
  //     onValueSelect: function (suggestion) {
  //       var thehtml =
  //         "<strong>Currency Name:</strong> " +
  //         suggestion.value +
  //         " <br> <strong>Symbol:</strong> " +
  //         suggestion.data;
  //       $("#outputcontent").html(thehtml);
  //     },
  //   });
  // }

  ShowAutofillDropdown() {
    this.onFocus.emit();
    if (!this.manualFocus) {
      this.ManageBindingData();
      let $event = $(event.currentTarget).closest(
        'div[name="autofill-container"]'
      );
      $event.find('input[name="autocomplete"]').val("");
      $event.find('div[name="suggestionBox-dv"]').removeClass("d-none");
      this.manualFocus = true;
      $event.find('input[name="autocomplete"]').focus();
      this.$CurrentAutoComplete = $event;
      this.InitialSetup($event.find('input[name="autocomplete"]')[0], {
        lookup: this.BindingData,
        onValueSelect: null,
      });
    } else {
      this.manualFocus = false;
    }
  }

  onKeyPress(e: any) {
    switch (e.keyCode) {
      case 27:
        this.el.val(this.currentValue);
        this.hide();
        break;
      case 9:
        if (-1 === this.selectedIndex) {
          let fulltext = $(e.currentTarget).val();
          this.selectOption({ value: fulltext, data: "" }, -1);
          this.hide();
          return;
        }
        this.select(this.selectedIndex, true, e);
        break;
      case 13:
        if (-1 === this.selectedIndex) {
          let fulltext = $(e.currentTarget).val();
          this.selectOption({ value: fulltext, data: "" }, -1);
          this.hide();
          return;
        }
        this.select(this.selectedIndex, 13 === e.keyCode, e);
        if (9 === e.keyCode && !1 === this.options.tabDisabled) return;
        break;
      case 38:
        this.moveUp();
        break;
      case 40:
        this.moveDown();
        break;
      default:
        return;
    }
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  onKeyUp(a: any) {
    var b = this;
    switch (a.keyCode) {
      case 38:
      case 40:
        return;
    }
    clearInterval(b.onChangeInterval);
    if (b.currentValue !== b.el.val())
      if (0 < b.options.deferRequestBy)
        b.onChangeInterval = setInterval(function () {
          b.onValueChange();
        }, b.options.deferRequestBy);
      else {
        b.onValueChange();
      }
  }

  onValueChange() {
    var a;
    clearInterval(this.onChangeInterval);
    this.currentValue = this.element.value;
    a = this.getQuery(this.currentValue);
    this.selectedIndex = -1;
    this.ignoreValueChange
      ? (this.ignoreValueChange = !1)
      : a.length < this.options.minChars
      ? (this.BindingData = this.DropdownData)
      : this.getSuggestions(a);
  }

  getSuggestions(a) {
    // make ajax request;
    let Data = this.DropdownData;
    this.BindingData = [];
    let index = 0;
    while (index < Data.length) {
      if (
        Data[index].text !== null &&
        Data[index].text.toLocaleLowerCase().indexOf(a) === 0
      ) {
        this.BindingData.push(Data[index]);
      }
      index++;
    }
  }

  getQuery(a) {
    var b = this.options.delimiter;
    if (!b) return $.trim(a);
    a = a.split(b);
    return $.trim(a[a.length - 1]);
  }

  getSuggestionsLocal(a) {
    var b = a.toLowerCase(),
      c = this.options.lookupFilter;
    return {
      suggestions: $.grep(this.options.lookup, function (d) {
        return c(d, a, b);
      }),
    };
  }

  hide() {
    this.selectedIndex = -1;
    //$(this.suggestionsContainer).hide();
    this.$CurrentAutoComplete.find('input[name="autocomplete"]').val("");
    this.$CurrentAutoComplete
      .find('div[name="suggestionBox-dv"]')
      .addClass("d-none");
  }

  activate(a) {
    var b = this.classes.selected,
      c = $(this.suggestionsContainer),
      d = c.children();
    c.children("." + b).removeClass(b);
    this.selectedIndex = a;
    return -1 !== this.selectedIndex && d.length > this.selectedIndex
      ? ((a = d.get(this.selectedIndex)), $(a).addClass(b), a)
      : null;
  }

  select(a, b, e: any) {
    var c = this.BindingData[a];
    if(this.IsMultiSelect) {
      let elem = e.currentTarget.querySelector('input');
      if (c.selected) {
        c.selected = false;
      }
      else {
        c.selected = true;
      }

      this.OnSelect.emit(c);
      return;
    }

    c &&
      (this.el.val(c),
      (this.ignoreValueChange = b),
      this.hide(),
      this.onValueSelect(a));
    this.selectOption(c, a);
  }

  selectOption(c, a) {
    this.$CurrentAutoComplete
      .find('input[name="iautofill-textfield"]')
      .val(c.text);
    this.$CurrentAutoComplete
      .find('input[name="iautofill-textfield"]')
      .attr("data", JSON.stringify(c));
    this.$CurrentAutoComplete
      .find('div[name="suggestionBox-dv"]')
      .addClass("d-none");

    this.DefaultValue = c.value;
    this.onChange(this.DefaultValue);
    this.OnSelect.emit(c.value);
  }

  AddToAutoFillList() {
    this.$CurrentAutoComplete = $(event.currentTarget).closest("div");
    this.ToggleRemoveIcon($(event.currentTarget).attr("data"), true);
    this.ClearSelection();
  }

  ToggleRemoveIcon(JsonData: string, IsAddtoList: boolean) {
    let $item = this.$CurrentAutoComplete.find('a[name="remove-pointer"]');
    $item.toggleClass("d-none");
    $item.attr("data", JsonData);
    if (IsAddtoList) {
      let Item = JSON.parse(JsonData);
      this.BindingData.unshift(Item);
    }
  }

  ClearSelection() {
    let elem = this.$CurrentAutoComplete.find(
      'input[name="iautofill-textfield"]'
    );
    if (elem !== null) {
      elem.val("");
      elem.attr("data", "");
      this.InitData = "";
    }
  }

  moveUp() {
    -1 !== this.selectedIndex &&
      (0 === this.selectedIndex
        ? ($(this.suggestionsContainer)
            .children()
            .first()
            .removeClass(this.classes.selected),
          (this.selectedIndex = -1),
          this.el.val(this.currentValue))
        : this.adjustScroll(this.selectedIndex - 1));
  }

  moveDown() {
    this.selectedIndex !== this.BindingData.length - 1 &&
      this.adjustScroll(this.selectedIndex + 1);
  }

  moveOnTab() {
    this.selectedIndex !== this.BindingData.length - 1 &&
      this.EnableFieldOnTab(this.selectedIndex + 1);
  }

  EnableFieldOnTab(a) {
    var b = this.activate(a);
  }

  adjustScroll(a) {
    var b = this.activate(a),
      c,
      d;
    b &&
      ((b = b.offsetTop),
      (c = $(this.suggestionsContainer).scrollTop()),
      (d = c + this.options.maxHeight - 25),
      b < c
        ? $(this.suggestionsContainer).scrollTop(b)
        : b > d &&
          $(this.suggestionsContainer).scrollTop(
            b - this.options.maxHeight + 32
          ),
      this.el.val(this.getValue(this.BindingData[a].text)));
  }

  onValueSelect(a) {
    var b = this.options.onValueSelect;
    a = this.BindingData[a];
    this.el.val(this.getValue(a.value));
    $.isFunction(b) && b.call(this.element, a);
  }

  getValue(a) {
    var b = this.options.delimiter,
      c;
    if (!b) return a;
    c = this.currentValue;
    b = c.split(b);
    return 1 === b.length
      ? a
      : c.substr(0, c.length - b[b.length - 1].length) + a;
  }

  dispose() {
    this.el.off(".autocomplete").removeData("autocomplete");
    this.disableKillerFn();
    $(this.suggestionsContainer).remove();
  }

  onBlur() {
    if(!this.IsMultiSelect) {
      this.hide();
      this.killSuggestions();
    }
  }

  setOptions(a) {
    var b = this.options;
    var h = {
      extend: function (a, b) {
        return $.extend(a, b);
      },
      createNode: function (a) {
        var b = document.createElement("div");
        b.innerHTML = a;
        return b.firstChild;
      },
    };
    h.extend(b, a);
    if ((this.isLocal = $.isArray(b.lookup)))
      b.lookup = this.verifySuggestionsFormat(b.lookup);
    $(this.suggestionsContainer).css({
      "max-height": b.maxHeight + "px",
      width: b.width + "px",
      "z-index": b.zIndex,
    });
  }

  verifySuggestionsFormat(a) {
    return a.length && "string" === typeof a[0]
      ? $.map(a, function (a) {
          return {
            value: a,
            data: null,
          };
        })
      : a;
  }

  clearCache() {
    this.cachedResponse = [];
    this.badQueries = [];
  }

  clear() {
    this.clearCache();
    this.currentValue = null;
    this.suggestions = [];
  }

  fixPosition() {
    let a: any;
    "body" === this.options.appendTo &&
      ((a = this.el.offset()),
      $(this.suggestionsContainer).css({
        top: a.top + this.el.outerHeight() + "px",
        left: a.left + "px",
      }));
  }

  enableKillerFn() {
    $(document).on("click.autocomplete", this.killerFn);
  }

  disableKillerFn() {
    $(document).off("click.autocomplete", this.killerFn);
  }

  killerFn(b) {
    0 === $(b.target).closest("." + this.options.containerClass).length &&
      (this.killSuggestions(), this.disableKillerFn());
  }

  killSuggestions() {
    let a: any = this;
    a.stopKillSuggestions();
    a.intervalId = window.setInterval(function () {
      a.hide();
      a.stopKillSuggestions();
    }, 300);
  }

  stopKillSuggestions() {
    window.clearInterval(this.intervalId);
  }
}

export class
pairData {
  value: any = null;
  text: string = "";
  selected?: boolean = false;
  email?: string = "";
}

export class autoCompleteModal {
  constructor(text: string = 'Select your option') {
    this.placeholder = text;
  }

  data: Array<pairData> = [];
  className?: string = 'disabled-input';
  placeholder?: string = null;
  tabindex?: any = null;
  isMultiSelect?: boolean = false;
}
