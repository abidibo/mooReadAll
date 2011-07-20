mooReadAll
===========

![Screenshot](http://github.com/abidibo/mooReadAll/raw/master/logo.jpg)

mooReadAll is a mootools plugin designed to truncate html contents **preserving the right html structure** and without truncate tags.   
mooReadAll takes the dom elements passed, parses their content cutting it to a user defined number of words. Tag structure is preserved by **all or some tags may also be removed**. Then it includes a "read all" link linking the whole content. The action to perform when clicking it is highly customizable: inplace, link, js callback and layer action types are provided, see documentation for more informations. In case of layer type a title may be provided using the html5 data- attributes, and the layer showing up (lightbox style) may be made draggable, resizable and text-resizable.

How to use
----------

mooReadAll requires 
- core/1.3 Core, Array, String, Function, Event, Class, Element, Element.Style, Element.Event, Element.Dimensions, Fx.Tween 
- more/1.3 Drag

**Include mootools framework and mooReadAll plugin**

	<script src="path-to-mootools-framework" type="text/javascript"></script>
	<script src="path-to-mooReadAll-js" type="text/javascript"></script>

**Include mooReadAll stylesheet**

	<link href="path-to-mooReadAll-css" type="text/css" rel="stylesheet" />

**Upload mooReadAll images**   

Upload mooReadAll images to a desired path and if necessary change relative paths in mooReadAll.css

**Example code**

Javascript:

	window.addEvent('domready', function() {
		var mra_instance = new mooReadAll({words: 12, layer_draggable: true, layer_text_resizable: true, layer_width: 600});
		mra_instance.add('div[class=readall]');
		mra_instance.add('div[class=readall2]', {words: 20, remove_tags: ['img'], action:'inplace', action_label:'expand'});
	}

Html:

	<div>This element is left as is</div>
	<div class="readall" data-title="This title is shown in the layer window">
		<p>This element is truncated after 12 words, and the <b>opened tag are automatically closed.</b>. A read all link appears. When clicking over it a draggable layer (lightbox style) appears with aldo two controls for text resizing. The layer width is 600px.</p><p>Please use css to control the layer height/max-height if needed.</p>
	</div>
	<div class="readall2">
		<p>This element's content is <i>truncated</i> after 20 words, the <img src="path-to-an-image" />img tag is removed and the "read all" link which is "expand" causes the whole content to appear in the same element. Then a "back" link appears to compress another time the content. This is an example of how "local" options passed to the add method overwrites the global ones passed to the constructor (see documentation).</p>
	</div>

For more demos please visit the mooReadAll demo page at http://www.abidibo.net/projects/js/mooReadAll/demo

Screenshots
-----------

![Screenshot](http://github.com/abidibo/mooReadAll/raw/master/Docs/mra_screenshot1.png)
![Screenshot](http://github.com/abidibo/mooReadAll/raw/master/Docs/mra_screenshot2.png)

Links
-----------------

The project page: http://www.abidibo.net/projects/js/mooReadAll  
The documentation page: http://www.abidibo.net/projects/js/mooReadAll/doc   
The demo page: http://www.abidibo.net/projects/js/mooReadAll/demo

Please report bugs, errors and advices in the github project page: http://github.com/abidibo/mooReadAll
