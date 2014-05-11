/*
<div id="container">
  <div class="item">...</div>
  <div class="item w2">...</div>
  <div class="item">...</div>
  ...
</div>
*/


var Tilers = {

  $container: $("body"),
  imgBaseWidth:100,
 

  init: function($container){
    console.log('creating flying images');
    Tilers.$container = $container;
    sentimentHub.on('Data', Tilers.onData);
    sentimentHub.on('Done', Tilers.onDataDone);
    sentimentHub.fetch();
  },

  // Triggered when data for a particular network is available
  onData: function(network, data){

  },

  // Triggered when we are done fetching data
  onDataDone: function(data){
    Tilers.drawTilers(data);
  },

  playIfShared: function(item){
  //  uncomment to allow video popup play
  //   var contentId = $.cookie("vgvidid");
  //   if (contentId && item.id == contentId){
  //     ga_events.sboxShareReferral(item.network, item.id);
  //     if (item.type != 'video'){
  //       player.hidePlayerMessage();
  //       player.play(item);
  //       ga_events.shareReferral('content:'+item.network, item.id);
  //       $.cookie("vgvidid", '', {
  //         expires: 0,
  //         domain: cookieDomain,
  //         path: '/'
  //       });
  //     }
  //   }
  },

  // draw the items as desired
  drawItem: function(network, item){
    console.log(item);
  },


  drawTilers : function (data){
    console.log('Tilers function');
    
    var $msnryContainer = $('<div id="container"</div>');
    Tilers.$container.append($msnryContainer);




    for (var i = 0 ; i < data.length ; i++){

      var $Item = $('<div class="item"></div>')

      // add image to list item
      var photo = data[i].image || data[i].thumb || data[i].profilePic;

      var $imgWrapper = $('<div class="imgWrapper">')
          .css('background-image','url(' + photo + ')');
      $Item.append($imgWrapper);

      // // add contributor name to list item
      // $Item.append($('<h4>' + data[i].contribName + '</h4>'));

      // // add text to list item
      // $Item.append($('<div class="info text"></div>')
      // .append(data[i].textHtml));

      // add list item to unsorted list
      $msnryContainer.append($Item);

    }

    // add list to container
    var container = document.querySelector('#container');
    var msnry = new Masonry( container, {
      // options
      columnWidth: 50,
      itemSelector: '.item'
    });
    // var elements = document.getElementsByClassName('item');
    //   msnry.appended( elements );
    //   msnry.layout();

    // $container.masonry( 'appended', elements );

    eventie.bind( container, 'click', function( event ) {
    // don't proceed if item content was not clicked on
    var target = event.target;
    if ( !classie.has( target, 'imgWrapper' )  ) {
      return;
    }
    var itemElem = target.parentNode;
    classie.toggleClass( itemElem, 'is-expanded' );

    msnry.layout();
  });
  

    console.log('ok');

  }



};