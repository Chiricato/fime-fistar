import {
    Component,
    OnInit,
    Inject,
    PLATFORM_ID
} from '@angular/core';

import {Restangular} from 'ngx-restangular';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import * as _ from 'lodash';
import {CookieService} from '../../../services/cookie.service';
import {environment} from '../../../environments/environment';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import * as moment from 'moment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import {FileUploader} from 'ng2-file-upload';

const URL = environment.host;

@Component({
    selector: 'app-admin-tip',
    templateUrl: './tip-details.component.html',
    styleUrls: ['./tip-details.component.scss']
})
export class AdminTipDetailsComponent implements OnInit {

    public message: string;
    public env: any;
    public form: any;
    public tipId: any;
    public tip: any;
    public brands = [];
    public invalidMainImage = false;
    public invalidImages = false;
    public isSubmitted = false;
    public output_category = '407';
    public tips_category = [];
    public modalRef: BsModalRef;
    public reviews: any;
    public reviews_mapping = [];
    public tries_mapping = [];
    public pageIndex: any;
    public pageIndexTry: any;
    public pageSize: any;
    public column = 'review_no';
    public sort = 'desc';
    public pageLimitOptions = [];
    public totalReviews: any;
    public totalReviewsMapping: any;
    public totalTryMapping: any;
    public selected = [];
    public review_detail:any;
    public tries_list:any;
    public review_id_mapping = [];
    public try_id_mapping = [];
    public ids: any;
    public try: any;
    public totalTry: any;
    public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'tip'});
    public uploaderInactive: FileUploader = new FileUploader({url: URL, itemAlias: 'tip'});
    public imageChangedEvent: any;
    public fileBase64: any;
    public type = 0;
    public cover_image1 = '';
    public cover_image2 = '';
    public cover_image3 = '';
    public cover_image4 = '';
    public photo_content1 = '';
    public photo_content2 = '';
    public list_reviews_mapping = [];
    public list_tries_mapping = [];
    public list_id_reviews_mapping = [];
    public list_id_tries_mapping = [];
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(
        private api: Restangular,
        private cookieService: CookieService,
        private router: Router,
        public activeRoute: ActivatedRoute,
        private toast: ToastrService,
        public modalService: BsModalService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.env = environment;

        this.activeRoute.params.forEach((params: Params) => {
            this.tipId = params['id'];
        });
        this.tip = {

        };
        if (this.tipId) {
            this.getTip();
            this.getReviewMapping();
            this.getTryMapping();
        }
        this.pageIndex = 1;
        this.pageIndexTry = 1;
        this.pageSize = 10;
        this.column = 'review_no';
        this.sort = 'desc';
        this.getReviews();
        this.getTries();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];
        this.getBrands();
        this.getTipCategory();
        this.form = new FormGroup({
            name: new FormControl(this.tip.subject,[Validators.required]),
            display_yn: new FormControl(this.tip.display_yn, [Validators.required]),
            push_send_yn: new FormControl(this.tip.push_send_yn, [Validators.required]),
            cover_img1: new FormControl(this.tip.cover_img1, []),
            cover_img2: new FormControl(this.tip.cover_img2, []),
            cover_img3: new FormControl(this.tip.cover_img3, []),
            cover_img4: new FormControl(this.tip.cover_img4, []),
            tips_desc_head: new FormControl(this.tip.tips_desc_head, []),
            tips_desc_body: new FormControl(this.tip.tips_desc_body, []),
            cont1_type: new FormControl(this.tip.cont1_type, []),
            cont2_type: new FormControl(this.tip.cont2_type, []),
            caption_text: new FormControl(this.tip.caption_text, []),
            source_site_name: new FormControl(this.tip.source_site_name, []),
            source_site_url: new FormControl(this.tip.source_site_url, []),
            cont1_head: new FormControl(this.tip.cont1_head, []),
            cont1_body: new FormControl(this.tip.cont1_body, [Validators.required]),
            code_brand: new FormControl(this.tip.code_brand, [Validators.required]),
            cont2_head: new FormControl(this.tip.cont2_head, []),
            caption_text2: new FormControl(this.tip.caption_text2, []),
            source_site_name2: new FormControl(this.tip.source_site_name2, []),
            source_site_url2: new FormControl(this.tip.source_site_url2, []),
            cont2_body: new FormControl(this.tip.cont2_body, []),
            tips_cl_code: new FormControl(this.tip.tips_cl_code, [Validators.required]),
            content_id: new FormControl(this.tip.content_id),
            cont1_photo: new FormControl(this.tip.cont1_photo, []),
            cont2_photo: new FormControl(this.tip.cont2_photo, []),
            cont1_link_url: new FormControl(this.tip.cont1_link_url),
            cont2_link_url: new FormControl(this.tip.cont2_link_url),
            
        });
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        this.uploaderInactive.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        if (this.tipId) {
            
        }
        this.tip.display_yn = this.tip.display_yn ? this.tip.display_yn : "Y";
        this.tip.push_send_yn = this.tip.push_send_yn ? this.tip.push_send_yn : "N";
        this.tip.cont1_type = this.tip.cont1_type ? this.tip.cont1_type : "P";
        this.tip.cont2_type = this.tip.cont2_type ? this.tip.cont2_type : "P";
    }

    getTip() {
        this.api.one('tips', this.tipId).get()
            .subscribe(res => {
                    this.tip = res.result;
                    this.cover_image1 = this.tip.cover_img1;
                    this.cover_image2 = this.tip.cover_img2;
                    this.cover_image3 = this.tip.cover_img3;
                    this.cover_image4 = this.tip.cover_img4;
                    this.photo_content1 = this.tip.cont1_photo;
                    this.photo_content2 = this.tip.cont2_photo;
                    this.list_id_reviews_mapping = this.tip.tipsReviews;
                    this.list_id_tries_mapping = this.tip.tipsTries;
            });
    }
    getReviewMapping() {
        this.api.one('GetReviewsTipMapping', this.tipId).get()
            .subscribe(res => {
                    this.list_reviews_mapping = res.result;
                    this.reviews_mapping = this.list_reviews_mapping;
            });
    }
    getTryMapping() {
        this.api.one('GetTryTipMapping', this.tipId).get()
            .subscribe(res => {
                    this.list_tries_mapping = res.result;
                    this.tries_mapping = this.list_tries_mapping;
            });
    }
    getBrands() {
        this.api.all('brands').customGET('').subscribe(res => {
            this.brands = _.sortBy(res.result, 'code_nm');
        });
    }
    getTipCategory() {
        this.api.all('tips-catalog').customGET('').subscribe(res => {
            this.tips_category = _.sortBy(res.result, 'code_nm');
        });
    }

    addReviews(rows){
        const id = _.map(rows, 'review_no');
        this.api.one('reviews',id).get().subscribe(res => {
            if (res.result) {
                this.review_detail = res.result;
                this.reviews_mapping.push(this.review_detail);
                this.review_id_mapping.push(this.review_detail.review_no);
                this.list_id_reviews_mapping.push(this.review_detail.review_no);
                this.totalReviewsMapping = this.reviews_mapping.length;
            }
        });
    }

    addTries(rows){
        const id = _.map(rows, 'cntnts_no');
        this.api.one('GetTryById',id).get().subscribe(res => {
            if (res.result) {
                this.tries_list = res.result;
                this.tries_mapping.push(this.tries_list);
                this.try_id_mapping.push(this.tries_list.cntnts_no);
                this.list_id_tries_mapping.push(this.tries_list.cntnts_no);
                this.totalTryMapping = this.tries_mapping.length;
            }
        });
    }

    AddReviewsMulti() {
        if (this.selected.length > 0) {
            this.addReviews(this.selected);
            this.selected = [];
            document.getElementById("myForm").style.display = "none";
        }
    }
    AddTriesMulti() {
        if (this.selected.length > 0) {
            this.addTries(this.selected);
            this.selected = [];
            document.getElementById("myFormTry").style.display = "none";
        }
    }

    onDelete(rows){
        this.tries_mapping.splice(rows,1);
        this.list_id_reviews_mapping.splice(rows.content_id,1);
    }
    onDeleteReview(rows){
        this.reviews_mapping.splice(rows,1);
        this.list_id_reviews_mapping.splice(rows.content_id,1);
    }

    onSave() {
        this.isSubmitted = true;
        if (this.cover_image1 !== '') {
            this.tip.cover_img1 = this.cover_image1;
        }
        if (this.cover_image2 !== '') {
            this.tip.cover_img2 = this.cover_image2;
        }
        if (this.cover_image3 !== '') {
            this.tip.cover_img3 = this.cover_image3;
        }
        if (this.cover_image4 !== '') {
            this.tip.cover_img4 = this.cover_image4;
        }
        if (this.photo_content1 !== '') {
            this.tip.cont1_photo = this.photo_content1;
        }
        if (this.photo_content2 !== '') {
            this.tip.cont2_photo = this.photo_content2;
        }
        this.onSaveCallback();
    }

    onSaveCallback() {

        if (this.tipId) {
            this.tip.content_id = this.list_id_reviews_mapping;
            this.tip.content_tries_id = this.list_id_tries_mapping;
            
            this.api
                .one('tips-edit', this.tipId)
                .customPUT(this.tip)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Update tip successfully');
                        this.router.navigate(['/admin/tips']);
                    }
                });
        } else {
            this.tip.content_id = this.review_id_mapping;
            this.tip.content_tries_id = this.try_id_mapping;
            this.api
                .all('add-tips')
                .customPOST(this.tip)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Add tip successfully');
                        this.router.navigate(['/admin/tips']);
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
        this.api.all('uploads-tips').customPOST({file: this.fileBase64}).subscribe(res => {
            if (this.type === 1) {
                this.cover_image1 = res.result.name;
            } 
            else if(this.type === 2) {
                this.cover_image2 = res.result.name;
            }
            else if(this.type === 3) {
                this.cover_image3 = res.result.name;
            }
            else if(this.type === 4) {
                this.cover_image4 = res.result.name;
            }
            else if(this.type === 5) {
                this.photo_content1 = res.result.name;
            }
            else if(this.type === 6) {
                this.photo_content2 = res.result.name;
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/admin/tips']);
    }

    openForm() {
        document.getElementById("myForm").style.display = "block";
    }

    openFormTry() {
        document.getElementById("myFormTry").style.display = "block";
    }

    closeForm() {
        document.getElementById("myForm").style.display = "none";
    }
    closeFormTry() {
        document.getElementById("myFormTry").style.display = "none";
    }

    getReviews() {
        this.api.all('GetListReview').customGET('', {
            page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
        }).subscribe(res => {
            this.reviews = res.result.data;
            this.totalReviews = res.result.total;
        });
    }

    getTries() {
        this.api.all('try-list').customGET('', {
            page: this.pageIndexTry, pageSize: this.pageSize, column: this.column, sort: this.sort,
        }).subscribe(res => {
            this.try = res.result.data;
            this.totalTry = res.result.total;
        });
    }
    
    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getReviews();
    }
    setPageTry(pageInfo) {
        this.pageIndexTry = pageInfo.offset + 1;
        this.getTries();
    }

    onSort(event) {
        this.column = event.sorts[0].prop;
        this.sort = event.sorts[0].dir;
        this.pageIndex = 1;
        this.getReviews();
        return false;
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
        this.getReviews();
        this.getTries();
    }
    
    onSelect({selected}) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
    }

    

}