/*
---
description: mooReadAll is a plugin designed to cut html string preserving the html structure, without breaking tags. Provides a "read all" link which may call other pages, callback functions, open a layer or show the whole content in the same element.

license: MIT-style

authors:
- abidibo (Otto srl) <abidibo@gmail.com>

requires:
- core/1.3: Core
- core/1-3: Array
- core/1-3: String
- core/1-3: Function 
- core/1-3: Event
- core/1-3: Class
- core/1-3: Element
- core/1-3: Element.Style
- core/1-3: Element.Event
- core/1-3: Element.Dimensions
- core/1-3: Fx.Tween 
- more/1.3: Drag

provides:
- mooReadAll

...

For documentation, demo and download link please visit http://www.abidibo.net/projects/js/mooReadAll

*/

var mooReadAll = new Class({
	Implements: [Options],
	// options: global options
	options: {
		words: 60,
		remove_tags: [], // 'all' | array with tag elements
		display_style: 'block', // block | inline | <all display allowed properties> | visible (visibility instead of display) | none
		truncate_characters: '...',
		action_label: 'read all',
		action: 'layer', // inplace' | 'layer' | 'link' | 'callback'
		return_label: 'back', // inplace type
		layer_id: '', // need to customize every layer?
		layer_width: 800,
		layer_draggable: false,
		layer_resizable: false,
		layer_text_resizable: false,
		link_href: '',
		link_target: '_blank',
		callback: null,
		callback_param: null

	},
	initialize: function(options) {

		if(options) this.setOptions(options);

		this.max_z_index = this.getMaxZindex();
		this.max_text_size = 22; // really needing more?!
		this.min_text_size = 8; // really needing less?!
	},
	// create the properties object used by the instance
	setProperties: function(opts) {

		var prop = {
			words: typeof opts.words != 'undefined'
	     			? opts.words.toInt()
	    			: this.options.words.toInt(),
			remove_tags: typeOf(opts.remove_tags) === 'array' || (typeOf(opts.remove_tags) === 'string' && opts.remove_tags === 'all')
		   		? opts.remove_tags 
				: this.options.remove_tags,
			truncate_characters: typeOf(opts.truncate_characters) === 'string' 
		    		? opts.truncate_characters
				: this.options.truncate_characters,

			display_style: typeOf(opts.display_style) === 'string' 
		    		? opts.display_style
				: this.options.display_style,

			action: typeOf(opts.action) === 'string' 
		    		? opts.action
				: this.options.action,

			action_label: typeOf(opts.action_label) === 'string' 
		    		? opts.action_label
				: this.options.action_label,

			return_label: typeOf(opts.return_label) === 'string'
		    		? opts.return_label
				: this.options.return_label,

			link_href: typeOf(opts.link_href) === 'string'
				? opts.link_href
				: this.options.link_href,

			link_target: typeOf(opts.link_target) === 'string'
		    		? opts.link_target
				: this.options.link_target,

			callback: typeOf(opts.callback) === 'function'
		    		? opts.callback
				: this.options.callback,

			callback_param: typeof opts.callback_param != 'undefined'
		    		? opts.callback_param
				: this.options.callback_param,

			layer_id: typeOf(opts.layer_id) === 'string'
	     			? opts.layer_id
	    			: this.options.layer_id,

			layer_width: typeof opts.layer_width != 'undefined'
	     			? opts.layer_width.toInt()
	    			: this.options.layer_width.toInt(),

			layer_draggable: typeOf(opts.layer_draggable) === 'boolean'
	     			? opts.layer_draggable
	    			: this.options.layer_draggable,

			layer_resizable: typeOf(opts.layer_resizable) === 'boolean'
	     			? opts.layer_resizable
	    			: this.options.layer_resizable,

			layer_text_resizable: typeOf(opts.layer_text_resizable) === 'boolean'
	     			? opts.layer_text_resizable
	    			: this.options.layer_text_resizable
		}

		return prop;

	},
	// opts: add elements "local" options
	add: function(elements, opts) {

		if(typeOf(elements)==='string') this.elements = $$(elements);
		else if(typeOf(elements)==='elements') this.elements = elements;
		else if(typeOf(elements)==='element') this.elements = [elements];
		else this.elements = [];

		for(var i=0; i<this.elements.length; i++) {
			this.apply(this.elements[i], opts);
		}
	},
	apply: function(element, opts) {

		// local options may override global ones
		if(typeOf(opts) !== 'object') opts = {};
		var prop = this.setProperties(opts);
		// store the full html text
		var html = element.get('html');

		// hide elementing while computing (better if element is already hidden)
		this.hideElement(element, prop);

		// new cut text and "read all" action link
		var cut_html = this.cut(html, prop);
		var action_link = this.actionLink(element, html, cut_html, prop);

		element.set('html', cut_html);
		action_link.inject(element, 'bottom');

		// now that computing finishes show the element
		this.showElement(element, prop);
	},
	hideElement: function(element, prop) {
		if(prop.display_style=='none') return 0;	     
		else if(prop.display_style=='visible') element.style.visibility = 'hidden';
   		else element.style.display = 'none';		
	}.protect(),
	showElement: function(element, prop) {
		if(prop.display_style=='none') return 0;	     
		if(prop.display_style=='visible') element.style.visibility = prop.display_style;	     
   		else element.style.display = prop.display_style;		
	}.protect(),
	cut: function(html, prop) {
		// open close tags like <br /> are changed by javascript innerHTML function to <br>
		var rexp_open_tag = "<([a-zA-Z]+)\s?[^>]*?>";	       
		var rexp_close_tag = "<\/([a-zA-Z]+)>";
		var rexp_tag = "<\/?[a-zA-Z]+\s?[^>]*?\/?>";	       
		var ot_regexp = new RegExp(rexp_open_tag);
		var ct_regexp = new RegExp(rexp_close_tag);

		// if text words are less than prop.words return html
		var replace_regexp = new RegExp(rexp_open_tag+"|"+rexp_close_tag, "g");
		var text = html.replace(replace_regexp, "");

		var text_array = text.split(" ");
		if(text_array.length <= prop.words) return html;

		// else cut!
		// get all <opentag|closetag|openclosetag>text till other < divided in matches
		var parse_regexp = new RegExp("("+rexp_tag+")?[^<]*", "g");
		matches = html.match(parse_regexp);
		cut_html = '';
		opened_tag = [];
		var counter = 0;
		for(var i=0; i<matches.length; i++) {
		    	if(matches[i].trim()) {
				var part = matches[i];
				// separate the tag part and the text part
				var part_regexp = new RegExp("("+rexp_tag+")?([^<]*)", "g");
				part_matches = part_regexp.exec(part);
				if(typeof part_matches[1] != 'undefined') {
					var tag = part_matches[1];
					// is an open tag?
					if(tag_match = tag.match(ot_regexp)) {
						tag_name = tag_match[1];
						// if tag is to be removed
						if(prop.remove_tags.contains(tag_name) || prop.remove_tags==='all') {
							// do nothing
						}
						// img and br are open close tag, but detected as open tags
						else if(tag_name == "img" || tag_name == "br") 
							// close tag and add it to the partial text	    
							cut_html += tag.substr(0, tag.length-1)+" />"; 
						else {
							opened_tag.push(tag_name);	
							// add tag to the partial text	    
							cut_html += tag;
						}
					}
					else if(tag_match = tag.match(ct_regexp)) {
						tag_name = tag_match[1];
						if(prop.remove_tags.contains(tag_name) || prop.remove_tags === 'all') {
							// do nothing
					     	}
					      	else {
					    		// last opened tag is closed, remove it from list
							opened_tag.pop();
				    			// add tag to the partial text	    
				    			cut_html += tag;
					       	}
			    		}
				}
				// if there is some text
				if(typeof part_matches[2] != 'undefined') {
					var text_array = part_matches[2].split(" ");
					// if the first element is empty that's because the text begins with a space, so 
					// we have to add it manually if the text overcomes words length
					var add_space = /^\s*$/.test(text_array[0]) ? true : false;
					text_array.erase("");
					// sometimes at the beginning of the content there are tabs or multiple spaces due to indentation
					// if not sufficient may be necessary to erase all text_array elements 
					// which doesn't contain no-space characters, clearly only for the words count
					if(/^\s*$/.test(text_array[0])) text_array.splice(0,1);
					var text_add_array = [];
					// if text does not overcome words length
					if(counter + text_array.length < prop.words) {
						cut_html += part_matches[2];
						counter += text_array.length;
					}
					// else add only some words
					else {
						var diff = prop.words - counter;
						for(var i=0; i<diff; i++) {
							text_add_array.push(text_array[i]);
					       	}
						if(add_space) cut_html += " ";
						cut_html += text_add_array.join(" ");
						// max length reached then break
						break;
					}
				}
			}
		}

		// add truncate characters
		cut_html += prop.truncate_characters;
		// close opened tags
		for(var i=opened_tag.length-1; i>=0; i--) {
			cut_html += "</"+opened_tag[i]+">";
		}
					
		// if all tags have been removed add a space to separate the action_label link
		if(prop.remove_tags==='all') cut_html += " ";

		return cut_html;
	},
	actionLink: function(element, html, cut_html, prop) {
		
		tag = prop.action === 'link' ? 'a' : 'span';
		
		// store label
		var action_label = prop.action_label;

		var action_link = new Element(tag, {
			'class': 'link',
			'html': action_label
		});

		if(prop.action === 'inplace') {
			// store return_label in a variable which doesn't change with the object
			var return_label = prop.return_label;
			action_link.addEvent('click', function() {
				element.set('html', html); 
			       	if(return_label) { 
					var return_link = new Element('span', {'class': 'link', 'html': return_label});
					return_link.addEvent('click', function() {
						element.set('html', cut_html);
						action_link.set('html', action_label);
						action_link.inject(element, 'bottom'); 
					}.bind(this));
					return_link.inject(element, 'bottom');
				}
			}.bind(this))
		}
		else if(prop.action === 'link') {
			action_link.setProperty('href', prop.link_href);	
			action_link.setProperty('target', prop.link_target);	
		}
		else if(prop.action === 'callback') {
			action_link.addEvent('click', prop.callback.bind(this, element, prop.callback_param));	
		}
		else if(prop.action === 'layer') {
			action_link.addEvent('click', this.showInLayer.bind(this, element, html, prop));	
		}

		return action_link;

	},
	showInLayer: function(element, html, prop) {

		// overlay doesn't like active objects
		this.disableObjects();
		// render overlay and after (chain) the layer
		this.renderOverlay(element, html, prop); 

	},
	renderLayer: function(element, html, prop) {
		// init layer
		this.layer = new Element('div', {'class': 'mra_layer', id: this.layer_id});
		this.layer.setStyles({
			position: 'absolute',
			width: prop.layer_width,
			visibility: 'hidden',
			'z-index': ++this.max_z_index	
		});

		// layer title and body
		this.layerTitle(element);
		this.layerBody(html);
		
		// layer rendering
		this.layer.inject(document.body);
		this.layer.setStyles({
			top: this.getViewport().cY-this.layer.getCoordinates().height/2,
			left: this.getViewport().cX-this.layer.getCoordinates().width/2,
			visibility: 'visible'
		});

		// extra options
		if(prop.layer_resizable) this.makeResizable();
		if(prop.layer_text_resizable) this.makeTextResizable();
		if(prop.layer_draggable) this.makeDraggable();

		// close button always present
		var ico_close = new Element('div', {'class': 'mra_close'});
		ico_close.inject(this.layer, 'top');
		ico_close.addEvent('click', function() { this.closeLayer(); }.bind(this));

	},
	layerTitle: function(element) {
		// I love html5 ;)
		if(typeof element.getProperty('data-title') != 'undefined') {
			var title = new Element('div', {'class': 'mra_title'});
			title.set('html', element.getProperty('data-title'));
			title.inject(this.layer, 'top');
		}	    
	}.protect(),
	layerBody: function(html) {
		var layer_body = new Element('div', {'class': 'mra_layer_body'});
		layer_body.set('html', html);
		layer_body.inject(this.layer);
	}.protect(),
	closeLayer: function() {
		this.layer.destroy();
    		this.overlay_anim.start(0.7, 0);		
		this.enableObjects();
	},
	makeDraggable: function() {

		var ico_drag = new Element('div', {'class': 'mra_drag'});
		ico_drag.inject(this.layer, 'top');

		var docDim = document.getCoordinates();
		var dragInstance = new Drag(this.layer, {
			'handle':ico_drag, 
			'limit':{'x':[0, (docDim.width-this.layer.getCoordinates().width)], 'y':[0, ]}
		});
    
	}.protect(),
	makeResizable: function() {

		var ico_resize = new Element('div', {'class': 'mra_resize'});
		ico_resize.inject(this.layer, 'bottom');

		var ylimit = $$('body')[0].getSize().y-20;
		var xlimit = $$('body')[0].getSize().x-20;
		this.layer.makeResizable({
			'handle': ico_resize, 
			'limit': {'x':[200, xlimit], 'y':[60, ylimit]}
		});
	}.protect(),
	makeTextResizable: function() {
		
		var ico_text_smaller = new Element('div', {'class': 'mra_text_smaller'});
		ico_text_smaller.addEvent('click', function() {
			new_size = this.layer.getStyle('font-size').toInt() < (this.min_text_size+1)
				? this.min_text_size
				: this.layer.getStyle('font-size').toInt() - 1;
			this.layer.setStyle('font-size', new_size+'px');
		}.bind(this));
		ico_text_smaller.inject(this.layer, 'top');

		var ico_text_bigger = new Element('div', {'class': 'mra_text_bigger'});
		ico_text_bigger.addEvent('click', function() {
			new_size = this.layer.getStyle('font-size').toInt() > (this.max_text_size-1)
				? this.max_text_size
				: this.layer.getStyle('font-size').toInt() + 1;
			this.layer.setStyle('font-size', new_size+'px');
		}.bind(this));
		ico_text_bigger.inject(this.layer, 'top');

	}.protect(),
	// iframe are in the same domain? if not can't disable objects inside
	sameDomain: function(win) {
		var H = location.href;
    		local = H.substring(0, H.indexOf(location.pathname));
		try {
			win = win.document;
			return win && win.URL && win.URL.indexOf(local) == 0;
		}		
		catch(e) {
			return false;
		}
	}.protect(),
	disableObjects: function() {
		for(var i=0;i<window.frames.length;i++) {
			var myFrame = window.frames[i];
			if(this.sameDomain(myFrame)) {
				var obs = myFrame.document.getElementsByTagName('object');
				for(var ii=0; ii<obs.length; ii++) {
					obs[ii].style.visibility='hidden';
				}
			}
		}
		$$('object').each(function(item) {
			item.style.visibility='hidden';
		})
	}.protect(),
	enableObjects: function() {
		for(var i=0;i<window.frames.length;i++) {
			var myFrame = window.frames[i];
			if(this.sameDomain(myFrame)) {
				var obs = myFrame.document.getElementsByTagName('object');
				for(var ii=0; ii<obs.length; ii++) {
					obs[ii].style.visibility='visible';
				}
			}
		}
		$$('object').each(function(item) {
			item.style.visibility='visible';
		})
	}.protect(),
	renderOverlay: function(element, html, prop) {
		var docDim = document.getScrollSize();
		this.overlay = new Element('div', {'class': 'mra_overlay'});
		this.overlay.setStyles({
			position: 'absolute',
			top: '0px',
			left: '0px',
			width: docDim.x,
			height: docDim.y,
			'z-index': ++this.max_z_index,
			opacity: 0
		});
		this.overlay.inject(document.body);

		this.overlay_anim = new Fx.Tween(this.overlay, {property: 'opacity'});
		this.overlay_anim.start(0, 0.7).chain(function() { this.renderLayer(element, html, prop); }.bind(this));

		return this;

	}.protect(),
	getMaxZindex: function() {
		var maxZ = 0;
		$$('body *').each(function(el) {
			if(el.getStyle('z-index').toInt()) maxZ = Math.max(maxZ, el.getStyle('z-index').toInt());
		});

		return maxZ;
	}.protect(),
	getViewport: function() {
	
		var width, height, left, top, cX, cY;

 		// the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
 		if (typeof window.innerWidth != 'undefined') {
   			width = window.innerWidth,
   			height = window.innerHeight
 		}
		// IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
 		else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth !='undefined' && document.documentElement.clientWidth != 0) {
    			width = document.documentElement.clientWidth,
    			height = document.documentElement.clientHeight
 		}

		top = typeof self.pageYOffset != 'undefined' 
			? self.pageYOffset 
			: (document.documentElement && document.documentElement.scrollTop)
				? document.documentElement.scrollTop
				: document.body.clientHeight;

		left = typeof self.pageXOffset != 'undefined' 
			? self.pageXOffset 
			: (document.documentElement && document.documentElement.scrollTop)
				? document.documentElement.scrollLeft
				: document.body.clientWidth;

		cX = left + width/2;
		cY = top + height/2;

		return {'width':width, 'height':height, 'left':left, 'top':top, 'cX':cX, 'cY':cY};	     
	}.protect()

})
