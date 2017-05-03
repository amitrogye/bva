// __fileURL = https://scpartner.service-now.com/sys_script_include.do?sys_id=be2de13fdbad7200f48efbb9af96195f
// __fieldName = script 
// __authentication = STORED

var TileBuilder = Class.create();
TileBuilder.prototype = {
    log: new x_snc_bva_tool._BVA_LogHelper(),
    initialize: function(businessCase) {
        this.businessCase = '';
        if (typeof businessCase === 'object') {
            this.businessCase = businessCase;
        } else {
            var bcGR = new GlideRecord('x_snc_bva_tool_business_case');
            bcGR.get(businessCase);
            this.businessCase = bcGR;
        }
        this.currency_symbol = this.businessCase.currency.symbol;
        this.cellUtils = new CellUtils();
    },
    getJSON: function() {
        var tileData = {};
        tileData.categories = this._getCategories();
        return tileData;
    },
    _getCategories: function() {
        var arrCategory = [];
        var catInstance = new GlideRecord('x_snc_bva_tool_category_instance');
        catInstance.addQuery('business_case', this.businessCase.sys_id);
        catInstance.orderBy('order');

        //for (var i = 0 ; i < 2 ; i++) {
        catInstance.query();
        while (catInstance.next()) {
            var categoryObj = {};
            var arrTile = this._getTilesForCategory(catInstance);
            if (!arrTile || arrTile.length <= 0)
                continue;
            categoryObj.tiles = arrTile;
            categoryObj.name = catInstance.getValue('name');
            categoryObj.sys_id = catInstance.getUniqueValue();
            categoryObj.background_color = catInstance.getValue('background_color');
            categoryObj.icon = catInstance.getValue('icon');
            categoryObj.order = catInstance.getValue('order');
            arrCategory.push(categoryObj);
        }
        //}
        this.log.logDebug(this.type, '_getCategories', 'Loading other Savings');
        var otherSavingsObj = {};
        var otherSavingCount = 0;
        var otherSavings = new GlideRecord('x_snc_bva_tool_other_savings_instance');
        otherSavings.addQuery('business_case', this.businessCase.sys_id);
        otherSavings.addQuery('active', true);
        otherSavings.addQuery('show_tile', true);
        otherSavings.orderBy('order');
        otherSavings.query();
        var arrOtherTile = [];
        if (otherSavings.hasNext()) {
            // c an be converted to system property
            otherSavingsObj.background_color = "#a0a8af";
            otherSavingsObj.icon = "/cloud-clone.png";
            otherSavingsObj.name = "Other Savings";
        }
        while (otherSavings.next()) {
            var arrOtherSavingTile = this._getOtherSavingsTiles(otherSavings, ++otherSavingCount);
            arrOtherTile.push(arrOtherSavingTile);
        }
        if (arrOtherTile.length > 0) {
            otherSavingsObj.tiles = arrOtherTile;
            arrCategory.push(otherSavingsObj);
        }
        return arrCategory;
    },
    _getOtherSavingsTiles: function(otherSaving, order) {
        var objOtherSavingTile = {};
        objOtherSavingTile.elements = {};
        objOtherSavingTile.elements.header = {
            content: this._getHtmlValue(otherSaving, 'label'),
            variables: {}
        };
        if (isNaN(otherSaving.getValue('dollar_value'))) {
            objOtherSavingTile.elements.dollar_value = {
                content: this._getHtmlValue(otherSaving, 'dollar_value'),
                variables: {}
            };
        } else {
            objOtherSavingTile.elements.dollar_value = {
                content: '{{ dollar_value.value | localize : dollar_value.answer_unit : default_currency : active_currency : dollar_value.rounding_attribute : currencies : true}}',
                variables: {
                    dollar_value: {
                        value: parseFloat(otherSaving.getValue('dollar_value')),
                        answer_unit: 'Currency',
                        rounding: 'round',
                        rounding_override: false,
                        sys_id: 'sys_id' + order,
                        rounding_attribute: 0
                    }

                }
            }
        }
        if (isNaN(otherSaving.percentage) || otherSaving.percentage == 0) {
            this.log.logDebug(this.type, '_getOtherSavingsTiles', 'IsNan : ' + otherSaving.percentage);
            objOtherSavingTile.elements.percentage = {
                content: this._getHtmlValue(otherSaving, 'percentage'),
                variables: {}
            };
        } else {
            this.log.logDebug(this.type, '_getOtherSavingsTiles', 'its a number : ' + otherSaving.percentage);
            objOtherSavingTile.elements.percentage = {
                content: '<span class=\ "tile-percentage\">{{percentage_value.value | localize : percentage_value.answer_unit : null: null: percentage_value.rounding_attribute}}</span> improvement',
                variables: {
                    percentage_value: {
                        value: parseFloat(otherSaving.getValue('percentage')),
                        answer_unit: 'Percentage',
                        rounding: 'round',
                        rounding_override: false,
                        sys_id: 'psys_id' + order,
                        rounding_attribute: 0
                    }
                }
            }
        }
        objOtherSavingTile.elements.explanation = {
            content: this._getHtmlValue(otherSaving, 'explanation'),
            variables: {}
        };
        objOtherSavingTile.elements.targeted_outcome = {
            content: this._getHtmlValue(otherSaving, 'targeted_outcome'),
            variables: {}
        };
        objOtherSavingTile.elements.data_points = {
            content: this._getHtmlValue(otherSaving, 'data_points'),
            variables: {}
        };
        objOtherSavingTile.elements.calculation = {
            content: this._getHtmlValue(otherSaving, 'calculation'),
            variables: {}
        };
        objOtherSavingTile.elements.benefits = {
            content: this._getUnorderedList(this._getHtmlValue(otherSaving, 'benefits')),
            variables: {}
        };
        objOtherSavingTile.elements.assumptions = {
            content: this._getHtmlValue(otherSaving, 'assumptions'),
            variables: {}
        };
        objOtherSavingTile.name = this._getHtmlValue(otherSaving, 'label');
        objOtherSavingTile.sys_id = otherSaving.getUniqueValue();
        objOtherSavingTile.order = order * 100;
        objOtherSavingTile.show_details = otherSaving.show_details.toString() == 'false' ? false : true;
        objOtherSavingTile.show_tile = otherSaving.show_tile.toString() == 'false' ? false : true;
        return objOtherSavingTile;
    },
    _getUnorderedList: function(str) {
        if (!str)
            return str;
        var list = str.split(/\r?\n/);
        var html = '<ul>';
        for (var i = 0; i < list.length; i++) {
            html += '<li>' + list[i] + '</li>';
        }
        return html + '</ul>';
    },
    _getPercentageHtmlValue: function(gr, column) {
        var content = this._htmlSanitize(gs.nil(gr.getValue(column)) ? '' : gr.getValue(column));
        return '<span class="tile-percentage">' + content + '<span> improvement';
    },
    _getHtmlValue: function(gr, column) {
        return this._htmlSanitize(gr.getValue(column));
    },
    _htmlSanitize: function(str) {
        return str ? String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
    },
    _getTilesForCategory: function(category) {
        var arrTile = [];
        var tileInstance = new GlideRecord('x_snc_bva_tool_tile_instance');
        tileInstance.addQuery('category_instance', category.sys_id.toString());
        //tileInstance.addQuery('metric_instance.exclude_tile', false);
        tileInstance.orderBy('order');
        tileInstance.query();
        while (tileInstance.next()) {
            var tileObj = {};
            // check if the tile should be included or not
            if (tileInstance.metric_instance.exclude_tile) {
                this.log.logDebug(this.type, '_getTilesForCategory', category.name + " -Exclude Tile- " + tileInstance.metric_instance.exclude_tile);
                continue;
            }
            tileObj.show_details = true;
            tileObj.name = tileInstance.getValue('name');
            tileObj.sys_id = tileInstance.getUniqueValue();
            tileObj.order = tileInstance.getValue('order');
            tileObj.show_tile = true;
            tileObj.type = tileInstance.getValue('type') ? tileInstance.getValue('type') : 'value_area';
            tileObj.elements = this._getTileDefinitions(tileInstance);
            arrTile.push(tileObj);
        }
        return arrTile;
    },
    _getTileDefinitions: function(tile) {
        //gs.info("getting details for :" + tile);
        var elementObj = {};
        var tdInstance = new GlideRecord('x_snc_bva_tool_tile_definition_instance');
        tdInstance.addQuery('tile_instance', tile.sys_id.toString());
        tdInstance.orderBy('result_column_instance.order');
        tdInstance.query();
        while (tdInstance.next()) {
            elementObj[tdInstance.result_column_instance.name.toString()] = {};
            elementObj[tdInstance.result_column_instance.name.toString()].variables = this._getTileVariables(tdInstance);
            var content = this._getAngularContent(tdInstance.getValue('content') || '', elementObj[tdInstance.result_column_instance.name.toString()].variables, this.currency_symbol);
            elementObj[tdInstance.result_column_instance.name.toString()].content = content + '';

        }
        return elementObj;
    },
    _getAngularContent: function(content, variables) {
        for (var variable in variables) {
            content = content.replace(new RegExp("\\{{([^\{]+(.value))\}}", "g"), function(_unused, varName) {
                var token = varName.substring(0, varName.indexOf('.value'));
                var outerSpan = '<span class="bva-clickable-metric" onclick="showMetricModal(\'{{' + token + '.sys_id}}\');event.stopPropagation();">';
                var closingSpan = '</span>';
                if (variables[variable].answer_unit == 'Percentage') {
                    return outerSpan + '{{' + varName + ' | localize : ' + token + '.answer_unit : null: null: ' + token + '.rounding_attribute}}' + closingSpan;
                } else if (variables[variable].answer_unit == 'Currency') {
                    return outerSpan + '{{' + varName + ' | localize : ' + token + '.answer_unit : default_currency : active_currency : ' + token + '.rounding_attribute : currencies : true}}' + closingSpan;
                } else if (variables[variable].answer_unit == 'Decimal' || variables[variable].answer_unit == 'Number') {
                    return outerSpan + '{{' + varName + ' | number : ' + token + '.rounding_attribute }}' + closingSpan;
                }
            });
        }
        return content;
    },
    _getTileVariables: function(tileDef) {
        var variableObj = {};
        var cellInstances = new GlideRecord('x_snc_bva_tool_metric_cell_instance');
        cellInstances.addQuery('tile_definition_instance', tileDef.sys_id.toString());
        cellInstances.query();
        while (cellInstances.next()) {
            variableObj[cellInstances.getValue('identifier_name')] = {
                sys_id: cellInstances.getValue('sys_id'),
                //value: cellInstances.getValue('input_value') || '',
                //value: isNaN(cellInstances.getValue('input_value')) ? cellInstances.getValue('input_value') : parseFloat(cellInstances.getValue('input_value')),
                value: cellInstances.getValue('input_value'),
                answer_unit: cellInstances.answer_unit.toString(),
                rounding: cellInstances.rounding.toString(),
                rounding_attribute: cellInstances.rounding_attribute.toString(),
                rounding_override: cellInstances.rounding_override.toString()
            };
        }
        return variableObj;
    },
    type: 'TileBuilder'
};
