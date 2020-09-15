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
    selector: 'app-admin-review-report',
    templateUrl: './review-report.component.html',
    styleUrls: [
        './review-report.component.scss'
    ]
})
export class AdminReviewReportComponent implements OnInit {
    public pageIndex: any;
    public pageSize: any;
    public reviews_report = [];
    public images = [];
    public totalReports: any;
    public env: any;
    public modalRef: BsModalRef;
    public selected = [];
    public users = [];
    public showDelete = false;
    public showDeactivate = false;
    public showActive = false;
    public showNormal = false;
    public showPopular = false;
    public showRestore = false;
    public column = 'review_no';
    public sort = 'desc';
    public auto_enable = false;
    public enable_log =  {
        content: ''
    };
    public logs: any;
    public pageIndexLog = 1;
    public pageSizeLog = 10;
    public totallogs = 0;
    public filter = {
        name: null,
        reg_name: null,
        is_disabled: 'null',
        type: 'null',
        category_id: 'null',
        from: null,
        to: null
    };
    public review_id: string;
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
        this.review_id = this.route.snapshot.paramMap.get('id');
        console.log(this.review_id);
        this.pageIndex = 1;
        this.pageSize = 10;
        this.column = 'review_no';
        this.sort = 'desc';
        this.getReviewsReport();
        this.getUsers();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];
        console.log(this.enable_log);
        
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getReviewsReport();

    }

    getReviewsReport() {
        this.api.all('reports-list').customGET('', {
            review_no: this.review_id,
            page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort
        }).subscribe(res => {
            this.reviews_report = res.result.data;
            this.totalReports = res.result.total;
            console.log(res.result);
        });
        
    }

    getUsers() {
        this.api.all('admin/users/get-list').customGET('').subscribe(res => {
            this.users = res.result;
        });
    }

    onToggle(toggle) {
        const array_id = JSON.parse("[" + this.review_id + "]");
        this.api.all('reviews').customPUT({ ids: array_id, toggle: toggle }, 'toggle').subscribe(res => {
            if (res.result) {
                if (toggle) {
                    this.toast.success('The review has been approve');
                } else {
                    this.toast.success('The review has been disapprove');
                }
                this.selected = [];
            }
        });
    }

    onDelete(rows) {
        const ids = _.map(rows, 'id');
        console.log(ids);
        this.api.all('del-report').customPOST({ id: ids }, '').subscribe(res => {
            if (res.result) {
                this.getReviewsReport();
                this.toast.success('The review has been deleted');
            }
        });
    }

    onSelect({ selected }) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        if (this.selected.length > 0) {
            this.showDelete = true;
            this.showRestore = true;

            let showDeactivate = true;
            let showActive = true;
            let showNormal = true;
            let showPopular = true;
            for (const item of this.selected) {
                if (item.expsr_at === 'N') {
                    showDeactivate = false;
                } else {
                    showActive = false;
                }
                if (!item.conts_seq) {
                    showNormal = false;
                } else {
                    showPopular = false;
                }
            }

            this.showDeactivate = showDeactivate;
            this.showActive = showActive;
            this.showNormal = showNormal;
            this.showPopular = showPopular;
        } else {
            this.showDeactivate = false;
            this.showActive = false;
            this.showDelete = false;
            this.showRestore = false;
            this.showNormal = false;
            this.showPopular = false;
        }
    }

    onDeleteMulti() {
        if (this.selected.length > 0) {
            this.onDelete(this.selected);
            this.showDeactivate = false;
            this.showActive = false;
            this.showDelete = false;
            this.showRestore = false;
            this.showNormal = false;
            this.showPopular = false;
        }
    }


    onSearch() {
        this.getReviewsReport();
    }

    onReset() {
        this.filter = {
            name: null,
            reg_name: null,
            is_disabled: 'null',
            type: 'null',
            category_id: 'null',
            from: null,
            to: null
        };
    }

    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getReviewsReport();
    }

}
