import { Component, OnInit, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { CookieService } from '../../../services/cookie.service';
// import * as _ from 'lodash';
import { environment } from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { formatDate } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AdminReviewDetailsComponent } from '../review-detail/review-details.component';

@Component({
    selector: 'app-admin-voucher-images',
    templateUrl: './voucher-images.component.html',
    styleUrls: [
        './voucher-images.component.scss'
    ]
})
export class AdminVoucherImagesComponent implements OnInit {
    public pageIndex: any;
    public pageSize: any;
    public vouchers = [];
    public images = [];
    public totalReviews: any;
    public env: any;
    public modalRef: BsModalRef;
    public selected = [];
    public categories = [];
    public users = [];
    public column = 'review_no';
    public sort = 'desc';
    public auto_enable = false;
    public enable_log =  {
        content: ''
    };
    public fashion: any;
    public beauty: any;
    public food: any;
    public pageIndexLog = 1;
    public pageSizeLog = 10;
    public totallogs = 0;
    public filter = {
        partner_name: null,
        category: 'null',
        from: null,
        to: null,
        catalog:  'null',
        reg_name: null,
        status: null
    };
    public tryId: string;
    public pageLimitOptions = [];
    constructor(
        private api: Restangular,
        private toast: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
        public modalService: BsModalService
    ) { }

    ngOnInit() {
        this.env = environment;
        this.pageIndex = 1;
        this.pageSize = 10;
        this.getVoucher();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];
        
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getVoucher();

    }

    getVoucher() {

        this.api.all('voucher-image').customGET('', {
            page: this.pageIndex, pageSize: this.pageSize, partner_name: this.filter.partner_name,
        }).subscribe(res => {
            this.vouchers = res.result.data;
            console.log(this.vouchers);
            this.totalReviews = res.result.total;
            // for (let i = 0; i < this.questions.length; i++) {
            //     this.questions[i].view_cnt = parseInt(this.questions[i].view_cnt);
            // }
        });
        
    }

    onSearch() {
        this.getVoucher();
    }

    onReset() {
        // this.filter = {
        //     name: null,
        //     category: 'null',
        //     catalog: 'null',
        //     from: null,
        //     to: null,
        //     reg_name: null,
        //     status: null
        // };
        // this.getQuestions();
    }

    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getVoucher();
    }





}
