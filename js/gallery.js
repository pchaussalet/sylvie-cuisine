var userId = '117584989112280576716';
var lang = 'fr';

var LANDSCAPE = 1;
var PORTRAIT = 2;

function generateGalleries(rootId) {
    $.getJSON('https://sylvie-cuisine-gallery.pchaussalet.workers.dev/galleries/' + rootId, function (galleries) {
        var root = $('#galleries');
        for (var i = 0; i < galleries.length; i++) {
            var gallery = galleries[i];
            $('<li></li>').append(
                $('<a href="#gallery" key="' + gallery.id + '" onclick="return generateGallery(this)"></a>').append(
                    $('<h5>' + gallery.name + '</h5>')
                )
            ).appendTo(root);
        }
    });
}

function listPictures(galleryId, callback) {
    $.getJSON('https://sylvie-cuisine-gallery.pchaussalet.workers.dev/images/' + galleryId, function (data) {
        callback(data);
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
        .attr('src', picture.webContentLink)
        .attr('alt', picture.name)
        .addClass('center-block')
        .appendTo(container);
    if (picture.description) {
        $('<div></div>')
            .addClass('carousel-caption')
            .append(picture.description)
            .appendTo(container);
    }
    if (getOrientation(picture) === LANDSCAPE) {
        image.height('auto');
    } else {
        image.width('auto');
    }
    return { container: container, image: image };
}

function openAlbum(current) {
    var $albumSlides = $('#albumSlides');
    $albumSlides.children().removeClass('active');
    $albumSlides.children().slice(current, current + 1).addClass('active');
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

var resetHeight = function () {
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
    var key = element.getAttribute('key');
    var $galleryParent = $('#galleryParent');
    var $loading = $('#loading');
    var link = $(element).first();
    $galleryParent.hide();
    $loading.show();
    link.addClass('active');
    listPictures(key, function (pictures) {
        $('#albumSlides').empty();
        $galleryParent.empty();
        for (var i = 0; i < pictures.length; i++) {
            var picture = pictures[i];
            var cell = $('<div></div>')
                .addClass('col-md-2')
                // .addClass('col-sm-3')
                .addClass('col-xs-4')
                .appendTo($galleryParent);
            var link = $('<a></a>')
                .attr('href', '#gallery')
                .addClass('thumbnail')
                .on('click', (function (current) { return function () { openAlbum(current); }; })(i))
                .appendTo(cell);
            $('<img>')
                .attr('src', picture.thumbnailLink)
                .attr('alt', picture.name)
                .appendTo(link);
            addPictureToCarousel(picture);
        }
        $loading.hide();
        $galleryParent.fadeIn();
    });
}