/**
    BaseModalController: Provides common functionality for modals. All modals
    extend this.
**/
var BaseModalController = Composer.Controller.extend({
    elements: {
        'div.overlay': 'overlay',
        'div.gutter': 'gutter'
    },
    events: {
        'click .gutter': 'click_close'
    },

    inject: 'body',

    base_render: function() {
        var div = $c('div');
        div.className = 'overlay invisible';
        var gutter = $c('div');
        gutter.className = 'gutter';
        div.appendChild(gutter);
        return div;
    },

    click_close: function(e) {
        if (e.target == this.gutter || e.target.className == 'close') {
            e.preventDefault();
            this.hide();
        }
    },

    show: function() {
        document.getElementsByTagName('html')[0].style.overflow = 'hidden';
        this.overlay.style.display = 'block';
        setTimeout(function() {
            this.overlay.className = 'overlay';
        }.bind(this), 50);
    },

    hide: function() {
        this.overlay.classList.add('invisible');

        if (typeof this.before_hide == 'function')
            this.before_hide();

        setTimeout(function() {
            document.getElementsByTagName('html')[0].removeAttribute('style');
            this.release();
        }.bind(this), 400);
    }
});
