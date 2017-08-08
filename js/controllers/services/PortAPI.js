angular.module("cummins-supervisorio").factory("portsAPI", function ($http, httpService) {
    var address = "http://SERVTI:"

    var loginPort = address+"8041/api/loginValidation";
    var userPort = address+"8043/api/users";
    var groupPort = address+"8042/api/usergroups";
    var thingsPort = address+"8032/api/things";
    var thingLvlsPort = address+"8033/api/thinglevel";
    var thingTypesPort = address+"8046/api/thingtypes";
    var goalsPort = address+"8031/api/goals";
    var sysEndpointsPort = address+"8035/api/systemendpoints";
	var prodEndpointsPort = address + "8035/api/productionendpoints";
    var profilesPort = address+"8036/api/profiles";
    var displaysPort = address+"8037/api/displays";
    var characteristicsPort = address + "8038/api/systemcharacteristics?api=thing";
    var missingPartsPort = address+"8016/api/parts";
    var metricsPort = address+"8045/api/systemmetrics";
    var schedulesPort = address+"8040/api/schedules";
    var groupMailsPort = address+"8013/api/GroupMails";
    var stateMonitorPort = address+"8058/api/StateMonitors";
    var alert = address+"8051/api/Alerts";
    var groupMailsList = address+"8013/api/GroupMails";
    var stateControl = address+"8019/api/States";
    var partPreview = address + "8009/api/partspreview";
    var ipGetter = address + "8002/api/GetIP";
    var thingsChildren = address + "8032/api/ThingsChildren?idParent=";

    var apiCicleTime = address + "8037/api/displays?id="

    //////----Prod
    var tilesDisplayAddresses = address + "8037/api/displays?ip="
    var tilesDisplayCache = address + "8099/api/cache/";
    var tileConfig2 = address + "8023/api";
    var tileConfig = address + "8044/api/dashboard";
	var tileConfigEnableOnly = address + "8044/api/dashboard?showEnabledOnly=true";
	
	//##
    //# *CICERO*
    //##
    var reportsAPI = address + "8008";
    var _getReportsAPI = function (){
      return reportsAPI;  
    };
    //##
    
	

    //////---- Motores
    stageStatus = {
        'stageName': address + "8032/api/things/**",

        'status': address + "8019/api/States?thingid=**",

        'cycleTimeCurrent': address + "8061/api/CycleTime?ThingId=**&Period=current",
        'cycleTimeHour': address + "8061/api/CycleTime?ThingId=**&Period=hour",
        'cycleTimeDay': address + "8061/api/CycleTime?ThingId=**&Period=day",
        'cycleTimeWeek': address + "8061/api/CycleTime?ThingId=**&Period=week",
        'cycleTimeMonth': address + "8061/api/CycleTime?ThingId=**&Period=month",

        'totalHour': address + "8049/api/Production?ThingId=**&cycle=hour&progression=min&fulltime=True&considerSchedule=True&processBreaks=window",
        'totalDay': address + "8049/api/Production?ThingId=**&cycle=day&progression=min&fulltime=False&considerSchedule=True&processBreaks=include",
        'totalWeek': address + "8049/api/Production?ThingId=**&cycle=week&progression=min&fulltime=False&considerSchedule=True&processBreaks=include",
        'totalMonth': address + "8049/api/Production?ThingId=**&cycle=month&progression=min&fulltime=False&considerSchedule=True&processBreaks=include",

        'motor': address + "8048/api/ProdEventsLast?thingId=**&eager=true",

        'parts': address + "8016/api/parts?productSerialNumber=**",

        'esn': address + "8019/api/States?thingid=**"
    }

    var _getThingsChildren = function (id) {
        return $http.get(thingsChildren + id);
    }
    
    var _getStageStatus = function (complement, thingId) {
        var address;
        address = stageStatus[complement].replace("**", thingId);
        console.log(address);
        return $http.get(address);
    };

	////--- HTTPS Login
    var _getCycleTImeAPI = function (complement) {
        return $http.get(apiCicleTime + complement);
    };


    var _setUserCredentials = function (complement) {
        return $http.get(loginPort + "/" + complement);
    }
	
    
    var _getIP = function () {
        return $http.get(ipGetter);
    };

    var _getSchedules = function () {
        return $http.get(schedulesPort);
    };
    
    var _postSchedules = function (data){ 
        return $http.post(schedulesPort, data);
    };
    
     var _putSchedules = function (complement, data) {
        return $http.put(schedulesPort + "/" + complement, data);
    };
    
    var _deleteSchedules= function (complement) {
        return $http.delete(schedulesPort + "/" + complement);
    };
    
    //*thais*

    var _getGroupMails = function () {
        return $http.get(groupMailsPort);
    };

    var _postGroupMails = function (data) {
        return $http.post(groupMailsPort, data);
    };

    var _putGroupMails = function (complement, data) {
        return $http.put(groupMailsPort + "/" + complement, data);
    };

    var _deleteGroupMails = function (complement) {
        return $http.delete(groupMailsPort + "/" + complement);
    };

    ////--- HTTPS Users
    var _getUsers = function () {
        return $http.get(userPort);
    };
    var _getUser = function (user) {
        return $http.get(userPort + "/" + user);
    };
    var _putUsers = function (complement, data){
        return $http.put(userPort + "/" + complement, data);
    };
    var _deleteUsers = function (complement){
        return $http.delete(userPort + "/" + complement);
    };
    var _postUsers = function (data){
        return $http.post(userPort, data);
    };
    
    ////--- HTTPS Group
    var _getGroups = function (){
        return $http.get(groupPort);
    };
    var _putGroups = function (complement, data){
        return $http.put(groupPort+"/"+complement, data);
    };
    var _deleteGroups = function (complement){
        return $http.delete(groupPort+"/"+complement);
    };
    var _postGroups = function (data){
        return $http.post(groupPort, data);
    };
    
    ////--- HTTPS Things
    var _getThings = function (){
        return $http.get(thingsPort);
    };
    var _deleteThings = function (complement){
        return $http.delete(thingsPort+"/"+complement);
    };
    var _putThings = function (complement, data){
        return $http.put(thingsPort+"/"+complement, data);    };
	
	var _postThings = function (data){
        return $http.post(thingsPort, data);
    };
    ////--- HTTPS Lvls
    var _getThingLevels = function (){
        return $http.get(thingLvlsPort);
    };
	
	////--- HTTPS Production Endpoints
    var _getProdEndpoints = function () {
        return $http.get(prodEndpointsPort);
    };
	
    ////--- HTTPS Types
    var _getThingTypes = function () {
        return $http.get(thingTypesPort);
    };
    
    ////--- HTTPS Endpoints
    var _getSysEndpoints = function (){
        return $http.get(sysEndpointsPort);
    };
    
    ////--- HTTPS Characterisitcs
    var _getCharacteristics = function (){
        return $http.get(characteristicsPort);
    };
    
    ////--- HTTPS Parts
    var _getParts = function (){
        return $http.get(missingPartsPort);
    };
    
    var _putParts = function (complement, data){
        return $http.put(missingPartsPort+"/"+complement, data); 
    };
    
    
    ////--- HTTPS Parts
    var _getMetrics = function (){
        return $http.get(metricsPort);
    };
	
	
	 ////--- HTTPS PartPreview
    var _getPartPreview = function () {
        return $http.get(partPreview);
    };
    var _putPartPreview = function (complement, data) {
        return $http.put(partPreview + "/" + complement, data);
    };
    var _deletePartPreview = function (complement) {
        return $http.delete(partPreview + "/" + complement);
    };
    var _postPartPreview = function (data) {
        return $http.post(partPreview, data);
    };
    
     //*CICERO*
    var _getGoals = function () {
        return $http.get(goalsPort);
    };
     var _postGoals = function (data){
        return $http.post(goalsPort, data);
    };
    var _putGoals = function (complement, data) {
        return $http.put(goalsPort + "/" + complement, data);
    };
    var _deleteGoals = function (complement) {
        return $http.delete(goalsPort + "/" + complement);
    };

    ////--- HTTPS State Monitor
    var _getStateMonitors = function () {
        return $http.get(stateMonitorPort);
    };
    var _postStateMonitors = function (data) {
        return $http.post(stateMonitorPort, data);
    };
    var _putStateMonitors = function (complement, data) {
        return $http.put(stateMonitorPort + "/" + complement, data);
    };
    var _deleteStateMonitors = function (complement) {
        return $http.delete(stateMonitorPort + "/" + complement);
    };
    
    ////--- HTTPS Displays
    var _getDisplays = function (){
        return $http.get(displaysPort);
    };
    var _deleteDisplays = function (complement){
        return $http.delete(displaysPort+"/"+complement);
    };
    var _putDisplays = function (complement, data){
        return $http.put(displaysPort+"/"+complement, data);    };
	
	var _postDisplays = function (data){
        return $http.post(displaysPort, data);
	};
	
	////--- HTTPS Profiles
    var _getProfiles = function (){
        return $http.get(profilesPort);
    };
    var _putProfiles = function (complement, data){
        return $http.put(profilesPort+"/"+complement, data);
    };
    var _deleteProfiles = function (complement){
        return $http.delete(profilesPort+"/"+complement);
    };
    var _postProfiles = function (data){
        return $http.post(profilesPort, data);
    };
       
	
    ////--- HTTPS TileLayoutConfig
    var _getTileLayoutConfig = function (){
        return $http.get(tileConfig);
    };
    var _putTileLayoutConfig = function (complement, data){
        return $http.put(tileConfig+"/"+complement, data);
    };
    var _deleteTileLayoutConfig = function (complement) {
               $http.delete(tilesDisplayCache + complement);
        return $http.delete(tileConfig+"/"+complement);
    };
    var _postTileLayoutConfig = function (data){
        return $http.post(tileConfig, data);
    };
    
    ////--- HTTPS TileLayoutDisplay
    var _getTileLayoutDisplay = function (complement){
        return httpService.get(tilesDisplayCache + complement);
    };
    var _getTileLayoutAddresses = function (complement) {
        return httpService.get(tilesDisplayAddresses + complement);
    };


    ////--- HTTPS TileLayoutConfig
    var _getTileLayoutConfig2 = function () {
        return $http.get(tileConfig2);
    };
    var _putTileLayoutConfig2 = function (data) {
        return $http.put(tileConfig2, data);
    };
    var _deleteTileLayoutConfig2 = function (complement) {
        return $http.delete(tileConfig2 + "/" + complement);
    };
    var _postTileLayoutConfig2 = function (data) {
        return $http.post(tileConfig2, data);
    };

	////--- HTTPS TileLayouConfig Only Enabled
    var _getTileLayoutConfigOnlyEnabledById = function (complement) {
        return $http.get(tileConfigEnableOnly + "/" + complement);
    };
    var _getTileLayoutConfigOnlyEnabled = function () {
        return $http.get(tileConfigEnableOnly);
    };
	
    ////--- HTTPS TileLayoutConfig
    var _getTileLayoutConfigById = function (complement) {
        return $http.get(tileConfig + "/" + complement);
    };
    var _getTileLayoutConfig = function () {
        return $http.get(tileConfig);
    };
    var _putTileLayoutConfig = function (complement, data) {
        return $http.put(tileConfig + "/" + complement, data);
    };
    var _deleteTileLayoutConfig = function (complement) {
        return $http.delete(tileConfig + "/" + complement);
    };
    var _postTileLayoutConfig = function (data) {
        return $http.post(tileConfig, data);
    };
	
    //JSON Timer Config
    var _getJsonTimers = function (data) {
        return $http.get('../js/configs/timers.json');            
    };

    var _getAddress = function () {
        return address;
    };

    return {
        getAddress: _getAddress,

        ////---- Stage FunKytion
        getStageStatus: _getStageStatus,

		////---- Login FunKytion
        setUserCredentials: _setUserCredentials,

        ////---- IP FunKytion
        getIP: _getIP,
		
        ////---- TileLayoutDisplay FunKytion
        getTileLayoutDisplay: _getTileLayoutDisplay,
        getTileLayoutAddresses: _getTileLayoutAddresses,

		////--- TileLayoutConfigOnlyEnabled FunKytions
        getTileLayoutConfigOnlyEnabledById : _getTileLayoutConfigOnlyEnabledById,
        getTileLayoutConfigOnlyEnabled : _getTileLayoutConfigOnlyEnabled,
		
        ////---- TileLayoutConfig2 FunKytions
        getTileLayoutConfig2: _getTileLayoutConfig2,
        postTileLayoutConfig2: _postTileLayoutConfig2,
        putTileLayoutConfig2: _putTileLayoutConfig2,
        deleteTileLayoutConfig2: _deleteTileLayoutConfig2,

        ////---- TileLayoutConfig FunKytions
        getTileLayoutConfigById: _getTileLayoutConfigById,
        getTileLayoutConfig: _getTileLayoutConfig,
        postTileLayoutConfig: _postTileLayoutConfig,
        putTileLayoutConfig: _putTileLayoutConfig,
        deleteTileLayoutConfig: _deleteTileLayoutConfig,
		
		////---- Schedules FunKytions
        getSchedules: _getSchedules,
        postSchedules: _postSchedules,
        putSchedules: _putSchedules,
        deleteSchedules: _deleteSchedules,
        
        ////---- Goals FunKytions
        getGoals: _getGoals,
        postGoals: _postGoals,
        putGoals: _putGoals,
        deleteGoals: _deleteGoals,

        ////--- HTTPS State Monitor
        getStateMonitors : _getStateMonitors,
        postStateMonitors : _postStateMonitors, 
        putStateMonitors : _putStateMonitors,
        deleteStateMonitors : _deleteStateMonitors,
        
        ////---- GroupMailsList FunKytions
        getGroupMails: _getGroupMails,
        postGroupMails: _postGroupMails,
        putGroupMails: _putGroupMails,
        deleteGroupMails: _deleteGroupMails,

        ////--- Users FunKytions
        getUser: _getUser,
        getUsers: _getUsers,
        putUsers: _putUsers,
        postUsers: _postUsers,
        deleteUsers: _deleteUsers,
        
        ////--- Groups FunKytions
        getGroups: _getGroups,
        putGroups: _putGroups,
        postGroups: _postGroups,
        deleteGroups: _deleteGroups,
        
        ////--- Thing Lvl FunKytions
        getThingLevels: _getThingLevels,

        ////--- Thing Types FunKytions
        getThingTypes : _getThingTypes,
        
        ////--- Things FunKytions
        getThings: _getThings,
        deleteThings: _deleteThings,
        putThings: _putThings,
        postThings: _postThings,
        
        ////--- Endpoints FunKytions
        getSysEndpoints: _getSysEndpoints,
        getProdEndpoints: _getProdEndpoints,
		
        ////--- Characteristics FunKytions
        getCharacteristics: _getCharacteristics,
        
        ////--- Characteristics FunKytions
        getMetrics: _getMetrics,
    
        ////--- Displays FunKytions
        getDisplays: _getDisplays,
        deleteDisplays: _deleteDisplays,
        putDisplays: _putDisplays,
        postDisplays: _postDisplays,
		
		////--- Profiles FunKytions
        getProfiles: _getProfiles,
        deleteProfiles: _deleteProfiles,
        putProfiles: _putProfiles,
        postProfiles: _postProfiles,
        
        ////--- Parts FunKytions
        getParts: _getParts,
        putParts: _putParts,
		
		 ////--- Parts Preview FunKytions
        getPartPreview: _getPartPreview,
        putPartPreview: _putPartPreview,
        postPartPreview: _postPartPreview,
        deletePartPreview: _deletePartPreview,

        ///---- Json Timer Config FunKytions
        getJsonTimers: _getJsonTimers
		
		//*CICERO*
        , getReportsAPI: _getReportsAPI,

        getThingsChildren: _getThingsChildren
    };
});