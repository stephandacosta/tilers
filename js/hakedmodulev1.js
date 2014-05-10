// VG stuff
var fbPerms;
var langOverrides = null;
var isiDevice = /iPad|iPhone|iPod/i.test(navigator.userAgent);
var isAndroid = /Android/i.test(navigator.userAgent);
var isWinRT = /windows nt.+ARM/i.test(navigator.userAgent);

// Window Event Handler Object (jQuer-less solution).
var JSEvents = {
    on: function(eventName, eventHandler, target){
        target = target || window;
        if (target['addEventListener']) target.addEventListener(eventName, eventHandler, false);
        else if (target['attachEvent']) target.attachEvent('on'+eventName, eventHandler);
        else target['on' + eventHandler] = null;
    },
    off: function(eventName, eventHandler, target){
        target = target || window;
        if (target['removeEventListener']) target.removeEventListener(eventName, eventHandler, false);
        else if (target['detachEvent']) target.detachEvent('on'+eventName, eventHandler);
        else target['on' + eventName] = eventHandler;
    }
}

// Iframe Messaging Object.
var IM = {
    _id: moduleUid,
    _msgQ: [],
    _canSend: false,
    _targetFrame: window.parent,
    enable: function(id) { 
        IM._id = id; 
        IM._canSend = true;
        while (IM._msgQ.length > 0) IM._broadcastMessage(IM._msgQ.shift());
    },
    _formatMsg: function (eventName) {
        var args = "";
        for (var argIdx = 1; argIdx < arguments.length; argIdx++){
            args += (argIdx>1?",":"") + encodeURIComponent(arguments[argIdx]);
        }
        return eventName+":"+args;
    },
    _broadcastMessage: function(msg){
        // if there is an _id, it will always be sent as the first paramter...
        if (IM._id){
            msg = msg.replace(":", ":"+IM._id+",");
        }
        IM._targetFrame.postMessage(msg, "*");
    },
    
    // send message regardless of the messaging statuses being enabled...
    broadcast: function(eventName, args){
        var msg = IM._formatMsg.apply(undefined, arguments);
        IM._broadcastMessage(msg);
    },
    
    // send a message only if messaging is enabled...
    send: function(eventName, args){
        var msg = IM._formatMsg.apply(undefined, arguments);
        if (!IM._canSend) { return false };
        IM._broadcastMessage(msg);
        return true;
    },
    
    // send a message as soon as the iframe is ready to send messages...
    sendWhenReady: function(eventName, args){
        var msg = IM._formatMsg.apply(undefined, arguments);
        if (IM._canSend) { 
            IM._broadcastMessage(msg);
            return true;
        }
        IM._msgQ.push(msg);
        return false;
    },
    
    // handle incoming messages...
    on: function(eventName, callback){
        var messageHandler = function(message){
            // match only on domain name
            if (message.origin.replace(/^[^:]*:?\/\/([^\/:]+).*/, '$1') == document.referrer.replace(/^[^:]*:?\/\/([^\/:]+).*/, '$1')){
                if (typeof(message.data) == 'string'){
                    if (message.data == eventName){
                        callback();
                    }else if(message.data.indexOf(eventName+':') == 0){ // if passing args after eventName:...
                        var args = message.data.substring(message.data.indexOf(':')+1).split(',');
                        for (var i=0; i < args.length; i++) args[i] = decodeURIComponent(args[i]);
                        callback.apply(undefined, args);
                    }
                }
            }
        }
        JSEvents.on('message', messageHandler);
    },

    // VG Specific Message Functions
    resizeIframe: function(width, height){
        IM.sendWhenReady("VGFrameResize", width, height);
    },
    iframeReady: function(){ IM.broadcast("VGIframeReady") },
    toggleFullscreen: function(fs) { IM.sendWhenReady("VGFullscreen", fs? "yes" : "") },
    scrollParentTo: function(x, y){ IM.sendWhenReady("VGScrollTo", x, y) },
    lockScroll: function(){ IM.sendWhenReady("VGScrollLock") },
    unlockScroll: function(){ IM.sendWhenReady("VGScrollUnlock") },
    openModal: function(url, target){
        return IM.send("VGOpenModal", url, target);
    },
    closeModal: function(target){
        // broadcasting (rather than send) since the popup iframe doesn't get initialized
        // by the same module server as the regular frame so it never receives the iframe ready...
        IM.broadcast("VGCloseModal", target);
    }
}


