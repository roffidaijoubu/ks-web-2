(function () {
    'use strict';

    /**
     * Load content into page without a whole page reload
     * @param {string} href URL to route to
     * @param {boolean} pushState whether to call history.pushState or not
     */
    function load(href, pushState) {
        const mainContainer = $('main');
        const navContainer = $('nav > ul');
        const xhr = new XMLHttpRequest();
        // const animationOut = 'animate__fadeOut';
        const animationIn = 'animate__fadeIn';

        // Start fade-out animation
        // mainContainer.classList.add('animate__animated', animationOut);

        xhr.onload = function () {


            const responseDoc = xhr.responseXML;
            const newTitle = responseDoc.title || '';
            const newMainContent = $('main', responseDoc);
            const newNavContent = $('nav > ul', responseDoc);
            const isSPA = responseDoc.documentElement.getAttribute('is-spa') === 'true';

            if (!isSPA) {
                // Fallback to normal link behavior if is-spa is not "true"
                document.location.href = href;
                return;
            }
            // Ensure old content is hidden before updating
            mainContainer.style.display = 'none';
            navContainer.style.display = 'none';

            // Update the content
            mainContainer.innerHTML = newMainContent ? newMainContent.innerHTML : '';
            if (newNavContent) {
                navContainer.innerHTML = newNavContent.innerHTML;
            }


            // Update and animate in the new content
            mainContainer.style.display = '';
            navContainer.style.display = '';
            // mainContainer.classList.remove(animationOut);
            mainContainer.classList.add('animate__animated', animationIn);

            document.title = newTitle;
            if (pushState) {
                history.pushState({}, newTitle, href);
            }
            mainContainer.focus();
            window.scrollTo(0, 0);
        };

        xhr.onerror = function () {
            // Fallback to normal link behavior
            document.location.href = href;
        };

        xhr.open('GET', href);
        xhr.responseType = 'document';
        xhr.send();
    }



    function $(sel, con) {
        return (con || document).querySelector(sel);
    }

    /**
     * Search for a parent anchor tag outside a clicked event target
     *
     * @param {HTMLElement} el the clicked event target.
     * @param {number} maxNests max number of levels to go up.
     * @returns the anchor tag or null
     */
    function findAnchorTag(el, maxNests = 3) {
        for (let i = maxNests; el && i > 0; --i, el = el.parentNode) {
            if (el.nodeName === 'A') {
                return el;
            }
        }
        return null;
    }

    window.addEventListener('click', function (evt) {
        let baseUrl = $('meta[name="x-base-url"]')?.getAttribute('content') || '/';
        const el = findAnchorTag(evt.target);
        const href = el?.getAttribute('href');
        if (el && href) {
            if (
                href.startsWith('#') ||
                el.getAttribute('target') === '_blank' ||
                /\.\w+$/.test(href)
            ) {
                // eleventy urls in this configuration do not have extensions like .html
                // if they have, or if target _blank is set, or they are a hash link,
                // then do nothing.
                return;
            }
            // if the URL starts with the base url, do the SPA handling
            if (href.startsWith(baseUrl)) {
                evt.preventDefault();
                load(href, true);
            }
        }
    });

    window.addEventListener('popstate', function (e) {
        load(document.location.pathname, false);
    });
})();
