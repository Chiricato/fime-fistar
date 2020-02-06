import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import * as _ from 'lodash';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {formatDate} from '@angular/common';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-admin-tips',
    templateUrl: './tips.component.html',
    styleUrls: [
        './tips.component.scss'
    ]
})
export class AdminTipsComponent implements OnInit {
    public tips = [];
    public env: any;
    public total: any;
    public filter = {
        name: null,
        display_yn: 'null',
        main_open_yn: 'null',
        from: null,
        to: null
    };
    public column = 'ti_id';
    public sort = 'desc';
    public pageIndex = 1;
    public pageSize = 10;
    public selected = [];
    public showDelete = false;
    public showDeactivate = false;
    public showActive = false;
    public category_type: any;
    constructor(
        private api: Restangular,
        private toast: ToastrService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.env = environment;
        this.pageIndex = 1;
        this.pageSize = 10;
        this.getTips();
    }

    getTips() {
        this.api.all('tip-list').customGET('',
            {
                page: this.pageIndex, pageSize: this.pageSize,
                name: this.filter.name, display_yn: this.filter.display_yn, main_open_yn: this.filter.main_open_yn
            }).subscribe(res => {
                if(res.result)
                {
                    this.tips = res.result.data;
                    this.total = res.result.total;
                }
        });
    }

    onSearch() {
        this.pageIndex = 1;
        this.getTips();
    }

    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getTips();
    }

    onSort(event) {
        this.column = event.sorts[0].prop;
        this.sort = event.sorts[0].dir;
        this.pageIndex = 1;
        this.getTips();
        return false;
    }

    onSelect({selected}) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        if (this.selected.length > 0) {
            this.showDelete = true;

            let showDeactivate = true;
            let showActive = true;
            for (const item of this.selected) {
                if (item.is_disabled === 'Y') {
                    showActive = false;
                } else {
                    showDeactivate = false;
                }
            }

            this.showDeactivate = showDeactivate;
            this.showActive = showActive;
        } else {
            this.showDeactivate = false;
            this.showActive = false;
            this.showDelete = false;
        }
    }

    onReset() {
        this.filter = {
            name: null,
            display_yn: 'null',
            main_open_yn: 'null',
            from: null,
            to: null
        };

        this.getTips();
    }

    openTipsDetail(url) {
        window.open(url);
    }

    onToggle(rows, toggle) {
        const id = _.map(rows, 'ti_id');

        this.api.all('tips').customPUT({id: id, toggle: toggle}, 'toggle').subscribe(res => {
            if (res.result) {
                for (const row of rows) {
                    row.display_yn = toggle ? 'Y' : 'N';
                }

                if (toggle) {
                    this.toast.success('The tip has been disabled');
                } else {
                    this.toast.success('The tip has been enabled');
                }
                // this.selected = [];
            }
        });
    }

    onDelete(rows) {
        const ids = _.map(rows, 'ti_id');

        this.api.all('tips').customPOST({ids: ids}, 'deleteMulti').subscribe(res => {
            if (res.result) {
                this.getTips();
                this.toast.success('The tip has been deleted');
            }
        });
    }

    onDeleteMulti() {
        if (this.selected.length > 0) {
            this.onDelete(this.selected);
        }
    }
}
