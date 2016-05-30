/**
 * Created by Administrator on 2016/5/27.
 */
'use strict';

console.info('require page a');

require('commonCss');
require('../css/a.css');

require('zepto');
require('avalon');

var _ = require('lodash');

var logoImg = require('webpackLogo');
var $logo = $('<img />').attr('src', logoImg);

$('#logo').html($logo);

require.ensure([],function(){
   var ajax = require('./utils/ajax');
    var t = _.now();

    ajax.request({
        url: '/api/list',
        data: {
            offset: 0,
            limit: 5
        }
    }).done(function(data) {
        var template = require('../tmpl/list.tpl');
        var html = template({list: data || []});

        console.info('ajax took %d ms.', _.now() - t);

        $('#list').html(html);
    });
});