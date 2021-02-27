
// I know sometimes using arrow functions and sometimes the normal syntax is messy
// but Visual Studio collapses the normal syntax on Ctrl+M, Ctrl+O and it does not collapse arrow functions
// so that's why it's the way it is

let els = {
    toc: '.toc'
};


document.addEventListener('DOMContentLoaded', () => {
    initEls(els);
    initTOC();
});

function initTOC() {

    //
    // ON-CLICK SCROLLING
    //

    // spacing in px to substract from scroll target bounding box top
    const scrollToSpacingTop = 64;

    // find all li children with the [data-target] attribute declared
    let tocEntries = els.toc.querySelectorAll('li[data-target]');

    tocEntries.forEach(li => {

        let liTargetName = li.getAttribute('data-target');
        let liTargetSection = document.querySelector(`section[data-name="${liTargetName}"]`);

        li.addEventListener('click', function (ev) {

            let liTargetBCR = liTargetSection.getBoundingClientRect();
            let top = document.scrollingElement.scrollTop + liTargetBCR.top - scrollToSpacingTop;

            document.scrollingElement.scrollTo({ top, behavior: 'smooth' });

        });

    });

}
