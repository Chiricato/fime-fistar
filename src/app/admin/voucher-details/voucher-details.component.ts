import {
    Component,
    OnInit,
    Inject,
    PLATFORM_ID,
    ViewChild,
    ElementRef
} from '@angular/core';

import { Restangular } from 'ngx-restangular';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { CookieService } from '../../../services/cookie.service';
import { environment } from '../../../environments/environment';
import { AdminResourceComponent } from '../resource/resource.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import * as moment from 'moment';
import { AdminMultipleImagesComponent } from '../multiple-images/multiple-images.component';
import { Observable } from 'rxjs';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-admin-voucher-details',
    templateUrl: './voucher-details.component.html',
    styleUrls: ['./voucher-details.component.scss']
})
export class AdminVoucherDetailsComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;
    @ViewChild('resourceImgDesc') public resourceImgDesc: AdminMultipleImagesComponent;
    @ViewChild('images') public images: AdminMultipleImagesComponent;

    public message: string;
    public categories: any;
    public env: any;
    public form: any;
    public voucherId: any;
    public voucher: any;
    public brands = [];
    public tries = [];
    public tryEventTypes = [
        { value: 'review', viewValue: 'Review' },
        { value: 'like', viewValue: 'Like' },
        { value: 'comment', viewValue: 'Comment' }
    ];
    public timeColorCodes: any;
    public tryEventTypeSelected = 'review';
    public invalidMainImage = false;
    public invalidImages = false;
    public isSubmitted = false;
    public output_category = '407';
    public fashion: any;
    public beauty: any;
    public food: any;
    public city: string[] = [];
    public provinces: any;
    public isLoading = false;
    public is_disabled = false;
    public location_id = [];
    public checkLocation = true;
    public checkPrice = true;
    public isShowBtnTry = false;
    public tryfree_id: any;
    public creds: any;

    visible = true;
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    fruitCtrl = new FormControl();
    filteredProvinces: Observable<string[]>;
    province: string[] = [];
    // city: string[] = ['Apple', 'Lemon', 'Lime', 'Orange', 'Strawberry'];
    @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;

    constructor(
        private fb: FormBuilder,
        private api: Restangular,
        private cookieService: CookieService,
        private router: Router,
        public activeRoute: ActivatedRoute,
        private toast: ToastrService,
        private translate: TranslateService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.filteredProvinces = this.fruitCtrl.valueChanges.pipe(
            startWith(null),
            map((item) => item ? this._filter(item) : this.provinces.slice()));
    }

    ngOnInit() {
        this.env = environment;

        this.activeRoute.params.forEach((params: Params) => {
            this.voucherId = params['id'];
        });
        this.timeColorCodes = [];
        this.voucher = {
            event_knd_code: 398002,
            description: '',
            resource_type: 1,
            voucher_type: 1,
            discount_type: 1,
            type: 1,
            // status: 1,
            type_product_collection: 2
        };

        this.form = new FormGroup({
            type: new FormControl(this.voucher.type, []),
            name: new FormControl(this.voucher.name, [Validators.required]),
            try_id: new FormControl(this.voucher.try_id, []),
            description: new FormControl(this.voucher.description, [Validators.required]),
            hashtag: new FormControl(this.voucher.hashtag, []),
            // is_disabled: new FormControl(this.voucher.is_disabled, []),
            brand: new FormControl(this.voucher.brand, [Validators.required]),
            category: new FormControl(this.voucher.category, [Validators.required]),
            catalog: new FormControl(this.voucher.catalog, [Validators.required]),
            voucher_type: new FormControl(this.voucher.voucher_type, []),
            value: new FormControl(this.voucher.value, []),
            limit_user: new FormControl(this.voucher.limit_user, [Validators.required]),
            amount: new FormControl(this.voucher.amount, [Validators.required]),
            discount_type: new FormControl(this.voucher.discount_type, []),
            voucher_price: new FormControl(this.voucher.voucher_price, []),
            type_point: new FormControl(this.voucher.type_point, []),
            start_date: new FormControl(this.voucher.start_date, [Validators.required]),
            end_date: new FormControl(this.voucher.end_date, [Validators.required]),
            delivery_start: new FormControl(this.voucher.delivery_start, [Validators.required]),
            delivery_end: new FormControl(this.voucher.delivery_end, [Validators.required]),
            type_product_collection: new FormControl(this.voucher.type_product_collection, [Validators.required]),
            product_collection: new FormControl(this.voucher.product_collection, []),
            status: new FormControl(this.voucher.status, []),
            sale_status: new FormControl(this.voucher.sale_status, []),
            minimum_discount: new FormControl(this.voucher.minimum_discount, []),
            maxnimum_discount: new FormControl(this.voucher.maxnimum_discount, []),
            other_condition: new FormControl(this.voucher.other_condition, []),
            store_info: new FormArray([]),
        });
        this.creds = this.form.controls.store_info as FormArray;
        this.creds.push(this.fb.group({
            store_name: '',
            store_address: '',
        }));
        if (this.voucherId) {
            this.removeStore(0);
            this.getVoucher();
        }
        this.getBrands();
        this.getCategories();
        this.getFashion();
        this.getBeauty();
        this.getFood();
        this.getTry();
        this.getCity();
        this.voucher.category = this.voucher.category ? this.voucher.category : 407;
        this.voucher.sale_status = this.voucher.sale_status ? this.voucher.sale_status : 1;

    }

    getVoucher() {
        this.api.one('voucher', this.voucherId).get()
            .subscribe(res => {
                this.voucher = res.result;
                if (res.result.files.length > 0) {
                    this.voucher.feature_image = res.result.files[0].stre_file_nm ? res.result.files[0].file_cours + '/' +
                        res.result.files[0].stre_file_nm : res.result.files[0].file_cours;
                } else {
                    this.voucher.feature_image = null;
                }

                this.voucher.files.splice(0, 1);

                this.voucher.start_date = moment.utc(this.voucher.start_date).toDate();
                this.voucher.end_date = moment.utc(this.voucher.end_date).toDate();
                this.voucher.dlvy_bgnde = moment.utc(this.voucher.delivery_start).toDate();
                this.voucher.dlvy_endde = moment.utc(this.voucher.delivery_end).toDate();
                this.voucher.status = this.voucher.status == 4;
                for (let index = 0; index < this.voucher.location.length; index++) {
                    this.province.push(this.voucher.location[index].name)
                    this.location_id.push(this.voucher.location[index].province_id);
                }
                for (let index = 0; index < this.voucher.store_info.length; index++) {
                    this.creds.push(this.fb.group({
                        store_name: this.voucher.store_info[index].store_name,
                        store_address: this.voucher.store_info[index].store_address,
                    }));

                }
            });
    }

    getBrands() {
        this.api.all('brands').customGET('').subscribe(res => {
            this.brands = res.result;
        });
    }

    getCategories() {
        this.api.all('categories').customGET('').subscribe(res => {
            this.categories = res.result;
        });
    }
    getFashion() {
        this.api.all('getFashion').customGET('').subscribe(res => {
            this.fashion = res.result;
        });
    }
    getBeauty() {
        this.api.all('getBeauty').customGET('').subscribe(res => {
            this.beauty = res.result;
        });
    }
    getFood() {
        this.api.all('getFood').customGET('').subscribe(res => {
            this.food = res.result;
        });
    }
    getTry() {
        this.api.all('voucher-tries').customGET('').subscribe(res => {
            this.tries = res.result;
        });
    }
    getCity() {
        this.api.all('city').customGET('').subscribe(res => {
            this.provinces = res.result;
            // for (let index = 0; index < this.provinces.length; index++) {
            //     this.city.push(this.provinces[index].name);

            // }
            this.isLoading = true;
        });
    }


    onSave() {
        this.isSubmitted = true;
        // if (!this.images.isValidData()) {
        // this.invalidImages = true;
        //     return;
        // } else {
        //     this.invalidImages = false;
        // }

        this.resourceImgDesc.onSave((res) => {
            if (typeof res !== 'undefined') {
                if (res.images) {
                    this.voucher.img_desc = res.images[0];
                } else {
                    this.voucher.img_desc = null;
                }
            }

            this.resource.onSave((response) => {
                if (typeof response === 'undefined' || typeof response.url === 'undefined' || !response.url) {
                    this.invalidMainImage = true;
                    return;
                }
                this.voucher.resource_type = response.resource_type;
                this.images.onSave((rs) => {
                    this.voucher.images = rs.images;
                    if (this.voucher.type === 1) {
                    }
                    if (this.voucher.images) {
                        this.voucher.images.splice(0, 0, { name: response.name, url: response.url });
                    }
                    this.onSaveCallback();
                });
            });
        });
    }

    onSaveCallback() {
        this.voucher.location_id = this.location_id;
        if (this.voucher.type === 1) {
            if (!this.voucher.voucher_price) {
                return this.checkPrice = false;
            }
        }
        if (this.voucher.location_id.length === 0) {
            this.checkLocation = false;
            return
        }
        this.voucher.status = this.voucher.status ? 4 : 1;
        this.voucher.event_bgnde_format = moment.utc(this.voucher.start_date).format('YYYY-MM-DD HH:mm:ss');
        this.voucher.event_endde_format = moment.utc(this.voucher.end_date).format('YYYY-MM-DD HH:mm:ss');
        this.voucher.dlvy_bgnde_format = moment(this.voucher.dlvy_bgnde).format('YYYY-MM-DD');
        this.voucher.dlvy_endde_format = moment(this.voucher.dlvy_endde).format('YYYY-MM-DD');
        this.voucher.store_info = this.form.controls.store_info.value;
        if (this.voucherId) {
            this.api
                .one('voucher-update', this.voucherId)
                .customPUT(this.voucher)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Update Voucher successfully');
                        this.router.navigate(['/admin/vouchers']);
                    }
                });
        } else {
            this.api
                .all('add-voucher')
                .customPOST(this.voucher)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Add Voucher successfully');
                        this.router.navigate(['/admin/vouchers']);
                    }
                });
        }
    }

    goBack(): void {
        this.router.navigate(['/admin/vouchers']);
    }

    changeCategory() {
        this.voucher.catalog = '';
    }
    changeVoucherType() {
        this.voucher.value = '';
    }
    changeType() {
        this.voucher.try_id = '';
        this.voucher.voucher_price = '';
    }
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our fruit
        if ((value || '').trim()) {
            this.province.push(value.trim());
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }

        this.fruitCtrl.setValue(null);
    }

    remove(item: string): void {
        const index = this.province.indexOf(item);
        if (index >= 0) {
            this.province.splice(index, 1);
            this.location_id.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        this.location_id.push(event.option.value);
        // console.log(this.location_id);
        this.province.push(event.option.viewValue);
        this.fruitInput.nativeElement.value = '';
        this.fruitCtrl.setValue(null);
    }

    private _filter(value: string): string[] {
        // console.log(this.filteredProvinces);
        // console.log(value);
        // const filterValue = value.toLowerCase();
        return this.provinces.filter(item => item.name.toLowerCase().indexOf() === 0);
    }

    changeTry(item) {
        this.tryfree_id = item;
        // console.log(item);
        this.isShowBtnTry = true;
    }

    addStore() {
        this.creds.push(this.fb.group({
            store_name: '',
            store_address: '',
        }));
        console.log(this.form.controls.store_info.controls);
    }
    removeStore(index: number) {
        this.creds.removeAt(index);
    }
    disableEdit() {
        this.toast.error('Sorry! This voucher has been redeem. You can not edit the content anymore.');
        return
    }
    changeBrand(brand: any) {
        const found = this.brands.find(x => x.code === brand.code);
        const control = <FormArray>this.form.controls['store_info'];
        for (let i = control.length - 1; i >= 0; i--) {
            control.removeAt(i)
        }
        for (let index = 0; index < found.store_info.length; index++) {
            this.creds.push(this.fb.group({
                store_name: found.store_info[index] ? found.store_info[index].store_name : '',
                store_address: found.store_info[index] ? found.store_info[index].store_address : '',
            }));
        }
    }
}
