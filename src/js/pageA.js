/**
 * Created by Administrator on 2016/5/27.
 */
'use strict';

console.info('require page a');

require('commonCss');
require('../css/pageA.css');
var avalon = require("avalon");

var _ = require('lodash');

var logoImg = require('webpackLogo');
var $logo = $('<img />').attr('src', logoImg);

$('#logo').html($logo);
var stateList = avalon.define({    //×´Ì¬ÅÐ¶Ï
    $id: 'listCtrl',
    listData: [{
        id: 1,
        title: 'foo',
        content: 'content foo'
    },
        {
            id: 2,
            title: 'title bar',
            content: 'content bar'
        }],
    getData: function (n) {
        /*var ajax = require('./utils/ajax');
        var t = _.now();

        ajax.request({
            url: '/api/list',
            data: {
                offset: 0,
                limit: 5
            }
        }).done(function (data) {
            stateList.listData = data;
        });*/

    }
});

