

// Snapper core is responsible for handling all logic for interacting with the grid
// except:
// 1. direct ui manipulation (responsibility of the wrapper)
// 2. internal grid determination (responsibility of the algorithm)
// 3. Maintenence of state (responsibility of the wrapper)
import helpers from './helpers'
import { 
    renderModeType, 
    resizeOptions, 
    defaultItemOptions, 
    defaultGridOptions ,
    defaultPlaceholderStyles,
} from './options'

export default {
    getItemStyles() {
        return {
            boxSizing: 'border-box',
            position: 'absolute'
        }
    },

    getItemClasses( itemOptions = defaultItemOptions ) {
        const classes = [ ...itemOptions.classes, itemOptions.itemClassName ]

        if ( itemOptions.glued ) {
            classes.push('snapper-glued')
        }

        return classes
    },

    getEmptyGrid( gridRows ) {
        let grid = []

        for( let r = 0; r < gridRows; r++ )
            grid.push( [] )

        return grid
    },

    /// 
    /// Calculate the position of the item within the grid
    ///
    getItemPosition(gridWidth, gridHeight, gridRows, gridCols, width, height, left, top, renderMode) {
        const flex = ( renderMode === renderModeType.flex )

        // even though the container could change and these calculations need to rerun on that event,
        // it looks much nicer if theyre percentages on the widgets - even if it temporarily gives a 1px gap
        // and then closes the gap on mouse up, than having px values 
        if (flex) {
           return {
               ...this.getItemPositionPixels( gridWidth, gridHeight, gridRows, gridCols, width, height, left, top ),
               ...this.getItemPositionPercentages( gridWidth, gridHeight, gridRows, gridCols, width, height, left, top ),
           }
        }
        else {
            return this.getItemPositionPixels( gridWidth, gridHeight, gridRows, gridCols, width, height, left, top )
        }
    },

    getItemPositionPercentages( gridWidth, gridHeight, gridRows, gridCols, width, height, left, top ) {
        const pxPerColFloored = Math.floor(gridWidth / gridCols)
        const pxPerRowFloored = Math.floor(gridHeight / gridRows)
        const colRemainderPx = gridWidth - pxPerColFloored * gridCols
        const rowRemainderPx = gridHeight - pxPerRowFloored * gridRows
        // todo check if need to * by required precision and floor to avoid decimal calc
        const widthPxOffset = (49 / gridWidth) / 100
        const heightPxOffset = (49 / gridHeight) / 100

        const extraLeft = Math.min(left, colRemainderPx)
        const extraWidth = Math.min(width + left, colRemainderPx) - extraLeft
        const extraTop = Math.min(top, rowRemainderPx)
        const extraHeight = Math.min(height + top, rowRemainderPx) - extraTop

        // shift it by 2/5 px percent to always count for rounding errors
        // could do anything below 1/2 but this is sufficient as 
        // (40 / x = 0.01% limit => pxLimit = 40 / 0.01 = 4000px
        const leftPct = ((left * pxPerColFloored + extraLeft) * 100) / gridWidth + widthPxOffset
        const widthPct = ((width * pxPerColFloored + extraWidth) * 100) / gridWidth + widthPxOffset
        const topPct = ((top * pxPerRowFloored + extraTop) * 100) / gridHeight + heightPxOffset
        const heightPct = ((height * pxPerRowFloored + extraHeight) * 100) / gridHeight + heightPxOffset

        const ending = '%';

        return { leftPct, widthPct, topPct, heightPct, ending }
    },

    getItemPositionPixels( gridWidth, gridHeight, gridRows, gridCols, width, height, left, top ) {
        const pxPerColFloored = Math.floor(gridWidth / gridCols)
        const pxPerRowFloored = Math.floor(gridHeight / gridRows)
        const colRemainderPx = gridWidth - pxPerColFloored * gridCols
        const rowRemainderPx = gridHeight - pxPerRowFloored * gridRows

        const extraLeft = Math.min(left, colRemainderPx)
        const extraWidth = Math.min(width + left, colRemainderPx) - extraLeft
        const extraTop = Math.min(top, rowRemainderPx)
        const extraHeight = Math.min(height + top, rowRemainderPx) - extraTop

        const widthPx = pxPerColFloored * width + extraWidth
        const heightPx = pxPerRowFloored * height + extraHeight
        const topPx = pxPerRowFloored * top + extraTop
        const leftPx = pxPerColFloored * left + extraLeft

        const ending = 'px';

        return { widthPx, heightPx, topPx, leftPx, ending }
    },

    updateMovedItem( item, gridSizing, gridOptions ) {
        const { newX, newY, newWidth, newHeight } = item
        const { gridWidth, gridHeight, gridRows, gridColumns } = gridSizing
        const renderMode = gridOptions.renderMode
        const movedItem = { ...item }

        if ( ! ( newWidth && newHeight ) ) {
            console.error( `Item ${ key } does not have a newWidth or newHeight value. Unable to correctly resize item`)
            return item
        }

        // update the values with the set new values
        movedItem.x = newX
        movedItem.y = newY
        movedItem.width = newWidth
        movedItem.height = newHeight

        const position = this.getItemPosition( gridWidth, gridHeight, gridRows, gridColumns, movedItem.width, movedItem.height, movedItem.x, movedItem.y, renderMode )
        const styles = this.getItemPositionStyles( gridOptions, movedItem.styles, position )

        movedItem.position = { ...position }
        movedItem.styles = { ...styles }

        return movedItem
    },

    updateGridWithMovedItems( grid, items ) {
        for ( const key in items ) {
            const movedItem = items[ key ]
            this.updateGridWithItemMovement( grid, movedItem, movedItem.x, movedItem.y, movedItem.width, movedItem.height )
        }
    },

    getUpdatedMovedItems( items, draggedItemId, newTopPx, newLeftPx, newWidthPx, newHeightPx, gridSizing, gridOptions ) {
        return items.forEach(item => {
            const movedItem = this.updateMovedItem( item, gridSizing, gridOptions )

            if ( key === draggedItemId ) {
                // todo sync the %
                const position = {
                    ...movedItem.position,
                    ending: 'px',
                    topPx: newTopPx,
                    leftPx: newLeftPx,
                    widthPx: newWidthPx,
                    heightPx: newHeightPx
                }

                const styles = this.getItemPositionStyles( gridOptions, movedItem.styles, position )

                movedItem.position = { ...position }
                movedItem.styles = { ...styles }
            }

            return movedItem
        })
    },

    getUpdatedGridSizeItems( items, gridOptions, gridSizing, ignoreIds = [] ) {
        const renderMode = gridOptions.renderMode
        const { gridRows, gridColumns, gridHeight, gridWidth } = gridSizing 

        return items.map( ( item ) => {
            
            if ( ignoreIds.indexOf( item.id ) > -1 )
                return

            const position = this.getItemPosition( gridWidth, gridHeight, gridRows, gridColumns, item.width, item.height, item.x, item.y, renderMode )
            const styles = this.getItemPositionStyles( gridOptions, item.styles, position )

            return {
                ...item,
                position,
                styles
            }
        })
    },

    getGridBoundaries( gridSizing ) {
        const { gridWidth, gridHeight } = gridSizing

        return {
            leftBoundary: 0,
            rightBoundary: gridWidth,
            topBoundary: 0,
            bottomBoundary: gridHeight
        }
    },

    getItemSizing( itemProps, gridSizing ) {
        const { gridWidth, gridHeight } = gridSizing
        const { width, height } = itemProps
        const pxPerColumn = gridWidth / gridColumns
        const pxPerRow = gridHeight / gridRows
        const itemWidthPx = width * pxPerColumn
        const itemHeightPx = height * pxPerRow

        return { itemWidthPx, itemHeightPx }
    },

    calculateGridMatrixSize( items, gridOptions, gridSizing ) {
        const { itemsCanResizeGrid, resizeGridDirections } = gridOptions
        const { gridRows, gridColumns } = gridSizing
        const canResizeX = itemsCanResizeGrid && resizeGridDirections !== 'y'
        const canResizeY = itemsCanResizeGrid && resizeGridDirections !== 'x'

        if ( !( canResizeX || canResizeY ) ) {
            return {
                rows: gridRows,
                columns: gridColumns
            }
        }

        let rowsRequired = 0
        let columnsRequired = 0

        items.forEach(item => {
            const rightBoundary = item.x + item.width
            const bottomBoundary = item.y + item.height

            if ( rightBoundary > columnsRequired )
                columnsRequired = rightBoundary

            if ( bottomBoundary > rowsRequired )
                rowsRequired = bottomBoundary
        })

        return {
            rows: canResizeY ? Math.max( rowsRequired, gridRows ) : gridRows,
            columns: canResizeX ? Math.max( columnsRequired, gridColumns ) : gridColumns
        }
    },

    calculateGridSize( gridSizing, gridOptions, newRowCount, newColumnCount ) {
        const {  gridRows, gridColumns, } = gridOptions 
        const { widthPx, heightPx } = gridSizing
        
        const newGridWidth = ( widthPx / gridColumns ) * newColumnCount
        const newGridHeight = ( heightPx / gridRows ) * newRowCount

        return {
            newGridWidth,
            newGridHeight
        }
    },

    calculateMovementChange( itemProps, gridOptions, gridSizing, movementDetails  ) {
        const gridResizeable = gridOptions.itemsCanResizeGrid
        const canResizeX = gridResizeable && gridOptions.resizeGridDirections !== 'y'
        const canResizeY = gridResizeable && gridOptions.resizeGridDirections !== 'x'

        const pxPerColumn = gridSizing.widthPx / gridOptions.gridColumns
        const pxPerRow = gridSizing.heightPx / gridOptions.gridRows
        const xDiff = movementDetails.currentMouseX - movementDetails.initialMouseX
        const yDiff = movementDetails.currentMouseY - movementDetails.initialMouseY
        
        let newLeftPx = movementDetails.initialLeft + xDiff
        let newTopPx = movementDetails.initialTop + yDiff
        let newX = Math.round( newLeftPx / pxPerColumn )
        let newY = Math.round( newTopPx / pxPerRow )

        if ( newX < 0 ) {
            newX = 0
        }
        else if ( newX + 1 > gridOptions.gridColumns && !canResizeX ) {
            newX = gridOptions.gridColumns - 1
        }

        if ( newY < 0 ) {
            newY = 0
        }
        else if ( newY + 1 > gridOptions.gridRows && !canResizeY ) {
            newY = gridOptions.gridRows - 1
        }

        return {
            newX,
            newY,
            newLeftPx,
            newTopPx,
        }
    },

    calculateResizeChange( itemProps, gridOptions, gridSizing, movementDetails  ) {
        const pxPerColumn = gridSizing.widthPx / gridOptions.gridColumns
        const pxPerRow = gridSizing.heightPx / gridOptions.gridRows
        const xDiff = movementDetails.currentMouseX - movementDetails.initialMouseX
        const yDiff = movementDetails.currentMouseY - movementDetails.initialMouseY
        
        let newWidthPx = movementDetails.initialWidth + xDiff
        let newHeightPx = movementDetails.initialHeight + yDiff
        let newWidth = Math.round( newWidthPx / pxPerColumn )
        let newHeight = Math.round( newHeightPx / pxPerRow )

        if ( newWidthPx < pxPerColumn ) {
            newWidth = 1
            newWidthPx = pxPerColumn
        }

        if ( newHeightPx < pxPerRow ) {
            newHeight = 1
            newHeightPx = pxPerRow
        }

        return {
            newWidthPx,
            newHeightPx,
            newWidth,
            newHeight,
            newLeftPx: itemProps.position.leftPx,
            newTopPx: itemProps.position.topPx
        }
    },

    calculatePositionChange( itemProps, state ) {
        const { gridSizing, gridOptions } = state

        const pxPerColumn = gridSizing.widthPx / gridOptions.gridColumns
        const pxPerRow = gridSizing.heightPx / gridOptions.gridRows

        return {
            newWidthPx: Math.round( pxPerColumn * itemProps.width ),
            newHeightPx: Math.round( pxPerRow * itemProps.height ),
            newLeftPx: Math.round( pxPerColumn * itemProps.x ),
            newTopPx: Math.round( pxPerRow * itemProps.y ),
            newX: itemProps.x,
            newY: itemProps.y,
            newWidth: itemProps.width,
            newHeight: itemProps.height,
        }
    },

    getNoMovementResult( state, itemProps, movementChange ) {
        const targetItem = {
            ...itemProps,
            position: {
                ...itemProps.position,
                ending: 'px',
                topPx: movementChange.newTopPx, // todo this is wrong
                leftPx: movementChange.newLeftPx,
                widthPx: movementChange.newWidthPx,
                heightPx: movementChange.newHeightPx
            }
        }

        const updatedItems = state.items.map(item => {
            if ( item.id == targetItem.id ) {
                return targetItem
            }

            return item
        })

        return {
            success: true, // todo should this be false?
            grid: state.grid,
            updatedItems,
            targetItem,
            gridSizing: state.gridSizing,
            movementChange,
            itemsMoved: false
        }
    },

    itemHasMoved( itemProps, movementChange ) {
        return ( movementChange.newX != itemProps.x ) || ( movementChange.newY != itemProps.y )
    },

    itemHasResized( itemProps, movementChange ) {
        return ( movementChange.newWidth !== itemProps.width ) || ( movementChange.newHeight !== itemProps.height ) 
    },

    checkProposedGridSizing( state, proposedGridColumns, proposedGridRows ) {
        const {  gridOptions } = state

        const canResizeX = ( gridOptions.resizeGridDirections !== resizeOptions.y )
        const canResizeY = ( gridOptions.resizeGridDirections !== resizeOptions.x )

        if ( ( !canResizeX && proposedGridColumns !== gridOptions.gridColumns ) || gridOptions.gridColumns < 1 )
            throw 'Invalid grid column proposition from algorithm'

        else if ( ( !canResizeY && proposedGridRows !== gridOptions.gridRows ) || gridOptions.gridRows < 1 )
            throw 'Invalid grid row proposition from algorithm'
    },

    getPlaceholderStyles( position ) {
        return {
            ...defaultPlaceholderStyles,
            left: `${ position.leftPx }px`,
            top: `${ position.topPx }px`,
            width: `${ position.widthPx }px`,
            height: `${ position.heightPx }px`
        }
    },

    addItemToGrid( itemProps, state ) {
        const movementChange = {
            newX: itemProps.x,
            newY: itemProps.y,
            newWidth: itemProps.width,
            newHeight: itemProps.height,
            newTopPx: itemProps.position.topPx,
            newLeftPx: itemProps.position.leftPx,
            newWidthPx: itemProps.position.widthPx,
            newHeightPx: itemProps.position.heightPx
        }

        return this.onItemMovement( itemProps, state, movementChange )
    },

    movementIsWithinBounds( movementChange, gridOptions ) {
        const { 
            gridColumns, 
            gridRows, 
            itemsCanResizeGrid, 
            resizeGridDirections 
        } = gridOptions

        const {
            newX,
            newY,
            newWidth,
            newHeight
        } = movementChange

        const canResizeX = itemsCanResizeGrid && resizeGridDirections !== 'y'
        const canResizeY = itemsCanResizeGrid && resizeGridDirections !== 'x'

        return ( canResizeX || ( newX + newWidth <= gridColumns ) )
            && ( canResizeY || ( newY + newHeight <= gridRows  ) )
    },

    onItemMovement( itemProps, state, movementChange ) {
        const renderMode = state.gridOptions.renderMode
        const { gridOptions } = state
        const defaultResult = this.getNoMovementResult( state, itemProps, movementChange )
        const draggedItem = { ...itemProps }

        if ( !this.movementIsWithinBounds( movementChange, gridOptions ) ) {
            return defaultResult
        }

        const dragResult = gridOptions.algo.run( state, draggedItem, movementChange.newX, movementChange.newY, movementChange.newWidth, movementChange.newHeight )
        
        if ( !dragResult.success ){
            return defaultResult
        }

        const gridResized = ( dragResult.gridColumns !== gridOptions.gridColumns ) 
            || ( dragResult.gridRows !== gridOptions.gridRows )

        let gridWidth = state.gridSizing.widthPx
        let gridHeight = state.gridSizing.heightPx
        
        if ( gridResized ) {
            this.checkProposedGridSizing( state, dragResult.gridColumns, dragResult.gridRows )
            const newSize = this.calculateGridSize( state.gridSizing, gridOptions, dragResult.gridRows, dragResult.gridColumns )
            gridWidth = newSize.newGridWidth
            gridHeight = newSize.newGridHeight
        }

        const updatedItems = Object.keys( dragResult.itemsToMove )
            .map(key => {
                const movedItem = dragResult.itemsToMove[ key ]

                const position = this.getItemPosition( 
                    gridWidth, 
                    gridHeight, 
                    dragResult.gridRows,
                    dragResult.gridColumns, 
                    movedItem.width, 
                    movedItem.height, 
                    movedItem.x, 
                    movedItem.y, 
                    renderMode 
                )
    
                // without these the item will jitter
                if ( movedItem.id === draggedItem.id ) {
                    const placeholderStyles = this.getPlaceholderStyles( position )
    
                    movedItem.meta = {
                        ...movedItem.meta,
                        placeholderStyles
                    }
    
                    movedItem.position = {
                        ...movedItem.position,
                        ending: 'px',
                        topPx: movementChange.newTopPx,
                        leftPx: movementChange.newLeftPx,
                        widthPx: movementChange.newWidthPx,
                        heightPx: movementChange.newHeightPx
                    }
    
                    movedItem.styles = this.getItemPositionStyles( gridOptions, movedItem.styles, movedItem.position )
                    console.log( movedItem.styles )
                }
                else {
                    movedItem.position = position
                    movedItem.styles = this.getItemPositionStyles( gridOptions, movedItem.styles, position )
                }
                
                return movedItem
            })

        return {
            success: dragResult.success,
            grid: state.grid,
            updatedItems,
            itemsMoved: Object.keys( dragResult.itemsToMove ).length > 1,
            targetItem: draggedItem,
            movementChange,
            gridSizing: {
                gridRows: dragResult.gridRows,
                gridColumns: dragResult.gridColumns,
                heightPx: gridHeight,
                widthPx: gridWidth
            }
        }
    },

    onItemPositionChanged( itemProps, previousItemProps, state ) {
        const positionChange = this.calculatePositionChange( itemProps, state ) 

        if ( !this.positionHasChanged( itemProps, previousItemProps )) {
            return this.getNoMovementResult( state, previousItemProps, positionChange )
        }      

        return this.onItemMovement( previousItemProps, state, positionChange )
    },

    positionHasChanged( itemProps, previousItemProps ) {
        return itemProps.x !== previousItemProps.x
            || itemProps.y !== previousItemProps.y
            || itemProps.width !== previousItemProps.width
            || itemProps.height !== previousItemProps.height
    },

    onItemDragStart( itemProps ) {
        if ( itemProps.glued )
            return { 
                item: itemProps,
                success: false
            }

        const placeholderStyles = this.getPlaceholderStyles( itemProps.position )

        const item = {
            ...itemProps,
            meta: {
                ...itemProps.meta,
                isDragging: true,
                placeholderStyles
            }
        }

        return {
            item,
            success: true
        }
    },

    ///
    /// Handles all drag logic
    ///
    onItemDrag( itemProps, state, movementDetails ) {
        const movementChange = {
            ...this.calculateMovementChange( itemProps, state.gridOptions, state.gridSizing, movementDetails ),
            newWidth: itemProps.width,
            newHeight: itemProps.height,
            newWidthPx: itemProps.position.widthPx,
            newHeightPx: itemProps.position.heightPx
        }

        if ( !itemProps.meta.isDragging || itemProps.glued ){   
            return this.getNoMovementResult( state, itemProps, movementChange )
        }
        else if ( !this.itemHasMoved( itemProps, movementChange ) ) {
            return this.getNoMovementResult( state, itemProps, movementChange )
        }

        return this.onItemMovement( itemProps, state, movementChange )
    },

    onItemDragStop ( itemProps, items, gridWidth, gridHeight, gridOptions, gridSizing ) {
        const { width, height, x, y } = itemProps
        const { gridRows, gridColumns, renderMode } = gridOptions

        const meta = { ...itemProps.meta, isDragging: false }

        const position = this.getItemPosition( gridWidth, gridHeight, gridRows, gridColumns, width, height, x, y, renderMode )
        const styles = this.getItemPositionStyles( gridOptions, itemProps.styles, position )

        const updatedItem = { 
            ...itemProps,
            position,
            styles,
            meta
        }
        
        return updatedItem
    },

    onItemResizeStart( itemProps ) {
        if ( itemProps.glued ) {
            return { 
                item: itemProps,
                success: false
            }
        }
        
        const item = {
            ...itemProps,
            meta: {
                ...itemProps.meta,
                isResizing: true,
            }
        }

        return {
            item,
            success: true
        }
    },

    onItemResize( itemProps, state, movementDetails ) {
        const movementChange = {
            ...this.calculateResizeChange( itemProps, state.gridOptions, state.gridSizing, movementDetails ),
            newX: itemProps.x,
            newY: itemProps.y,
            newLeftPx: itemProps.position.leftPx,
            newTopPx: itemProps.position.topPx,
        }

        if ( !itemProps.meta.isResizing || itemProps.glued ) {
            return this.getNoMovementResult( state, itemProps, movementChange )
        }
        else if ( !this.itemHasResized( itemProps, movementChange ) ) {
            return this.getNoMovementResult( state, itemProps, movementChange )
        }

        return this.onItemMovement( itemProps, state, movementChange )
    },

    onItemResizeStop ( itemProps, items, gridWidth, gridHeight, gridOptions, gridSizing ) {
        const { width, height, x, y } = itemProps
        const { gridRows, gridColumns, renderMode } = gridOptions

        const meta = { ...itemProps.meta, isResizing: false }

        const position = this.getItemPosition( gridWidth, gridHeight, gridRows, gridColumns, width, height, x, y, renderMode )
        const styles = this.getItemPositionStyles( gridOptions, itemProps.styles, position )

        const updatedItem = { 
            ...itemProps,
            position,
            styles,
            meta
        }

        return updatedItem
    },

    ///
    /// Updates the internal 2d grid with the new item position. itemProps should contain the current values, prior to being updated
    ///
    updateGridWithItemMovement( grid, itemProps, oldX, oldY, oldWidth, oldHeight ) {
        const { id, x, y, width, height } = itemProps

        this.ensureGridHasRow( grid, y )

        this.setGridWithValue( grid, id, oldX, oldY, oldWidth, oldHeight, undefined, false )
        this.setGridWithValue( grid, id, x, y, width, height, itemProps, true )
    },

    updateGridWithItem( grid, itemProps ) {
        const { id, x, y, width, height } = itemProps

        this.setGridWithValue( grid, id, x, y, width, height, itemProps, true )
    },

    removeGridItem( gridItems, grid, itemProps, gridOptions, gridSizing ) {
        const { id, x, y, width, height } = itemProps
        const { widthPx, heightPx } = gridSizing
        const { renderMode } = gridOptions

        this.ensureGridHasRow( grid, y )
        this.setGridWithValue( grid, id, x, y, width, height, undefined, true )

        // todo handle grid resize
        const itemsReverted = gridOptions.algo.onGridItemRemoved( itemProps, grid, gridOptions )

        const updatedItems = gridItems
            .map( item => {
                const revertDetails = itemsReverted.find( i => i.id === item.id )

                if ( !revertDetails )
                    return null
                
                const { x, y, width, height } = revertDetails

                const movedItem = {
                    ...item,
                    x,
                    y,
                    width,
                    height
                }
                
                const position = this.getItemPosition( 
                    widthPx,
                    heightPx, 
                    gridOptions.gridRows,
                    gridOptions.gridColumns, 
                    width, 
                    height, 
                    x, 
                    y, 
                    renderMode 
                )
    
                movedItem.position = position
                movedItem.styles = this.getItemPositionStyles( gridOptions, movedItem.styles, position )
                
                return movedItem
            })
            .filter( item => item != null )
        
        return {
            updatedItems
        }
    },

    ensureGridHasRow( grid, rowIndex ) {
        if ( !grid[ rowIndex ] )
            grid[ rowIndex ] = []
    },

    ///
    /// Set the internal 2d grid with the value specified within the { x, x + width, y, y + height } range as long as the cell does not contain a different item already
    ///
    setGridWithValue( grid, id, x, y, width, height, value, overwrite = false ) {
        for (let j = y; j < y + height; j++)
            for (let i = x; i < x + width; i++) {
                const cellValue = grid[ j ][ i ]
                if ( !helpers.isDefined( cellValue ) || cellValue.id == id || overwrite )
                    grid[ j ][ i ] = value
            }
    },

    getItemPositionStyles( gridOptions, styles, position ) {
        const { transform, left, top, ...otherStyles } = styles || {}

        if ( position.ending === '%' ) {
            return {
                ...otherStyles,
                left: `${ position.leftPct }%`,
                top: `${ position.topPct }%`,
                width: `${ position.widthPct }%`,
                height: `${ position.heightPct }%`
            }
        }
        else if ( gridOptions.enableCSS3 ) {
            return {
                ...otherStyles,
                width: `${ position.widthPx }px`,
                height: `${ position.heightPx }px`,
                transform: `translate(${ position.leftPx }px, ${ position.topPx }px)`
            }
        }

        return {
            ...otherStyles,
            left: `${ position.leftPx }px`,
            top: `${ position.topPx }px`,
            width: `${ position.widthPx }px`,
            height: `${ position.heightPx }px`
        }
    },

    ///
    /// Gets the internal grid x,y equivalent for the supplied top & left px values
    ///
    getGridXY( gridSizing, topPx, leftPx ) {
        const { gridWidth, gridHeight, gridRows, gridColumns } = gridSizing
        
        const x = this.getGridPosition( gridWidth, leftPx, gridColumns )
        const y = this.getGridPosition( gridHeight, topPx, gridRows )

        return { x, y }
    },

    getGridWH( gridWidth, gridHeight, widthPx, heightPx, gridSizing ) {
        const { gridRows, gridColumns } = gridSizing

        const width = this.getGridPosition( gridWidth, widthPx, gridColumns )
        const height = this.getGridPosition( gridHeight, heightPx, gridRows )

        return { width, height }
    },
    
    getGridPosition( gridPixels, itemPixels, matrixLevels ) {
        return Math.max( 1, Math.round( itemPixels / gridPixels * matrixLevels ) )
    },

    getBoundaryLimitedSizing( currentLeftPx, currentTopPx, currentWidthPx, currentHeightPx, boundaries, gridOptions ) {
        const { resizeGridDirections, itemsCanResizeGrid } = gridOptions
        const { rightBoundary, bottomBoundary } = boundaries

        const xResizeable = itemsCanResizeGrid && resizeGridDirections !== resizeOptions.y
        const yResizeable = itemsCanResizeGrid && resizeGridDirections !== resizeOptions.x

        const widthPx = xResizeable ? currentWidthPx : Math.min( currentWidthPx, rightBoundary - currentLeftPx )
        const heightPx = yResizeable ? currentHeightPx : Math.min( currentHeightPx, bottomBoundary - currentTopPx )

        return { widthPx, heightPx }
    }
}