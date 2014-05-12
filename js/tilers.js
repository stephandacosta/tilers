
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

    console.log(data[0]);
    var $msnryContainer = $('<div id="container"</div>');
    Tilers.$container.append($msnryContainer);

    for (var i = 0 ; i < data.length ; i++){
      var $Item = $('<div class="item"></div>');

      // add image to list item
      var photo = data[i].image || data[i].thumb || data[i].profilePic;
      var $imgWrapper = $('<div class="imgWrapper">')
      .css('background-image','url(' + photo + ')');
      $Item.append($imgWrapper);

      // add contributor name to list item
      $Item.append($('<h4 class="caption">' + data[i].network + '</h4>'));

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
      // columnWidth: 100,
      itemSelector: '.item',
      gutter: 2,
      transitionDuration: '0.5s',
      isFitWidth: true

    });

    $('.item').mouseenter(function(element){
      // console.log(element);
      $(this).addClass('featured');
      // msnry.layout(); //uncomment to get layout recalculated
    });

    $('.item').mouseleave(function(element){
      $(this).removeClass('featured');
      // msnry.layout();  //uncomment to get layout recalculated
    });


    eventie.bind( container, 'click', function( event ) {
      var target = event.target;
      if ( !classie.has( target, 'imgWrapper' ) && !classie.has( target, 'caption' ) ) {
        return;
      }
      var itemElem = target.parentNode;
      classie.toggleClass( itemElem, 'is-expanded' );
      msnry.layout();
    });

  }

};