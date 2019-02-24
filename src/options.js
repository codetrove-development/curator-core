const renderModeType = {
    // flex = percentages
    flex: 'flex',
    // fixed = px
    fixed: 'fixed'
}

const resizeOptions = {
    // boxes are fixed width
    none: 'none',
    // resize x direction only
    x: 'x',
    // resize y direction 
    y: 'y', 
    // resize both
    both: 'both'
}

const defaultItemOptions = {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    className: 'grid-item',
    glued: false,
    // not yet supported but is partially done in the algo, do not alter
    visible: true,
    displayResize: true,
    position: {
        topPx: 0,
        leftPx: 0,
        topPct: 0,
        leftPct: 0,
        widthPx: 0,
        heightPx: 0,
        widthPct: 0,
        heightPct: 0,
        ending: 'px'
    },
    meta: {
        isDragging: false,
        isResizing: false
    }
}

const defaultPlaceholderStyles = {
    position: 'absolute',
    border: '2px dashed grey',
    zIndex: -1,
}

const defaultGridOptions = {
    gridColumns: 12,
    gridRows: 12,
    width: '100%',
    height: '100%',
    className: 'curator-grid',
    // whether to render the grid items using percentages or pixel values
    renderMode: renderModeType.flex,
    // show the grid lines: not currently supported
    //showGrid: false,
    // can resize the grid by dragging elements
    itemsCanResizeGrid: true,
    // which directions the grid can resize in (either dragging handle or items)
    resizeGridDirections: resizeOptions.y,
    // move items using transitions
    useTransition: true,
    // specific options for transitions
    transitionDuration: 600,
    // On an individual transition completed for an element (multiple fires when multiple elements moved)
    onTransitionComplete: ( element, details, eventIfFired ) => { },
    // On all transitions completed for a given element
    onAllTransitionsComplete: ( element, details, eventIfFired ) => { },
    // class name for the resize handle
    resizeClassName: 'resize-handle',
    enableCSS3: true,
    algo: null,
}

export {
    renderModeType,
    resizeOptions,
    defaultItemOptions,
    defaultGridOptions,
    defaultPlaceholderStyles,
}