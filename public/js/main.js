/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Developer Acvocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

import { bcUserMe,initBCTree } from './bidpackage.js';
 

$(document).ready(function () 
{ 
    $('#autodeskSigninButton').click(function () {
        $.ajax({
            url: '/aps/auth/login',
            success: function (url) {
                location.href = url;
            }
        });
    }) 
    //init login logout etc
    init()
});

async function init() {
    const hasToken = await getToken()
    if (hasToken) {
        // yes, it is signed in...
        $('#autodeskSignOutButton').show();
        $('#autodeskSigninButton').hide();
        $('#refreshSourceHubs').show();
        // prepare sign out
        $('#autodeskSignOutButton').click(function () {
            $('#hiddenFrame').on('load', function (event) {
                location.href = '/aps/auth/signout';
            });
            $('#hiddenFrame').attr('src', 'https://accounts.autodesk.com/Authentication/LogOut');
        })
        // and refresh button
        $('#refreshBids').click(function () {
            var bcTree = $('#bcTree').jstree(true);
            if (bcTree)
                bcTree.refresh();
        });

        const profile = await userProfile();
        const userMe = await bcUserMe(); 
        $('#bcUserId').text(userMe.id);

        const img = '<img src="' + profile.picture + '" height="20px">';
        $('#userInfo').html(img + profile.name);

        initBCTree();

    } else {
        $('#autodeskSignOutButton').hide();
        $('#autodeskSigninButton').show();
    }
}

async function getToken() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/aps/auth/token',
            success: function (res) {
                resolve(true)
            },
            error: function (err) {
                resolve(false)
            }
        })
    })
}

async function userProfile() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/aps/user/profile',
            success: function (profile) {
                resolve(profile)
            }
        });
    })
}
  

 

