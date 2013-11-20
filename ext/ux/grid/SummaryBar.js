/**
 * Fixed summary row.
 *
 * @author Boris Pronin
 */
Ext.define('Ext.ux.grid.SummaryBar', {
    extend: 'Ext.Container',
    alias: 'widget.summary-bar',

    grid: null,

    initComponent: function () {
        var me = this;

        var fields = [];
        Ext.Array.forEach(me.grid.columns, function (column) {
            fields.push(
                {
                    itemId: column.dataIndex,
                    width: column.width,
                    hidden: column.hidden,
                    style: {
                        textAlign: column.align
                    }
                }
            )
        });

        Ext.apply(me, {
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            cls: 'x-panel-body-default summary-bar',
            defaults: {
                xtype: 'displayfield',
                value: '\u00a0'
            },
            items: fields
        });

        me.grid.on({
            columnresize: me.onColumnResize,
            columnmove: me.onColumnMove,
            columnhide: me.onColumnShow,
            columnshow: me.onColumnShow,
            viewready: function (grid) {
                grid.view.getEl().on('scroll', me.onViewScroll, me);
            },
            scope: me
        });

        me.grid.view.on({
            refresh: me.onViewRefresh,
            scope: me
        });

        this.callParent(arguments);
    },

    onColumnResize: function () {
        var me = this;
        Ext.Array.forEach(me.grid.getView().getGridColumns(), function (column) {
            me.columnField(column).setWidth(column.getWidth());
        });
        me.doLayout();
    },

    onColumnMove: function () {
        var me = this;
        Ext.Array.forEach(me.grid.getView().getGridColumns(), function (column) {
            var field = me.columnField(column);
            me.remove(field, false);
            me.insert(column.getIndex(), field);
        });
        me.doLayout();
    },

    onColumnShow: function () {
        var me = this;
        Ext.Array.forEach(me.grid.getView().getGridColumns(), function (column) {
            me.columnField(column).setVisible(column.isVisible())
        });
        me.doLayout();
    },

    onViewRefresh: function () {
        var me = this;
        Ext.Array.forEach(me.grid.getView().getGridColumns(), function (column) {
            if (column.summaryType) {
                var value = me.calcSummary(me.grid.getStore(), column.summaryType, column.dataIndex, true);
                if (!value && value !== 0) {
                    value = '\u00a0';
                }

                var renderer = (column.summaryRenderer || column.renderer);
                if (renderer) {
                    value = renderer.call(column.scope || this, value, value, column.dataIndex)
                }

                me.columnField(column).setValue(value);
            }
        });
    },

    onViewScroll: function (event, el) {
        this.getEl().dom.scrollLeft = el.scrollLeft;
    },

    columnField: function (column) {
        return this.down('#' + column.dataIndex);
    },

    calcSummary: function (store, type, field, group) {
        if (type) {
            if (Ext.isFunction(type)) {
                return store.aggregate(type, null, group);
            }
            switch (type) {
                case 'count':
                    return store.count(group);
                case 'min':
                    return store.min(field, group);
                case 'max':
                    return store.max(field, group);
                case 'sum':
                    return store.sum(field, group);
                case 'average':
                    return store.average(field, group);
                default:
                    return group ? {} : '';
            }
        }
        return null;
    }

});