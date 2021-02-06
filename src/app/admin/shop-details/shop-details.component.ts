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
import {FileUploader} from 'ng2-file-upload';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const URL = environment.host;
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
    public city_name = "";
    public state_name = "";
    public ward_name = "";
    street_name = "";
    public env: any;
    public form: any;
    public shopId: any;
    public try: any;
    public totalTry: any;
    public shop: any;
    public fields = [];
    public invalidCoverImage = false;
    public invalidImages = false;
    public isSubmitted = false;
    public type = 0;
    public cover_image = '';
    public image1 = '';
    public image2 = '';
    public image3 = '';
    public image4 = '';
    public image5 = '';
    public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'tip'});
    public uploaderInactive: FileUploader = new FileUploader({url: URL, itemAlias: 'tip'});
    public imageChangedEvent: any;
    public fileBase64: any;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    public tries_list:any;
    public try_id_mapping = [];
    public tries_mapping = [];
    public tries_mapping_tmp = [];
    public list_tries_mapping = [];
    public totalTryMapping: any;
    public selected = [];
    public pageIndexTry: any;
    public pageSize: any;
    public column = 'cntnts_no';
    public sort = 'desc';
    public pageLimitOptions = [];
    list_id_tries_mapping = [];
    public brands = [];
    public list_tries = [];
    public brand_id: any; 
    public catalogs: any;
    show_map = false;
    content_map: SafeResourceUrl;
    constructor(
        private api: Restangular,
        private cookieService: CookieService,
        private router: Router,
        public activeRoute: ActivatedRoute,
        private toast: ToastrService,
        private translate: TranslateService,
        private sanitizer: DomSanitizer,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.env = environment;
        this.pageIndexTry = 1;
        this.pageSize = 10;
        this.column = 'cntnts_no';
        this.sort = 'desc';
        this.getTries();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];
        this.shop = {

        };

        this.activeRoute.params.forEach((params: Params) => {
            this.shopId = params['id'];
        });

        this.form = new FormGroup({
            name: new FormControl(this.shop.name, [Validators.required]),
            address: new FormControl(this.shop.address, [Validators.required]),
            phone: new FormControl(this.shop.phone, []),
            owner: new FormControl(this.shop.owner, []),
            field_1: new FormControl(this.shop.field_1, []),
            field_2: new FormControl(this.shop.field_2, []),
            category: new FormControl(this.shop.category, [Validators.required]),
            catalog: new FormControl(this.shop.catalog, []),
            street_id: new FormControl(this.shop.street_id, [Validators.required]),
            city_id: new FormControl(this.shop.city_id, [Validators.required]),
            district_id: new FormControl(this.shop.district_id, [Validators.required]),
            ward_id: new FormControl(this.shop.ward_id, [Validators.required]),
            image: new FormControl(this.shop.image, []),
            email: new FormControl(this.shop.email, []),
            facebook_link: new FormControl(this.shop.facebook_link, []),
            follower: new FormControl(this.shop.follower, []),
            likes: new FormControl(this.shop.likes, []),
            homepage: new FormControl(this.shop.homepage, []),
            sns_type: new FormControl(this.shop.sns_type, []),
            sns_url: new FormControl(this.shop.sns_url, []),
            hashtag: new FormControl(this.shop.hashtag, []),
            brand_code: new FormControl(this.shop.brand_code, []),
            contact_history: new FormControl(this.shop.contact_history, [])
        });

        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        this.uploaderInactive.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        if (this.shopId) {
            this.getShop();
        }
        this.getCities();
        this.getFields();
        this.getTries();
        this.getStreet();
        this.getBrands();
    }

    getShop() {
        this.api.one('find-shop', this.shopId).get()
            .subscribe(res => {
                this.shop = res.result;
                this.cover_image = this.shop.cover_image;
                this.image1 = this.shop.image1;
                this.image2 = this.shop.image2;
                this.image3 = this.shop.image3;
                this.image4 = this.shop.image4;
                this.image5 = this.shop.image5;
                this.list_id_tries_mapping = this.shop.tries;
                this.city_name =this.shop.city_name;
                this.state_name = this.shop.state_name;
                this.ward_name = this.shop.ward_name;
                this.street_name = this.shop.street_name;
                if(this.shop.city_id){
                    this.api.all('state/'+this.shop.city_id).customGET('').subscribe(res => {
                        this.states = res.result;
                    });
                }else{
                    this.states = [];
                }

                if(this.shop.district_id){
                    this.api.all('ward/'+this.shop.district_id).customGET('').subscribe(res => {
                        this.wards = res.result;
                    });
                }else{
                    this.wards = [];
                }

                this.changeCategory();
                
            });
        this.getTryMapping();


    }

    getTryMapping() {
        this.api.one('GetTryShopMapping', this.shopId).get('',{page: this.pageIndexTry, pageSize: this.pageSize, column: this.column, sort: this.sort})
            .subscribe(res => {
                    this.list_tries_mapping = res.result.data;
                    this.totalTryMapping = res.result.total;
                    this.tries_mapping = this.list_tries_mapping;
                    console.log(this.tries_mapping,'this.tries_mapping');
                    console.log(this.list_id_tries_mapping,'this.list_id_tries_mapping');
            });
    }

    addTries(rows){
        const id = rows.cntnts_no;
        this.api.one('GetTryById',id).get().subscribe(res => {
            if (res.result) {
                this.tries_list = res.result;
                this.tries_mapping.push(this.tries_list);
                this.try_id_mapping.push(this.tries_list.cntnts_no);
                this.list_id_tries_mapping.push(this.tries_list.cntnts_no);
                // this.totalTryMapping = this.tries_mapping.length;
            }
        });
    }
    AddTriesMulti() {
        if (this.selected.length > 0) {
            var count= this.selected.length;
            for(var i=0;i<count;i++){
                const id2 = this.selected[i].cntnts_no;
                console.log(this.list_id_tries_mapping,'this.list_id_tries_mapping');
                console.log(id2,'id2');
                console.log(this.selected[i],'this.selected[i]');
                if(this.list_id_tries_mapping.indexOf(id2) == -1){
                    this.addTries(this.selected[i]);
                }
            }
            
            this.selected = [];
            document.getElementById("myFormTry").style.display = "none";
        }
    }

    getCities() {
        this.api.all('city').customGET('').subscribe(res => {
            this.cities = res.result;
        });
    }

    getFields() {
        this.api.all('getAllField').customGET('').subscribe(res => {
            this.fields = res.result;
        });
    }
    changeCity(event) {
        this.city_name = event.name;
        if(this.shop.city_id){
            this.api.all('state/'+this.shop.city_id).customGET('').subscribe(res => {
                this.states = res.result;
            });
        }else{
            this.states = [];
        }
        
    }
    changeWard(event) {
        this.ward_name = event.name;
        
    }
    changeStreet(event) {
        this.street_name = event.name;
        
    }
    changeDistrict(event) {
        this.state_name = event.name;
        if(this.shop.district_id){
            this.api.all('ward/'+this.shop.district_id).customGET('').subscribe(res => {
                this.wards = res.result;
            });
        }else{
            this.wards = [];
        }
    }
    getStreet() {
        this.api.all('street').customGET('').subscribe(res => {
            this.streets = res.result;
        });
    }

    onSave() {
        this.isSubmitted = true;
        if (this.cover_image !== '') {
            this.shop.cover_image = this.cover_image;
        }
        this.images.onSave((rs) => {
            this.shop.images = rs.images;
            this.onSaveCallback();
        });
    }

    onSaveCallback() {

        if (this.shopId) {
            this.shop.content_tries_id = this.list_id_tries_mapping;
            this.api
                .one('shop', this.shopId)
                .customPUT(this.shop)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Update shop successfully');
                        this.router.navigate(['/admin/shops']);
                    }
                });
        } else {
            this.shop.content_tries_id = this.try_id_mapping;
            this.api
                .all('shop')
                .customPOST(this.shop)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Add shop successfully');
                        this.router.navigate(['/admin/shops']);
                    }
                });
        }
    }

    fileChangeEvent(event: any, type): void {
        this.type = type;
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = this.handleImageResult.bind(this);
            reader.readAsDataURL(file);
        }
    }

    handleImageResult(readerEvt) {
        this.fileBase64 = readerEvt.target.result;
        this.api.all('uploads-shop').customPOST({file: this.fileBase64}).subscribe(res => {
            if (this.type === 1) {
                this.cover_image = res.result.name;
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/admin/shops']);
    }

    openFormTry() {
        document.getElementById("myFormTry").style.display = "block";
    }
    closeFormTry() {
        document.getElementById("myFormTry").style.display = "none";
    }

    getTries() {
        this.api.all('try-list').customGET('', {
            page: this.pageIndexTry, pageSize: this.pageSize, column: this.column, sort: this.sort
        }).subscribe(res => {
            this.try = res.result.data;
            this.totalTry = res.result.total;
        });
    }
    setPageTry(pageInfo) {
        this.pageIndexTry = pageInfo.offset + 1;
        this.getTries();
    }
    onSortTry(event) {
        this.column = event.sorts[0].prop;
        this.sort = event.sorts[0].dir;
        this.pageIndexTry = 1;
        this.getTries();
        return false;
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getTries();
    }
    
    onSelect({selected}) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
    }
    onDelete(rows){
        console.log(rows[0]);
        const index = this.tries_mapping.indexOf(rows[0]);
        console.log(index,'index');
        if (index > -1) {
            this.tries_mapping.splice(index,1);
            this.list_id_tries_mapping.splice(index,1);
        }
        console.log(this.tries_mapping,'this.tries_mapping');
        console.log(this.list_id_tries_mapping,'this.list_id_tries_mapping');
        
    }
    getBrands() {
        this.api.all('brands/getAll').customGET('').subscribe(res => {
            if (res.result) {
                this.brands = res.result;
            }
        });
    }
    
    setPage(pageInfo) {
        console.log(pageInfo);
        this.pageIndexTry = pageInfo.offset + 1;
        this.api.all('try-list-shop').customGET('', { page: this.pageIndexTry, pageSize: this.pageSize, column: this.column, sort: this.sort,
            brand_code: this.brand_id}).subscribe(res => {
            if (res.result) {
                this.tries_mapping = res.result.data;
                this.totalTryMapping = res.result.total;
                console.log(this.tries_mapping);
                console.log(this.totalTryMapping);
            }
        });
    }
    changeBrand(brand: any) {
        this.brand_id = brand.code
        this.api.all('try-list-shop').customGET('', { page: this.pageIndexTry, pageSize: this.pageSize, column: this.column, sort: this.sort,
            brand_code: this.brand_id}).subscribe(res => {
            if (res.result) {
                this.tries_mapping = res.result.data;
                this.totalTryMapping = res.result.total;
                console.log(this.tries_mapping);
                console.log(this.totalTryMapping);
            }
        });
        // console.log(this.list_id_tries_mapping,'this.list_id_tries_mapping');
        // for(var i=0;i<this.try.length;i++){
        //     if(this.try[i].brnd_code == brand.code) {
        //         this.list_tries.push(this.try[i])
        //     }
        // }
        // for(var i=0;i<this.list_tries.length;i++){
        //     const id2 = this.list_tries[i].cntnts_no;
        //     if(this.list_id_tries_mapping.indexOf(id2) == -1){
        //         this.addTries(this.list_tries[i]);
        //     }
        // }
        // this.list_tries = [];
        // this.tries_mapping = [];
        // this.list_id_tries_mapping = [];
    }

    changeCategory() {
      this.api.all('categories?category='+this.shop.category).customGET().subscribe(res => {
        if (res.result) {
          this.catalogs = res.result;
        }
      });
    }

    viewMap(){
        this.show_map = !this.show_map;
        this.content_map = this.sanitizer.bypassSecurityTrustResourceUrl("https://www.google.com/maps/embed/v1/place?key=AIzaSyDZVu_aG4XcvyifjRAYJu21fyOT4HWAZH8&q="+this.shop.address+", "+this.street_name+", "+this.ward_name+", "+this.state_name+", "+this.city_name);
        console.log('content_map',this.content_map);
    }

}
