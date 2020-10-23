import {
    Component,
    OnInit,
    Inject,
    PLATFORM_ID,
    ViewChild
} from '@angular/core';

import {Restangular} from 'ngx-restangular';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';

import {CookieService} from '../../../services/cookie.service';
import {environment} from '../../../environments/environment';
import {AdminResourceComponent} from '../resource/resource.component';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import * as moment from 'moment';
import {AdminMultipleImagesComponent} from '../multiple-images/multiple-images.component';

@Component({
    selector: 'app-admin-try',
    templateUrl: './shop-details.component.html',
    styleUrls: ['./shop-details.component.scss']
})
export class AdminShopDetailsComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;
    @ViewChild('resourceImgDesc') public resourceImgDesc: AdminMultipleImagesComponent;
    @ViewChild('images') public images: AdminMultipleImagesComponent;

    public message: string;
    public cities: any;
    public streets: any;
    public states: any;
    public wards: any;
    public env: any;
    public form: any;
    public shopId: any;
    public tries: any;
    public shop: any;
    public fields = [];
    public invalidCoverImage = false;
    public invalidImages = false;
    public isSubmitted = false;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(
        private api: Restangular,
        private cookieService: CookieService,
        private router: Router,
        public activeRoute: ActivatedRoute,
        private toast: ToastrService,
        private translate: TranslateService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.env = environment;

        this.activeRoute.params.forEach((params: Params) => {
            this.shopId = params['id'];
        });

        this.form = new FormGroup({
            name: new FormControl(this.shop.name, [Validators.required]),
            address: new FormControl(this.shop.address, [Validators.required]),
        });

        if (this.shopId) {
            this.getShop();
        }
        this.getCities();
        this.getFields();
        this.getTries();
        this.getStreet();
        this.getStates();
        this.getWards();
    }

    getShop() {
        this.api.one('find-shop', this.shopId).get()
            .subscribe(res => {
                this.shop = res.result;
                
            });
    }

    getCities() {
        this.api.all('city').customGET('').subscribe(res => {
            this.cities = res.result;
        });
    }

    getFields() {
        this.api.all('field/all').customGET('').subscribe(res => {
            this.fields = res.result;
        });
    }
    getTries() {
        this.api.all('getFashion').customGET('').subscribe(res => {
            this.tries = res.result;
        });
    }
    getStreet() {
        this.api.all('street').customGET('').subscribe(res => {
            this.streets = res.result;
        });
    }
    getStates() {
        this.api.all('state').customGET('').subscribe(res => {
            this.states = res.result;
        });
    }

    getWards() {
        this.api.all('ward').customGET('').subscribe(res => {
            this.wards = res.result;
        });
    }

    onSave() {
        this.isSubmitted = true;
        if (!this.images.isValidData()) {
            this.invalidImages = true;
            return;
        } else {
            this.invalidImages = false;
        }

        this.resourceImgDesc.onSave((res) => {
            if (typeof res !== 'undefined') {
                if (res.images) {
                    this.shop.img_desc = res.images[0];
                } else {
                    this.shop.img_desc = null;
                }
            }

            this.resource.onSave((response) => {
                if (typeof response === 'undefined' || typeof response.url === 'undefined' || !response.url) {
                    this.invalidCoverImage = true;
                    return;
                }
                this.shop.resource_type = response.resource_type;
                this.images.onSave((rs) => {
                    this.shop.images = rs.images;
                    this.shop.images.splice(0, 0, {name: response.name, url: response.url});
                    this.onSaveCallback();
                });
            });
        });
    }

    onSaveCallback() {

        if (this.shopId) {
            this.api
                .one('tries', this.shopId)
                .customPUT(this.shop)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Update shop successfully');
                        this.router.navigate(['/admin/shops']);
                    }
                });
        } else {
            this.api
                .all('tries')
                .customPOST(this.shop)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Add shop successfully');
                        this.router.navigate(['/admin/shops']);
                    }
                });
        }
    }

    goBack(): void {
        this.router.navigate(['/admin/shops']);
    }

}
