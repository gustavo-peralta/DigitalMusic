	var root = null; 
	var currentDir = null; 
	var parentDir = null; 
	
	var activeItem = null; 
	var activeItemType = null; 
	var clipboardItem = null; 
	var clipboardAction = null; 
	
	var pathIni = "file:///storage";

var app = {
	// Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        getFileSystem(pathIni);
    }
};


/* get the root file system */
function getFileSystem(pathIni){
	$("#btnPlay").hide();
	window.resolveLocalFileSystemURI(pathIni, onResolveSuccess, fail);
}

function onResolveSuccess(fileSystem){
	root = fileSystem;
	listDir(root);
	//clickItemAction();
}

function fail(){
	console.log("File System Error: "+evt.target.error.code);
}






function leerPadreDirectorio(padre){
	console.log('msg El padre es: '+padre.name);
}

function falloLeerPadre(error){
	console.log('msg Get parent error: '+error.code);	
}


/* show the content of a directory */
function listDir(directoryEntry){
	console.log("msg Llamada a funcion listDir");
	
	if( !directoryEntry.isDirectory ) console.log('msg listDir incorrect type');
	$.mobile.showPageLoadingMsg(); // show loading message
	//$.mobile.loading( "show" ); // show loading message
	
	currentDir = directoryEntry; // set current directory
	
	// Obtain the parent of this directory
	directoryEntry.getParent(function(par){ // success get parent
		parentDir = par; // set parent directory
		if( (parentDir.name == 'sdcard' && currentDir.name != 'sdcard') || parentDir.name != 'sdcard' ) $('#backBtn').show();
		console.log("El padre es: " + parentDir.name);
	}, function(error){ // error get parent
		console.log('msg Get parent error: '+error.code);
	});
	
	var directoryReader = directoryEntry.createReader();
	
	directoryReader.readEntries(function(entries){
		var dirContent = $('#dirContent');
		dirContent.empty();
		
		var dirArr = new Array();
		var fileArr = new Array();
		
		for(var i=0; i<entries.length; ++i){ // sort entries
			var entry = entries[i];
			if( entry.isDirectory && entry.name[0] != '.' ) dirArr.push(entry);
			else if( entry.isFile && entry.name[0] != '.' ) fileArr.push(entry);
		}
		
		var sortedArr = dirArr.concat(fileArr); // sorted entries
		var uiBlock = ['a','b','c','d'];
		var subfolder = false;		
		
		for(var i=0; i<sortedArr.length; ++i){ // show directories
			var entry = sortedArr[i];
			var blockLetter = uiBlock[i%4]; // TODO
			
			if( entry.isDirectory ){
				dirContent.append('<div class="ui-block-'+blockLetter+'"><div class="folder"><p>'+entry.name+'</p></div></div>');
				subfolder = true;
				console.log("msg asignando true");
			} else if( entry.isFile )
				dirContent.append('<div class="ui-block-'+blockLetter+'"><div class="file"><p>'+entry.name+'</p></div></div>');
		}
	
		$.mobile.hidePageLoadingMsg(); // hide loading message
		//$.mobile.loading( "hide" ); // hide loading message	
		
		// Si en la carpeta actual no hay mas carpetas muestro el boton de play
		if(!subfolder)
			$("#btnPlay").show();
		else
			$("#btnPlay").hide();
		
		clickItemAction(directoryEntry);
		
	}, function(error){
		console.log('listDir readEntries error: '+error.code);
	});
}

/* read from file */
function readFile(fileEntry){
	//TODO
	// Abrir el fichero para su reproduccion
	
	
	if( !fileEntry.isFile ) console.log('msg readFile incorrect type');
	$.mobile.showPageLoadingMsg(); // show loading message
	
	fileEntry.file(function(file){
		var reader = new FileReader();
		reader.onloadend = function(evt) {
            console.log("msg Read as data URL");
            console.log(evt.target.result); // show data from file into console
        };
        reader.readAsDataURL(file);
        
        $.mobile.hidePageLoadingMsg(); // hide loading message
        
        // dialog with file details
        $('#file_details').html('<p><strong>Name:</strong> '+file.name+
        						'</p><p><strong>Type:</strong> '+file.type+
        						'</p><p><strong>Last Modified:</strong> '+new Date(file.lastModifiedDate)+
        						'</p><p><strong>Size:</strong> '+file.size);
        $('#get_file_details').trigger('click');
	}, function(error){
		console.log(evt.target.error.code);
	});
}

/* open item */
function openItem(type){
	console.log("msg Dentro funcion openItem");
	if( type == 'd' ){
		console.log("msg Abriendo el directorio");
		listDir(activeItem);
		console.log("msg Onteniendo nuevo root");
		//getFileSystem(pathIni);
	} else if(type == 'f'){
		readFile(activeItem);
	}
}


function success(dir,type) {
	pathIni += dir.name;
    activeItem = dir;
	activeItemType = type;
	console.log("msg el type es: " + activeItemType);
}

function fail(error) {
    alert("msg Unable to create new directory: " + error.code);
}

/* get active item  */
function getActiveItem(name, type){
	console.log("msg  El directorio actual es: " + name + " currentDir: " + currentDir);
	
	if( type == 'd' && currentDir != null ){
		console.log("msg dentro del if");
		console.log("msg el directorio a abrir es: " + name);
		
		currentDir.getDirectory(name, {create: false, exclusive: false}, success(this,type), fail);
		/*
		currentDir.getDirectory(name, {create:false},
			function(dir){ // success find directory
				activeItem = dir;
				activeItemType = type;
				console.log("msg el type es: " + activeItemType);
			}, 
			function(error){ // error find directory
				console.log('msg Unable to find directory: '+error.code);
			}
		);
		*/
	} else if(type == 'f' && currentDir != null){
		console.log("msg dentro del else");
		currentDir.getFile(name, {create:false},
			function(file){ // success find file
				activeItem = file;
				activeItemType = type;
			},
			function(error){ // error find file
				console.log('msg Unable to find file: '+error.code);
			}
		);
	}
}

/* get clipboard item for copy or move */
function getClipboardItem(action){
	if( activeItem != null) {
		clipboardItem = activeItem;
		clipboardAction = action;
	}
}

/* click actions */
function clickItemAction(directoryEntry){
	//	console.log("dentro de clickItemAction");
	var folders = $('.folder');
	var files = $('.file');
	var backBtn = $('#backBtn');
	var homeBtn = $('#homeBtn');
	/* menu buttons */
	var menuDialog = $('#menuOptions');
	var openBtn = $('#openBtn');
	
	$('.folder').bind('click', function(){
		var name = $(this).text();
		getActiveItem(name, 'd');
		$('#menu').trigger('click'); // menu dialog box
		//openItem(activeItemType);
	});
	
	files.bind('click', function(){
		var name = $(this).text();
		getActiveItem(name, 'f');
		$('#menu').trigger('click'); // menu dialog box
		// paste button always disabled for files
		pasteBtn.button('disable');
		pasteBtn.button('refresh');
	});
	
	backBtn.click(function(){ // go one level up
		if( parentDir != null ) listDir(parentDir);
	});
	
	homeBtn.click(function(){ // go to root
		if( root != null ) listDir(root);
	});
	
	openBtn.click(function(){
		openItem(activeItemType);
		menuDialog.dialog('close');
	});
}
