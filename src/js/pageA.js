/**
 * Created by Administrator on 2016/5/27.
 */
'use strict';

console.info('require page a');

require('commonCss');
require('../css/pageA.css');


//var _ = require('lodash');

var $ = require('zepto')
var avalon = require('avalon');

var logoImg = require('webpackLogo');
var $logo = $('<img />').attr('src', logoImg);

$('#logo').html($logo);
var stateList = avalon.define({
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
        }]
});

