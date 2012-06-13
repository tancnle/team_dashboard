(function (views, models, collections) {

  views.CounterDialog = Backbone.View.extend({

    _modelBinder: undefined,

    events: {
      "click .btn-primary" : "save"
    },

    initialize: function(options) {
      _.bindAll(this, "render", "prefillAutocomplete");
      this._modelBinder = new Backbone.ModelBinder();
      this.dashboard = options.dashboard;
    },

    prefillAutocomplete: function() {
      var that = this;
      if (!collections.metrics.isFetched) {
        collections.metrics.fetch({ success: that.prefillAutocomplete });
        return;
      }
      this.targetInput.select2({ tags: collections.metrics.autocomplete_names() });
    },

    render: function() {
      $(this.el).html(JST['templates/widgets/counter/edit']({ model: this.model.toJSON() }));

      var bindings = {
          name: '[name=name]',
          // size: { selector: '[name=size]' },
          time: { selector: '[name=time]' },
          targets: '[name=targets]',
          update_interval: { selector: '[name=update-interval]' }
      };
      this._modelBinder.bind(this.model, this.el, bindings);

      this.targetInput = this.$('.targets');
      this.targetInput.val(this.model.get('targets'));
      this.prefillAutocomplete();

      var myModal = this.$('#dashboard-details-modal');
      var nameInput = this.$('input.name');
      myModal.on("shown", function() { nameInput.focus(); });
      myModal.modal({ keyboard: true });
      return this;
    },

    save: function() {
      var that = this;
      var myModal = this.$('#dashboard-details-modal');
      myModal.modal("hide");

      var targets = this.targetInput.select2('val');
      this.model.set("targets", targets.join(','));
      this.model.set("kind", "counter");

      var result = this.model.save({}, {
        success: function(model, request) {
          that.dashboard.updateLayout(model.id);
          that.dashboard.trigger("widgets:changed");
        }
      });

      return false;
    },

    onClose: function() {
      this._modelBinder.unbind();
    }

  });
})(app.views, app.models, app.collections);