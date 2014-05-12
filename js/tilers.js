
var Tilers = {

  $container: $("body"),
  imgBaseWidth:100,
 

  init: function($container){
    console.log('creating flying images');
    Tilers.$container = $container;
    var $msnryContainer = $('<div id="container"</div>');
    Tilers.$container.append($msnryContainer);
    Tilers.initMasonry();
    sentimentHub.on('Data', Tilers.onData);
    sentimentHub.on('Done', Tilers.onDataDone);
    sentimentHub.fetch();
  },

  // Triggered when data for a particular network is available
  onData: function(network, data){
    $.each(data, function(key, item){
      Tilers.drawItem(network, item);

      // let the library know we have used this item
      sentimentHub.markDataItemAsUsed(item);

      // Tilers.playIfShared(item);
    });
    Tilers.msnry.layout();




  },


  // Triggered when we are done fetching data
  onDataDone: function(data){
    // Tilers.drawTilers(data);
    // Tilers.initMasonry();
    // Tilers.enableHovering($('.item'));
    // Tilers.enableClick($('.item'));
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
  drawItem: function(network, item, msnry){
    // console.log(item);
    var $Item = $('<div class="item"></div>');

    var itemType = {
      VGVideo: 'vid',
      Photo: 'pic',
      Twitter: 'pic',
      Instagram: 'pic',
      Youtube: 'vid'
    };
    
    $Item.addClass(itemType[item.network]);
    // add image to list item
    var photo = item.image || item.thumb || item.profilePic;
    var $imgWrapper = $('<div class="imgWrapper">')
    .css('background-image','url(' + photo + ')');
    $Item.append($imgWrapper);

    // add contributor name to list item
    $Item.append($('<h4 class="caption">' + item.network + '</h4>'));

    // add text to list item
    $Item.append($('<div class="info text"></div>')
    .append(item.textHtml));
    console.log('length: ', item.textHtml.length);
    console.log('text:', item.textHtml);
    if(item.textHtml.length > 180){
      console.log('class added');
      $Item.addClass('largeText');
    }

        // add video placeholder to list item
    $Item.append($('<div class="viddiv text"></div>'));

        // add list item to unsorted list
    // this can be optimized by appending in batch
    // var items = document.getElementsByClassName($Items.get());
    // $('#container').msnry( 'appended', $Item.get());
    $('#container').append($Item);

    Tilers.msnry.appended($Item.get());

       
    Tilers.enableHovering($Item);

    Tilers.enableClick($Item);



  },


  drawTilers : function (data){
    // console.log('Tilers function');

    // console.log(data[0]);
    // var $msnryContainer = $('<div id="container"</div>');
    // Tilers.$container.append($msnryContainer);

    // for (var i = 0 ; i < data.length ; i++){
    //   var $Item = $('<div class="item"></div>');

    //   // add image to list item
    //   var photo = data[i].image || data[i].thumb || data[i].profilePic;
    //   var $imgWrapper = $('<div class="imgWrapper">')
    //   .css('background-image','url(' + photo + ')');
    //   $Item.append($imgWrapper);

    //   // add contributor name to list item
    //   $Item.append($('<h4 class="caption">' + data[i].network + '</h4>'));

    //   // // add text to list item
    //   // $Item.append($('<div class="info text"></div>')
    //   // .append(data[i].textHtml));


    //   // add list item to unsorted list
    //   $msnryContainer.append($Item);

    //   // Tilers.enableHovering($Item);

    //   // Tilers.enableClick($Item);

    // }


  },

  initMasonry: function(){
    console.log('initiated');
    // add list to container
    var container = document.querySelector('#container');
    Tilers.msnry = new Masonry( container, {
      // options
      // columnWidth: 100,
      itemSelector: '.item',
      gutter: 2,
      transitionDuration: '0.5s',
      isFitWidth: true

    });
            console.log('log1',Tilers.msnry);
  },


  enableHovering : function($elem){
    $elem.mouseenter(function(){
      $(this).addClass('featured');
      // Tilers.msnry.layout(); //uncomment to get layout recalculated
    });
    $elem.mouseleave(function(){
      $(this).removeClass('featured');
      // Tilers.msnry.layout();  //uncomment to get layout recalculated
    });
  },

  enableClick : function ($elem){
    $elem.click( function() {
      $(this).toggleClass('is-expanded');
      Tilers.msnry.layout();
      // console.log('probably layedout');
    });
  }


};
