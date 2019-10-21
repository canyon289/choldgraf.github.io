const runWhenDOMLoaded = cb => {

  if (document.readyState != 'loading') {

    cb()

  } else if (document.addEventListener) {

    document.addEventListener('DOMContentLoaded', cb)

  } else {

    document.attachEvent('onreadystatechange', function() {

      if (document.readyState == 'complete') cb()

    })

  }

}



// Helper function to init things quickly

initFunction = function(myfunc) {

  runWhenDOMLoaded(myfunc);

  document.addEventListener('turbolinks:load', myfunc);

};
/**

 * Select various elements on the page for later use

 */



// IDs we'll attach to cells

const codeCellId = index => `codecell${index}`

const inputCellId = index => `inputcell${index}`



pageElements = {}



// All code cells

findCodeCells = function() {

    var codeCells = document.querySelectorAll('div.c-textbook__content > div.highlighter-rouge > div.highlight > pre, div.input_area pre, div.text_cell_render div.highlight pre')

    pageElements['codeCells'] = codeCells;



    codeCells.forEach((codeCell, index) => {

      const id = codeCellId(index)

      codeCell.setAttribute('id', id)

    })

};



initFunction(findCodeCells);



// All cells in general

findInputCells = function() {

    var inputCells = document.querySelectorAll('div.jb_cell')

    pageElements['inputCells'] = inputCells;



    inputCells.forEach((inputCell, index) => {

        const id = inputCellId(index)

        inputCell.setAttribute('id', id)

    })

};



initFunction(findInputCells);
/**

 * Set up copy/paste for code blocks

 */

const copySVG = `<svg aria-labelledby="title" aria-hidden="true" data-prefix="far" data-icon="copy" class="svg-inline--fa fa-copy fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">

  <title id="title" lang="en">Copy code</title>

  <path fill="#777" d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"></path>

  </svg>`



const clipboardButton = id =>

  `<a id="copy-button-${id}" class="btn copybtn o-tooltip--left" data-tooltip="Copy" data-clipboard-target="#${id}">

    ${copySVG}

  </a>`



// Clears selected text since ClipboardJS will select the text when copying

const clearSelection = () => {

  if (window.getSelection) {

    window.getSelection().removeAllRanges()

  } else if (document.selection) {

    document.selection.empty()

  }

}



// Changes tooltip text for two seconds, then changes it back

const temporarilyChangeTooltip = (el, newText) => {

  const oldText = el.getAttribute('data-tooltip')

  el.setAttribute('data-tooltip', newText)

  setTimeout(() => el.setAttribute('data-tooltip', oldText), 2000)

}



const addCopyButtonToCodeCells = () => {

  // If ClipboardJS hasn't loaded, wait a bit and try again. This

  // happens because we load ClipboardJS asynchronously.

  if (window.ClipboardJS === undefined) {

    setTimeout(addCopyButtonToCodeCells, 250)

    return

  }



  pageElements['codeCells'].forEach((codeCell) => {

    const id = codeCell.getAttribute('id')

    if (document.getElementById("copy-button" + id) == null) {

      codeCell.insertAdjacentHTML('afterend', clipboardButton(id));

    }

  })



  const clipboard = new ClipboardJS('.copybtn')

  clipboard.on('success', event => {

    clearSelection()

    temporarilyChangeTooltip(event.trigger, 'Copied!')

  })



  clipboard.on('error', event => {

    temporarilyChangeTooltip(event.trigger, 'Failed to copy')

  })



  // Get rid of clipboard before the next page visit to avoid memory leak

  document.addEventListener('turbolinks:before-visit', () =>

    clipboard.destroy()

  )

}



initFunction(addCopyButtonToCodeCells);
/**

  Add buttons to hide code cells

*/

var setCodeCellVisibility = function (inputField, kind) {

    // Update the image and class for hidden

    var id = inputField.getAttribute('data-id');

    var codeCell = document.querySelector(`#${id} div.highlight`);



    if (kind === "visible") {

        codeCell.classList.remove('hidden');

        inputField.checked = true;

    } else {

        codeCell.classList.add('hidden');

        inputField.checked = false;

    }

}



var toggleCodeCellVisibility = function (event) {

    // The label is clicked, and now we decide what to do based on the input field's clicked status

    if (event.target.tagName === "LABEL") {

        var inputField = event.target.previousElementSibling;

    } else {

        // It is the span inside the target

        var inputField = event.target.parentElement.previousElementSibling;

    }



    if (inputField.checked === true) {

        setCodeCellVisibility(inputField, "visible");

    } else {

        setCodeCellVisibility(inputField, "hidden");

    }

}





// Button constructor

const hideCodeButton = id => `<input class="hidebtn" type="checkbox" id="hidebtn${id}" data-id="${id}"><label title="Toggle cell" for="hidebtn${id}" class="plusminus"><span class="pm_h"></span><span class="pm_v"></span></label>`



var addHideButton = function () {

    // If a hide button is already added, don't add another

    if (document.querySelector('div.tag_hide_input input') !== null) {

        return;

    }



    // Find the input cells and add a hide button

    pageElements['inputCells'].forEach(function (inputCell) {

        if (!inputCell.classList.contains("tag_hide_input")) {

            // Skip the cell if it doesn't have a hidecode class

            return;

        }



        const id = inputCell.getAttribute('id')



        // Insert the button just inside the end of the next div

        inputCell.querySelector('div.input').insertAdjacentHTML('beforeend', hideCodeButton(id))



        // Set up the visibility toggle

        hideLink = document.querySelector(`#${id} div.inner_cell + input + label`);

        hideLink.addEventListener('click', toggleCodeCellVisibility)

    });

}





// Initialize the hide buttos

var initHiddenCells = function () {

    // Add hide buttons to the cells

    addHideButton();



    // Toggle the code cells that should be hidden

    document.querySelectorAll('div.tag_hide_input input').forEach(function (item) {

        setCodeCellVisibility(item, 'hidden');

        item.checked = true;

    })

}



initFunction(initHiddenCells);
const initAnchors = () => {

  if (window.anchors === undefined) {

    setTimeout(initAnchors, 250);

    return;

  }

  anchors.add("main h1, main h2, main h3, main h4");



  // Disable Turbolinks for anchors

  document.querySelectorAll('.anchorjs-link')

    .forEach(it => it.dataset['turbolinks'] = false);

}

initFunction(initAnchors);

const initToc = () => {

  if (window.tocbot === undefined) {

    setTimeout(initToc, 250);

    return;

  }



  // Check whether we have any sidebar content. If not, then show the sidebar earlier.

  var SIDEBAR_CONTENT_TAGS = ['.tag_full_width', '.tag_popout'];

  var sidebar_content_query = SIDEBAR_CONTENT_TAGS.join(', ')

  if (document.querySelectorAll(sidebar_content_query).length === 0) {

    document.querySelector('nav.onthispage').classList.add('no_sidebar_content')

  }



  // Initialize the TOC bot

  tocbot.init({

    tocSelector: 'nav.onthispage',

    contentSelector: '.c-textbook__content',

    headingSelector: 'h2, h3',

    orderedList: false,

    collapseDepth: 6,

    listClass: 'toc__menu',

    activeListItemClass: " ",  // Not using, can't be empty

    activeLinkClass: " ", // Not using, can't be empty

  });



  // Disable Turbolinks for TOC links

  document.querySelectorAll('.toc-list-item a')

    .forEach(it => it.dataset['turbolinks'] = false);

}

initFunction(initToc);
