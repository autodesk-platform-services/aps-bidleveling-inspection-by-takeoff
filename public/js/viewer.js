
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

export var viewer; 

// @urn the model to show
// @viewablesId which viewables to show, applies to BIM 360 Plans folder
export function launchViewer(urn, viewableId) {
  var options = {
    env: 'AutodeskProduction2',
    api:"streamingV2",
    getAccessToken: getAPSToken
  };

  Autodesk.Viewing.Initializer(options, () => {
    document.getElementById('apsViewer').innerHTML="";
    viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('apsViewer'));
    viewer.start();
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
    $('.adsk-viewing-viewer').css({ "height": '50%' })

  });

  function onDocumentLoadSuccess(doc) {
    // if a viewableId was specified, load that view, otherwise the default view
    var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
    viewer.loadDocumentNode(doc, viewables).then(async i => {
      // any additional action here?
      await Autodesk.Viewing.EventUtils.waitUntilGeometryLoaded(viewer);
         highlightTakeoffItems()
    });
  } 

  function onDocumentLoadFailure(viewerErrorCode, viewerErrorMsg) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode + '\n- errorMessage:' + viewerErrorMsg);
  }
} 

//highlight the take off items
export function highlightTakeoffItems(ids,color){
  if (ids.length > 0) {
    viewer.clearThemingColors(viewer.model);
    viewer.showAll() 
    viewer.isolate(ids);
    viewer.fitToView(ids);
    const rbg = color.replace('#','').match(/.{1,2}/g);    
    const viewColor = new THREE.Vector4(parseInt(rbg[0], 16)/255, parseInt(rbg[1], 16)/255, parseInt(rbg[2], 16)/255, 1)
    ids.forEach(svf2Id => {
      viewer.setThemingColor(svf2Id, viewColor) 
    }); 
  }
}
 
 
async function getAPSToken(callback) {
  try {
      const resp = await fetch('/aps/auth/token');
      if (!resp.ok) {
          throw new Error(await resp.text());
      }
      const { access_token, expires_in } = await resp.json();
      callback(access_token, expires_in);
  } catch (err) {
      alert('Could not obtain access token. See the console for more details.');
      console.error(err);
  }
} 