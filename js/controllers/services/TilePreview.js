'use strict';
angular.module("cummins-supervisorio").factory("TilePreview", function (portsAPI) {
    
    var service = {};
    
    service.subSize = function (_tileType, _index) {
        switch(_tileType) {
            case "hhalf":
                return '12 tile-structure-hhalf';
            
            case "vhalf":
                return '6 tile-structure-vhalf';
                
            case "lvhalfandfifth":
                if(_index === 0){
                    return '6 tile-structure-vhalf  pull-left';
                } else {
                    return '3 tile-structure-vhalf-fifths';
                }
            
            case "rvhalfandfifth":
                if(_index === 0){
                    return '6 tile-structure-vhalf pull-right';
                } else {
                    return '3 tile-structure-vhalf-fifths';
                }
            
            
            
            case "lthird":
                if(_index === 0){
                    return '6 tile-structure-vhalf pull-left';
                } else {
                    return '6 tile-structure-hhalf-third pull-right';
                }
                
                
            case "rthird":
                if(_index === 1){
                    return '6 tile-structure-vhalf pull-right';
                } else {
                    return '6 tile-structure-hhalf-third pull-left';
                }  
                
            case "upperthird":
                if(_index === 0){
                    return '12 tile-type-hhalf';
                } else {
                    return '6 tile-type-hhalf';
                }
            
            case "upperthird":
                if(_index === 0){
                    return '12 tile-type-hhalf';
                } else {
                    return '6 tile-type-hhalf';
                }
            
            case "lowerthird":
                if(_index === 2){
                    return '12 tile-type-hhalf';
                } else {
                    return '6 tile-type-hhalf';
                }
            
            case "quarter tile-type-full":
                return '6 tile-type-full';
            
            case "sixteenth tile-type-full":
                return '3 tile-type-full';
            
            case "sixtyfourth tile-type-full":
                return '1ponto5 col-lg-1 tile-type-full';
            
            default:
                console.log('Algo deu errado');
        }
    };
    
    
    service.PreviewConfig = function (_config) {
        selectValueChange();
        var parsed = angular.copy(_config);
        var layoutColumns = {
            "name": parsed.name,
            "standardSize": parsed.standardSize,
            "show_tiles":[]
        };
        
        
        //// --- Proccess each Tile
        for (var i = 0; i < parsed.tiles.length; i++) {
            var _value;
            
            var _subTiles = new Array(0);
            var _tile = parsed.tiles[i];
            var _color
            ///Determines Color of Tile
             if (_tile.fixedColor === undefined || _tile.fixedColor === null){
                if (_tile.color === undefined || _tile.color === null){
                    _color = 'no-color';
                }else{
                    _color = _tile.color;
                }
            }else{
                _color = _tile.fixedColor;
            }
            
            ///Determines Value of Tile
            var _type = _tile.tileType;
            if (_tile.fixedValue === undefined || _tile.fixedValue === '' || _tile.fixedValue === null) {
                if (_tile.metricKey === undefined || _tile.metricKey === '' || _tile.metricKey === null) {
                    if (_tile.dataSourceUrl === undefined || _tile.dataSourceUrl === '' || _tile.dataSourceUrl === null) {
                        _value = '';
                        for (var j = 0; j < _tile.subtiles.length; j++) {
                            var _subTile = _tile.subtiles[j];
                            var _subValue;
                            ///Determines Color of SubTile
                            if (_subTile.fixedColor === undefined || _subTile.fixedColor === null){
                                if (_subTile.color === undefined || _subTile.color === null || _subTile.color === ""){
                                    _color = 'no-color';
                                }else{
                                    _color = _subTile.color;
                                }
                                        }else{
                                _color = _subTile.fixedColor;
                            }
                            ///Determines Value of SubTile
                            if (_subTile.fixedValue == '' || _subTile.fixedValue ==  undefined || _subTile.fixedValue == null) {
                                if (_subTile.metricKey == '' || _subTile.metricKey ==  undefined || _subTile.metricKey == null) {
                                    if (_subTile.dataSourceUrl == '' || _subTile.dataSourceUrl ==  undefined || _subTile.dataSourceUrl == null) {
                                        _subValue = '';
                                    }else{
                                        _subValue = _subTile.dataSourceUrl;
                                    }
                                }else{
                                    _subValue = _subTile.metricKey;
                                }
                            } else{
                                _subValue = _subTile.fixedValue;
                            }
                            
                            _subTile = {
                                "subtileId": _subTile.subtileId,
                                "value": _subValue,
                                "color": _color,
                                "tileTitle": _subTile.tileTitle,
                                "rail": _subTile.rail,
                                "detailsLink": "future link"
                            };
                            _subTiles.push(_subTile);
                        };
                    }else{
                        _value = _tile.dataSourceUrl;
                    }
                }else{
                    _value = _tile.metricKey;
                }
            }else{
                _value = _tile.fixedValue;
            }
            layoutColumns.show_tiles.push({
                "tileId": _tile.tileId,
                "tileSize": _tile.tileSize,
                "tileType": _type,
                "value": _value,
                "tileTitle": _tile.tileTitle,
                "color": _color,
                "rail": _tile.rail,
                "detailsLink": "future link",
                "subtiles": _subTiles
            });
        };
        return layoutColumns; 
    };
    return service;
});