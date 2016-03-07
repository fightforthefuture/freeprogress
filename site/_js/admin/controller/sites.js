var SitesController = Composer.Controller.extend({
    elements: {
    },

    events: {
    },

    sites: null,

    init: function() {

        this.render();

        this.sites = new Sites().populate();
    },

    render: function() {
        var html = SitesView({
        });
        this.html(html);
    }
});