// *****
// Depricated function proxies. Only here for backward compatibility. Please use the functions from IM object.
// *****
function scrollParentTo(x, y) { IM.scrollParentTo(x, y); }
function resizeIframe(width, height) { IM.resizeIframe(width, height); }
function onMessage(eventName, callback) { IM.on(eventName, callback); }
function sendMessage(eventName, args) { IM.sendWhenReady(eventName, callback); }
// *****


function getVideoUid() {
    return typeof(player) != 'undefined' && player? player.getCurrentVideoUid() : 'not loaded';
}

function consoleLog(){
    for (var i = 0; i<arguments.length; i++){
        if (enableJSLog && typeof(console)!='undefined' && console.log){
            console.log(arguments[i]);
        }else{
            //debug(arguments[i]);
        }
    }
}

// For IE8 and earlier version.
if (!Date.now) {
  Date.now = function() {
    return new Date().valueOf();
  }
}

function getUrlParam(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function debug(s) {
    var debugJQ = $('#debug');
    if (debugJQ && debugJQ.length > 0) {
        debugJQ.append(debug_stringify(s) + "\n");
    }
}

function debug_stringify(s) {
    if (typeof(s) == 'string'){
        return s;
    } else {
        if (typeof(JSON)!='undefined' && JSON.stringify) {
            return JSON.stringify(s);
        } else if (s.toString) {
            return s.toString();
        } else {
            return '[object]';
        }
    }
}

function track_user(state) {
    FB.api("/me", function(response) {
        debug("FB /me: " + debug_stringify(response));
        if (response) {
            // add fb login event tracking here e.g. ga_events.fbLogin()...
        }
    });
}

function safeFBresize() {
    if (typeof(FB) != "undefined" && FB && FB.Canvas) {
        FB.Canvas.setSize();
    }
}

// Track facebook like.
function track_like(response) {
    debug("got an edge.create event with response: " + response);
    ga_events.videoFbLiked(getVideoUid());
}

// Track facebook unlike.
function track_unlike(response) {
    ga_events.videoFbUnLiked(getVideoUid());
}

// Track facebook share (it should be invoked by flowplayer).
function track_fb_shared(videoUid) {
    ga_events.videoFbShared(videoUid? videoUid : getVideoUid());
}

// Track twitter shared (it should be invoked by flowplayer).
function track_twitter_shared(videoUid) {
    ga_events.videoTwitted(videoUid? videoUid : getVideoUid());
}

// Track Google Plus Shared (it should be invoked by flowplayer).
function track_google_shared(videoUid) {
    ga_events.videoGoogleShared(videoUid? videoUid : getVideoUid());
}

// Track LinkedIn shared (it should be invoked by flowplayer).
function track_linkedin_shared(videoUid) {
    ga_events.videoEmailShared(videoUid? videoUid : getVideoUid());
}

// Track YouTube shared (it should be invoked by flowplayer).
function track_youtube_shared(videoUid) {
    ga_events.videoEmailShared(videoUid? videoUid : getVideoUid());
}

// Track shared in email (it should be invoked by flowplayer).
function track_email_shared(videoUid) {
    ga_events.videoEmailShared(videoUid? videoUid : getVideoUid());
}

function getStrings(string, defText) {
    // if this string is not defined in this language, try returning an English string
    if( xlat && lang in xlat && string in xlat[lang] ) {
        return xlat[lang][string];
    }
    return xlat["en"][string] || defText || "";
}

function populateStrings(rootNode) {
  var nodeSet = rootNode ? rootNode.find('*') : $('*');
  nodeSet.each(function(i,el){
    if( el.attributes ) {
      for( var k in el.attributes ) {
        var x = el.attributes[k];
        if( x && x.name && (x.name == 'vg:xlat' || x.name == 'vg:fxlat')) {
          var str = getStrings(x.value);
          var old = $(el).text();

          // don't override non-default strings if xlat
          if( str && (x.name == "vg:fxlat" || typeof(old) == "undefined" || !old || old.match(/^\s*$/) ) ) {
            if (el.tagName == "INPUT" && el.type == "submit") {
              $(el).attr('value', str);
            } else if(el.tagName == "INPUT" || el.tagName == "TEXTAREA") {
              $(el).attr('placeholder', str);
            } else {
              $(el).html(str);
            }
          }
          break;
        }
      }
    }
  });
}

function addEllipsis(textElements){
    // add ellipsis if needed to text...
    $(textElements).each(function(){
        if (this.scrollHeight > $(this).height()+5){
            var origVal = $(this).text();
            $(this).attr({title: origVal});
            
            var newVal = origVal;
            while (newVal && this.scrollHeight > $(this).height()+5){
                var lastSpace = newVal.lastIndexOf(' ') || newVal.length-2;
                newVal = newVal.substring(0, lastSpace);
                $(this).text(newVal);
                $(this).append('<span class="el">&hellip;</span>');
            }
        }
    });
}

function escapeAttrSelector(attrName){
    return attrName.replace(/'/g,"\\\'").replace(/([\:\~\!\@\$\%\^\&\*\(\)\+\|\/\.\,\;\?\>\<\:\=\[\]\{\} ])/g,"\\$1");
}

function translateShareText(text, clip, videoUrl){
    if (!clip){
        clip = {
          cnFirst: 'My',
          cnLast: 'Video',
          shareUrl: videoUrl || location.href
        };
    }

    clip['contributor'] = clip['contribName'] || (clip['cnFirst'] + (clip['cnLast']? ' ' + clip['cnLast'] : ''));
    clip['client'] = client_name;
    clip['campaign'] = campaign_title;
    clip['video_url'] = clip['shareUrl'];

    for(var i in clip){
        text = text.replace(new RegExp('{ *'+i+' *}'), clip[i]);
    }
    
    return text;
}

function getShareTitle(clip, videoUrl){
    var _shareTitle = shareTitle || '{contributor} on {client}';

    return translateShareText(_shareTitle, clip, videoUrl);
}

function getShareDesc(clip, videoUrl){
    var _shareDesc = shareDesc || prompt;

    return translateShareText(_shareDesc, clip, videoUrl);
}

function getRandomInt(min, max) {
    var randomInt = Math.floor((Math.random() * (max - min)) + min);
    return randomInt;
}

$.extend({
    adjustBrightness: function(col, amt) {
        var r, g, b, a, m;

        if (m=col.toString().match(/^#?(..)(..)(..)$/)){
            r=parseInt(m[1], 16); g=parseInt(m[2], 16); b=parseInt(m[3], 16);
        }else if (m=col.toString().match(/rgb[a]? *\( *(\d+) *, *(\d+) *, *(\d+)(?: *, *([.\d]+))? *\)/)){
            r=parseInt(m[1]); g=parseInt(m[2]); b=parseInt(m[3]);
            a=m[4];
        }else{r=g=b=0;}

        r=Math.max(0, Math.min(255, Math.round(r * amt)));
        g=Math.max(0, Math.min(255, Math.round(g * amt)));
        b=Math.max(0, Math.min(255, Math.round(b * amt)));
     
        return (a ? "rgba" : "rgb") + "(" + r + "," + g + "," + b + (a ? "," + a : "") + ")";
    },
    vgAjax: function(options){
        if (typeof vg_base_url != 'undefined' && !options.url.match(/(^|:)\/\//)) {
            options.url = vg_base_url.replace(/\/$/,'') + '/' + options.url.replace(/^\//,'');
            options.dataType = 'jsonp';
        }
        return $.ajax(options);
    }
});

$.fn.extend({
    applyHoverColor: function (per) {
        var orjCol = $(this).css('background-color');
        var adjCol = $.adjustBrightness(orjCol, per || .9);
        $(this).hover(function() {
            $(this).css('background-color', adjCol);
        }, function() {
            $(this).css('background-color', orjCol);
        });
        return this;
    },
    applyBorderColor: function (per) {
        var orjCol = $(this).css('background-color');
        var adjCol = $.adjustBrightness(orjCol, per || .9);
        $(this).css('border-color', adjCol);
        return this;
    }
});

$.extend({
    modalFrame: function(tabName) {
        var frameIdx = $("body").attr('modal-frame-id');
        var $body = $("body");
        if (frameIdx!==undefined && frameIdx>=0){
            try {
                var frame = window.parent.frames[frameIdx];
                $body = $(frame.document).find("body");
            }catch (exc) { }
        }
        var $modal = $body.find("#modalFrame");
        if ($modal.length<1) 
            $modal = $("<div id='modalFrame'></div>").hide().appendTo($body);
            
        if (tabName){
            var $target = $modal.find("."+tabName);
            if ($target.length<1) $target = $("<div>").addClass(tabName).hide().appendTo($modal);
            return $target;
        }
        return $modal.data({windowObject: frame});
    },
    modalFrameSize: function() {
        var width, height;
        if ($("body").attr('modal-frame-id')!==undefined){
            width = $("body").attr('screen-width');
            height = $("body").attr('screen-height');
        }
        return {w: width || $(window).width(), h: height || $(window).height()}
    },
    showModalFrame: function (tabName, callback) {
        var $modal = $.modalFrame();
        $modal.hide();
        if (tabName){
            $modal.find(">*").hide();
            $modal.find("."+tabName).show();            
        }
        if ($("body").attr('modal-frame-id')!==undefined) IM.send("VGToggleModalFrame", true);
        $modal.fadeIn('fast',callback);
    },
    hideModalFrame: function (tabName) {
        var $modal = $.modalFrame();
        $modal.hide();
        if (tabName) $modal.find("."+tabName).hide();
        if ($("body").attr('modal-frame-id')!==undefined) IM.send("VGToggleModalFrame", "");
    }
});

loadImage = function(imageUrl, callback, callbackParam) {
    $('<img>').load(function() {
        if (typeof(callback) == 'function') callback($(this).get(0), callbackParam);
    }).attr({ src: imageUrl });
};
fitSize = function(width, height, maxW, maxH){
    var rWidth = width, rHeight = height;
    if(rWidth > maxW) { rHeight = (height / width) * maxW; rWidth = maxW; }
    if(rHeight > maxH) { rWidth = width / height * maxH; rHeight = maxH; }
    return {w: rWidth, h: rHeight};
}

$(document).ready(function(){
    for(var k in $.browser){
        if ($.browser[k]){
            var cssClass = (k!='version'? k : 'v') + ($.browser[k]!=true? String($.browser[k]).replace(/[^\w\d-].*/,'') : '');
            if (cssClass) $("body").addClass(cssClass);
        }
    }
    if( langOverrides ) {
        for( var k in langOverrides ) {
            xlat[lang][k] = langOverrides[k];
        }
    }
    populateStrings();
    
    IM.on('screenSize', function(width, height){
        $("body").attr({
            'screen-width': width, 
            'screen-height': height
        });
        IM.enable(moduleUid);
    });
    IM.on('modalReady', function(modalIdx){
        $("body").attr({
            'modal-frame-id': modalIdx
        });
    })
    IM.on('execCmd', function(cmd) { eval(cmd) });
    setTimeout(IM.iframeReady, 100);
})

// Facebook stuff
// <![CDATA[
    window.fbAsyncInit = function() {
      FB._https = (window.location.protocol == "https:");
      FB.init({appId: fbAppId, status: true, cookie: true, xfbml: true});
      // force canvas_proxy.php to be downloaded over SSL
      if (window.location.protocol == "https:" && FB._domain && FB._domain.staticfb && FB._domain.https_staticfb) {
        FB._domain.staticfb = FB._domain.https_staticfb;
      }
      
      //FB.Canvas.setAutoResize();
      FB.Canvas.setSize();
      
      FB.Event.subscribe('auth.authResponseChange', function(response) {
        debug("Got FB auth.login event: "+ response.status + " : "+debug_stringify(response));
        if (response.status === 'connected' ) {
            if (typeof(processFbResponse) == 'function'){
                processFbResponse(response);
            }
        }
      });

      FB.Event.subscribe('edge.create', function(response) {
        track_like(response);
      });

      FB.Event.subscribe('edge.remove', function(response) {
        track_unlike(response);
      });

      //FB.Event.subscribe('message.send', function(targetUrl) {
        //track_fb_shared();
      //});
      
      FB.getLoginStatus(function(response) {
        debug("Got FB.getLoginStatus response: "+debug_stringify(response));
        if (response.status === 'connected' ) {
          debug("FB user is connected");
          if (typeof(processFbResponse) == 'function'){
              processFbResponse(response);
          }
          //track_user("iframe_load");
          if (response.perms) {
            fbPerms = response.perms;
            debug("FB perms: "+debug_stringify(fbPerms));
          }
        }
      });
    };

    // Load the SDK asynchronously
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/all.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));

// ]]>

