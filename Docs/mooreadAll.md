mooReadAll documentation
========================

Welcome to the mooRadAll documentation page. For a quick start guide, take a look at the [demo page](http://www.abidibo.net/projects/js/mooReadAll/demo), only two code lines are necessary for a basic usage, here all the public methods are described. So let's see them.

**constructor**

Constructs a mooReadAll instance. The syntax is:

	var myinstance = new mooReadAll(options)

The options parameter is an object of global options used by the class, Each option may be overridden when adding elements to cut to the class, so that any element may have its proper behavior.

The available options are:

    * words: (int) default 60. The number of words after which text is truncated.
    * remove_tags: (mixed) default []. Possible values are:
      - "all": removes all html tags
      - ['tag1', 'tag2']: removes the tags tag1 and tag2
    * display_style: (string) default 'block'. I don't like at all to see a whole content reduce itself after a while, I prefer to see a cut content growing up from an empty element. So mooReadAll hide the element whose content is cut and show it again when computation finishes. The best would be to hide directly the element and have mooReadAll to show it. With this option is possible to decide which style property to use: the display or the visibility one. Possible values are:
      - "none": the hide/show actions are skipped
      - "visible": the visibility style is used ('hidden' and 'visible')
      - "every display style": the element is hidden setting "display: none" and the shown setting display to the value passed ('block', 'inline', 'table', 'list-item', ...).
    * truncate_characters: (string) default "...". The characters to show after the truncated text.
    * action_label: (string) default "read all". The action link label
    * action: (string) default layer. The action to perform when clicking the action_label link. Possible values are:
      - "inplace": the whole content is rendered inside the same element, a back button appears so that the content may be expanded/compressed infinite times.
      - "link": the action_label links to another page (an anchor tag)
      - "callback": a callback function to call when clicking the action_label link. The first parameter passed to callback is the element, then a custom parameter and finally the context of the mooReadAll object is passed also.
      - "layer": the whole content is displayed in a layer over the document (lightbox style). It's possible to activate some controls: drag, resize, text-resize.
    * return_label: (string) default "back".  Used by the action "inplace" type. Is the link label which appears after expanding the whole content in order to compress it again.
    * layer_id: (string) default ''. Used by the action "layer" type. if you need to customize every layer, this id is assigned to the id attribute of the layer.
    * layer_width: (int) default 800. Used by the action "layer" type: The width of the layer. Its height may be set by css.
    * layer_draggable: (bool) default false. Used by the action "layer" type. Whether to make the layer draggable or not.
    * layer_resizable: (bool) default false. Used by the action "layer" type. Whether to make the layer resizable or not.
    * layer_text_resizable: (bool) default false. Used by the action "layer" type. Whether to make the layer text resizable or not.
    * link_href: (string) default "". Used by the action "link" type. The url to link the action_label to. 
    * link_target: (string) default "_blank". Used by the action "link" type. The target attribute of the anchor tag.
    * callback: (function) default null. Used by the action "callback" type. The callback function to call when clicking the action_label link.
    * callback_param: (mixed) default null. Used by the action "callback" type. A custom parameter to pass to the callback function. 

**actionLink**

This method returns the anchor/span "read all" link, depending on the action option. The syntax is:
myinstance.actionLink(element, html, cut_html)

    * element: (element). The dom element.
    * html: (string). The whole content.
    * cut_html: (string). The cut content.

**add**

The most important method: adds dom elements to the class performing the content cut over them. It then automatically applies the cut, so for base usage is the only method which is necessary to call after the class constructor. The syntax is:
myinstance.add(elements, options)

    * elements: (mixed). The elements to which apply the content cut. Possible values are:
      - (string) selector: a css selector
      - (elements) elements: an array of elements
      - (element) element: an element
    * options: (object). The same object as passed to the constructor. These options override the "global" behavior for the group of elements passed. 

**apply**

Applies the content cut to the element passed. The syntax is:
myinstance.apply(element, options)

    * element: (element). The dom element to apply the cut to.
    * options: (object). The same object as passed to the constructor. These options override the "global" behavior for the element passed.

**closeLayer**

Closes the layer lightbox style. The syntax is:
myinstance.closeLayer()

**cut**

This is the noblest method of the class, the one which performs the cut of the html content preserving the html structure and good formatting. Returns the truncated html text. The syntax is:
myinstance.cut(html)

    * html: (string). The whole html content to cut. Global or local options are used (number of words, remove_tags).

**setProperties**

Sets the instance properties, which by default are equal to the options above. This way we may define some global options passing them to the constructor and then overwrite some of them. The syntax is:
myinstance.setProperties(options)

the options parameter is an object of options equal to the one taken by the constructor.

**showInLayer**

Shows the entire html text in a layer (lightbox style). The syntax is:
myinstance.showInLayer(element, html)

    * element: (element). The dom element
    * html: (string). The whole html content of the element. 
