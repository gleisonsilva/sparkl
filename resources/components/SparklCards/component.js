/*
 * Selector Model describes the behaviour for the selector
 * as a whole. 
 */



/*
model.on('action:delete' , function(id){
	Dashboards.log('Deleting plugin ' + id);
});**/




var wd = wd || {};
wd.cpk = wd.cpk || {};

(function (namespace) {

	function _testFile (url, successCallback, errorCallback){
    successCallback = successCallback || function (){ return true };
    errorCallback = errorCallback || function(){ return true }
    $.ajax({
      url: url,
      type:'HEAD',
      error: errorCallback,
      success: successCallback
    });
  }

	namespace.models = namespace.models || {};
	namespace.views = namespace.views || {};
	namespace.templates = namespace.templates || {};

	/*
	 * Models
	 */

  	namespace.models.sparklNewPluginCard = Backbone.Model.extend({
    	defaults:{
      		"pluginId" : "newPluginId", 
   				"actionOpts" : []
       	},

    	fireAction: function (action){
    		this.trigger('action:' + action , this.get('pluginId') );
    	},
	});

	namespace.models.sparklPluginCard = Backbone.Model.extend({
    	defaults:{
    		"pluginId" : "", 
    		"plugin_name" : "",
    		"plugin_description" : "",
    		"author_name": "",
    		"company_name": "",
    		"company_url": "",
    		"creation_date": "",
    		"version": "",
    		"CPK_version": "",
    		"pluginImage": "",
   			"actionOpts" : [],
   			"imgSrc": "",
   			"backgroundColor" : "none"
    	},

    	initialize: function (){
    		var pluginId = this.get('pluginId'),
    				imgSrc = '/pentaho/content/' + pluginId + '/static/system/img/pluginLogo.png';
    		this.set('imgSrc', imgSrc);
    	},

    	fireAction: function (action){
    		this.trigger('action:' + action , this.get('pluginId') );
    	},
	});

	/*
	 * Templates
	 */



	namespace.templates.sparklNewPluginCard = Mustache.compile(
		"   <div class='overlay'></div>" +
		"		<div class='optionCont first'></div>"+
		"		<div class='separator'>"+
		"			<div class='horizontalRectangle'></div>"+
		"			<div class='verticalRectangle'></div>"+
		"		</div>"+
		"		<div class='optionCont second'></div>"
	);

	namespace.templates.sparklPluginCard = Mustache.compile(
		"		<div class=descriptionExpandCont>"+
		"			<div class='cardHeader'>"+
		"		  	<div class='nameContainer'>"+
		"					<div class='ellipsis left'>...</div>" +
		"         <span class='name'>{{plugin_name}}</span>"+
		"					<div class='ellipsis right'>...</div>" +
		"       </div>"+
		"				<div class='id'>{{pluginId}}</div>"+
		"			</div>"+
		"			<div class='cardBody'>"+
		"				<div class='imageContainer'>"+
		"				</div>"+
		"				<div class='descriptionContainer'>"+
		"					<div class='header'>Description</div>"+
		"					<div class='body'>{{plugin_description}}</div>"+
		"				</div>"+
		"			</div>"+
		"		</div>"+
		"		<div class='cardFooter'>"+
		"			<div class='versionLabel'> VER. "+
		"					{{version}}"+
		"			</div>"+
		"		</div>"+
		"		<div class='optsExternCont'>"+
		"			<div class='optionsContainer'>"+
		"			</div>"+
		"			<div class='optionsIcon'>"+
		"			</div>"+
		"		</div>"
	);

	/*
	 * Views
	 */

	namespace.views.sparklNewPluginCard = Backbone.View.extend({
		template: namespace.templates.sparklNewPluginCard,
		tagName: 'div',
		className: 'sparklNewPluginCardContainer',
		events:{},

		initialize: function (){

		},
		render: function (ph){
			var that = this;
	      	that.$el.html( that.template( that.model.toJSON()) );

			var $optsContArr = that.$el.find('.optionCont');

	      	_.each ( that.model.get('actionOpts') , function (action,idx) {
				$optsContArr[idx].innerHTML=action.label;
	      		$($optsContArr[idx]).click( function (){
	      			that.model.fireAction( action.id );
	      		});
	      	});	

	      	if (ph){
	      		that.$ph = $(ph);
	      		$(ph).append(that.$el);
	      	}
		},
	});

	namespace.views.sparklPluginCard = Backbone.View.extend({
		template: namespace.templates.sparklPluginCard,
		tagName: 'div',
		className: 'sparklPluginCardContainer',
		events:{
	    	"click .optionsIcon": "toggleOptionsExpanded",
	    	"mouseenter .name" : "handleOverflow" ,
	    	"mouseleave .name" : "resetOverflow"
	    },

	    initialize: function (){
	    	this.model.on('change:imgSrc', function(v){
	    		if (v){
	    			this.$el.find('img').show();
	    		}
	    	});
	    },
	    render: function (ph){
				var self = this;
	      
	      this.$el.html( this.template( this.model.toJSON()) );

	     	_.each ( this.model.get('actionOpts') , function (action) {
	      		var $optsContainer = self.$el.find('.optionsContainer');
						var $opt = $("<div/>").text(action.label)
							.attr('id', action.id)
							.addClass('optionCont')
							.addClass(action.classes || "");
						$optsContainer.append($opt);
	      		$opt.click( function (){
	      			self.model.fireAction( action.id );
	      			self.toggleOptionsExpanded(false);
	      	});
	      });

	      var imgSrc = this.model.get('imgSrc'),
	      		$container = this.$el.find('.imageContainer'),
	     			successCallback = function (){
	     				$('<img/>').attr('src', imgSrc ).addClass('image').appendTo($container);
	     			},
	     			errorCallback = function (){
	     				var label = self.model.get('plugin_name') || self.model.get('pluginId') || "";
	     				$('<div/>').text( label ).addClass('imagePlaceholder').appendTo($container);
	     			};
	     	$container.css('background-color', self.model.get('backgroundColor'));
	      _testFile( imgSrc, successCallback, errorCallback );

	      this.appendView(ph);
	    },

	    appendView: function(ph){
	    	if (ph){
	    		this.$ph = $(ph);
	    	}
	    	if (this.$ph){
	    		this.$ph.append(this.$el);
	    	}

	    	var $header = this.$el.find('.cardHeader'),
	      		$title = $header.find('.name');
	      if( $title.width() > $header.width()){
	      	$header.addClass('overflow');
	      }

	    	return this
	    },

	    handleOverflow: function (){
	    	var $header = this.$el.find('.cardHeader');
	      		$title = $header.find('.name');
	      if ( $header.hasClass('overflow')){
	      	$title.css('text-indent', $header.width() - $title.width() );
	      }
	    },

	    resetOverflow: function (){
	    	var $header = this.$el.find('.cardHeader');
	      		$title = $header.find('.name');
	      if ( $header.hasClass('overflow')){
	      	$title.css('text-indent', 0 );
	      }
	    },

	    detachView: function(){
			this.$el.detach();
			return this
	    },
	
	    toggleOptionsExpanded: function( predicate ){
		    var $ph = this.$el.find('.optsExternCont');
		    var pred = _.isUndefined( predicate ) ? !$ph.hasClass('expanded') : predicate;
		    $ph.toggleClass('expanded', pred);
	    },
	});

}) (wd.cpk);
