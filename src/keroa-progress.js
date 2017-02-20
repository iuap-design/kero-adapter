/**
 * Module : Kero percent
 * Author : Kvkens(yueming@yonyou.com)
 * Date	  : 2016-08-09 20:02:50
 */

import {BaseAdapter} from './keroa-baseAdapter';
import {Progress} from 'tinper-neoui/src/neoui-progress';
import {compMgr} from 'compox/src/compMgr';

var ProgressAdapter = BaseAdapter.extend({
    init: function () {
        var self = this;

        this.comp = new Progress(this.element);
        this.element['u.Progress'] = this.comp;

        this.dataModel.ref(this.field).subscribe(function(value) {
        	self.modelValueChange(value)
        })
    },

    modelValueChange: function (val) {
        this.comp.setProgress(val)
    }
})


compMgr.addDataAdapter({
	adapter: ProgressAdapter,
	name: 'u-progress'
});

export {ProgressAdapter};