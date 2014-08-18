var userId = '117584989112280576716';
var lang = 'fr';

var LANDSCAPE = 1;
var PORTRAIT = 2;

function listPictures(albumId, callback) {
    var albumUrl = 'https://picasaweb.google.com/data/feed/base/user/' + userId + '/albumid/' + albumId + '?alt=json&hl=' + lang;
    $.getJSON(albumUrl, function(data) {
        console.log(data);
        var entries = data.feed.entry;
        var pictures = [];
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i].media$group;
            pictures.push({
                title:  entry.media$description.$t || data.feed.title.$t,
                url:    entry.media$content[0].url,
                width:  entry.media$content[0].width,
                height: entry.media$content[0].height,
                type:   entry.media$content[0].type,
            });
        }
        callback(pictures);
    });
}

function getThumbnail(pictureUrl) {
    return pictureUrl.substr(0, pictureUrl.lastIndexOf('/')) + '/s128-c' + pictureUrl.substr(pictureUrl.lastIndexOf('/'));
}

function getOrientation(picture) {
    return picture.width > picture.height ? LANDSCAPE : PORTRAIT;
}

function addPictureToCarousel(picture) {
    var container = $('<div></div>')
        .addClass('item')
        .width('100%')
        .height('100%')
        .appendTo($('#albumSlides'));
    var image = $('<img>')
        .attr('src', picture.url)
        .attr('alt', picture.title)
        .addClass('center-block')
        .appendTo(container);
    $('<div></div>')
        .addClass('carousel-caption')
        .append(picture.title)
        .appendTo(container);
    if (getOrientation(picture) === LANDSCAPE) {
        image.width('100%');
    } else {
        image.height('100%');
    }
    return {container: container, image: image};
}

function openAlbum(current) {
    var $albumSlides = $('#albumSlides');
    $albumSlides.children().removeClass('active');
    $albumSlides.children().slice(current, current+1).addClass('active');
    $('#albumViewer').modal();
    $('.modal-dialog').height('auto');
}

function startSliding(way) {
    var carousel = $('#albumCarousel');
    $('.carousel-control').hide();
    $('.carousel-caption').hide();
    $('.modal-dialog').height('100%');
    $('.modal-content').height('100%');
    $('.modal-body').height('100%');
    carousel.height('100%');
    $('#albumSlides').height('100%');
    carousel.one('slid.bs.carousel', resetHeight);

    carousel.carousel(way);
}

var resetHeight = function() {
    $('#albumSlides').height('auto');
    $('#albumCarousel').height('auto');
    $('.modal-body').height('auto');
    $('.modal-content').height('auto');
    $('.modal-dialog').height('auto');
    $('.carousel-caption').show();
    $('.carousel-control').show();
};

function generateGallery(element) {
    $('#galleries').find('a').removeClass('active');
    var albumId = element.id;
    var $galleryParent = $('#galleryParent');
    var $loading = $('#loading');
    var link = $(element).first();
    $galleryParent.hide();
    $loading.show();
    link.addClass('active');
    listPictures(albumId, function(pictures) {
        $('#albumSlides').empty();
        $galleryParent.empty();
        var gallery = $('<div></div>');
        for (var i = 0; i < pictures.length; i++) {
            var picture = pictures[i];
            var cell = $('<div></div>')
                .addClass('col-md-2')
                .addClass('col-sm-3')
                .addClass('col-xs-4')
                .appendTo($galleryParent);
            var link = $('<a></a>')
                .attr('href', '#gallery')
                .addClass('thumbnail')
                .on('click', (function(current) {return function() { openAlbum(current); }; })(i))
                .appendTo(cell);
            $('<img>')
                .attr('src', getThumbnail(picture.url))
                .attr('alt', picture.title)
                .appendTo(link);
            addPictureToCarousel(picture);
        }
        $loading.hide();
        $galleryParent.fadeIn();
    });
}