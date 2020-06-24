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
    selector: 'app-admin-event',
    templateUrl: './point-event-add.component.html',
    styleUrls: ['./point-event-add.component.scss']
})
export class AdminPointEventAddComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;
    @ViewChild('resourceImgDesc') public resourceImgDesc: AdminMultipleImagesComponent;
    @ViewChild('images') public images: AdminMultipleImagesComponent;

    public message: string;
    public categories: any;
    public env: any;
    public form: any;
    public eventId: any;
    public event: any;
    public brands = [];
    public eventEventTypes = [
        {value: 1, viewValue: 'Join'},
        {value: 2, viewValue: 'Answer'}
    ];
    public timeColorCodes: any;
    public eventEventTypeSelected = 'review';
    public invalidMainImage = false;
    public invalidImages = false;
    public isSubmitted = false;
    public output_text_type = '1';
    public output_category = '407';
    public fashion: any;
    public beauty: any;
    // public food: any;

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
            this.eventId = params['id'];
        });
        this.timeColorCodes = [];
        this.event = {
            event_knd_code: 398002,
            short_desc: '',
            description: '',
            resource_type: 1,
            level_apply: 1,
            status: 1
        };

        this.form = new FormGroup({
            name: new FormControl(this.event.cntnts_nm, [Validators.required]),
            time_color_code: new FormControl(this.event.time_color_code, []),
            short_description: new FormControl(this.event.short_description, []),
            description: new FormControl(this.event.good_dc, [Validators.required]),
            is_disabled: new FormControl(this.event.is_disabled, []),
            brand_id: new FormControl(this.event.brnd_code, [Validators.required]),
            category_id: new FormControl(this.event.goods_cl_code, [Validators.required]),
            start_date: new FormControl(this.event.event_bgnde, [Validators.required]),
            end_date: new FormControl(this.event.event_endde, [Validators.required]),
            delivery_start_date: new FormControl(this.event.dlvy_bgnde, [Validators.required]),
            delivery_end_date: new FormControl(this.event.dlvy_endde, [Validators.required]),
            join_max_count: new FormControl(this.event.event_trgter_co, [Validators.required]),
            product_url: new FormControl(this.event.link_url, [Validators.required]),
            model: new FormControl(this.event.modl_nombr, []),
            type: new FormControl(this.event.event_knd_code, []),
            hash_tag: new FormControl(this.event.hash_tag, []),
            // is_event_event: new FormControl(this.event.is_event_event, []),
            // event_event_start_date: new FormControl(this.event.event_event_start_date, []),
            // event_event_end_date: new FormControl(this.event.event_event_end_date, []),
            // quantity_to_qualify: new FormControl(this.event.quantity_to_qualify, []),
            // event_event_type: new FormControl(this.event.event_event_type, []),
            price: new FormControl(this.event.goods_pc, []),
            goods_txt: new FormControl(this.event.goods_txt, []),
            output_text_type: new FormControl(this.output_text_type, []),
            output_category: new FormControl(this.output_category, []),
            sale_price: new FormControl(this.event.event_pc, []),
            resource_type: new FormControl(this.event.resource_type, []),
            goods_code_group: new FormControl(this.event.goods_code_group, []),
            level_apply: new FormControl(this.event.level_apply, [])
        });

        if (this.eventId) {
            this.getevent();
        }
        this.getColors();
        this.getBrands();
        this.getCategories();
        this.getFashion();
        this.getBeauty();
        // this.getFood();
        this.event.goods_code_group = this.event.goods_code_group ? this.event.goods_code_group : "407";
    }

    getevent() {
        this.api.one('tries', this.getevent).get()
            .subscribe(res => {
                this.event = res.result;
                if (res.result.files.length > 0) {
                    this.event.feature_image = res.result.files[0].stre_file_nm ? res.result.files[0].file_cours + '/' +
                        res.result.files[0].stre_file_nm : res.result.files[0].file_cours;
                } else {
                    this.event.feature_image = null;
                }

                if (res.result.imgDesc.length > 0) {
                    this.event.desc_img = res.result.imgDesc[0].stre_file_nm ? res.result.imgDesc[0].file_cours + '/' +
                        res.result.imgDesc[0].stre_file_nm : res.result.imgDesc[0].file_cours;
                }

                this.event.files.splice(0, 1);
                this.event.event_knd_code = this.event.event_knd_code * 1;

                this.event.event_bgnde = moment.utc(this.event.event_bgnde).toDate();
                this.event.event_endde = moment.utc(this.event.event_endde).toDate();
                this.event.dlvy_bgnde = moment.utc(this.event.dlvy_bgnde).toDate();
                this.event.dlvy_endde = moment.utc(this.event.dlvy_endde).toDate();
                this.output_text_type = this.event.goods_txt ? '2' : '1';
                this.event.is_disabled = this.event.expsr_at !== 'Y';
                // this.event.event_event_type = (this.event.event_event_type != null && this.eventEventTypes.indexOf(this.event.event_event_type) !== -1) ? this.event.event_event_type : this.eventEventTypes[0].value;
                // this.event.event_event_start_date = this.event.event_event_start_date != null ? moment.utc(this.event.event_event_start_date).toDate() : this.event.start_date;
                // this.event.event_event_end_date = this.event.event_event_end_date != null ? moment.utc(this.event.event_event_end_date).toDate() : this.event.end_date;
            });
    }

    getBrands() {
        this.api.all('brands').customGET('').subscribe(res => {
            // this.brands = _.sortBy(res.result, 'code_nm');
            // this.brands = _.orderBy(res.result, ['code_nm'], ['asc']);
            this.brands = res.result;
        });
    }

    getCategories() {
        this.api.all('categories').customGET('').subscribe(res => {
            this.categories = res.result;
            console.log(this.categories);
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
    // getFood() {
    //     this.api.all('getFood').customGET('').subscribe(res => {
    //         this.food = res.result;
    //     });
    // }

    getColors() {
        this.api.all('admin').customGET('text-colors').subscribe(res => {
            if (res.result) {
                this.timeColorCodes = res.result;
            }
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
                    this.event.img_desc = res.images[0];
                } else {
                    this.event.img_desc = null;
                }
            }

            this.resource.onSave((response) => {
                if (typeof response === 'undefined' || typeof response.url === 'undefined' || !response.url) {
                    this.invalidMainImage = true;
                    return;
                }
                this.event.resource_type = response.resource_type;
                this.images.onSave((rs) => {
                    this.event.images = rs.images;
                    if (this.output_text_type === '1') {
                        this.event.goods_txt = null;
                    }
                    this.event.images.splice(0, 0, {name: response.name, url: response.url});
                    this.onSaveCallback();
                });
            });
        });
    }

    onSaveCallback() {
        this.event.expsr_at = this.event.is_disabled ? 'N' : 'Y';
        this.event.event_bgnde_format = moment.utc(this.event.event_bgnde).format('YYYY-MM-DD HH:mm:ss');
        this.event.event_endde_format = moment.utc(this.event.event_endde).format('YYYY-MM-DD HH:mm:ss');
        this.event.dlvy_bgnde_format = moment(this.event.dlvy_bgnde).format('YYYY-MM-DD');
        this.event.dlvy_endde_format = moment(this.event.dlvy_endde).format('YYYY-MM-DD');

        if (this.getevent) {
            this.api
                .one('tries', this.getevent)
                .customPUT(this.event)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Update event successfully');
                        this.router.navigate(['/admin/event']);
                    }
                });
        } else {
            this.api
                .all('tries')
                .customPOST(this.event)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Add event successfully');
                        this.router.navigate(['/admin/event']);
                    }
                });
        }
    }

    goBack(): void {
        this.router.navigate(['/admin/event']);
    }

    changeCategory() {
        this.event.goods_cl_code = '';
    }

}
