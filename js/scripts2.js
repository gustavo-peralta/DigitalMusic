// JavaScript Document
var root = null; 
	var currentDir = null; 
	var parentDir = null; 
	
	var activeItem = null; 
	var activeItemType = null; 
	var clipboardItem = null; 
	var clipboardAction = null; 
	
	var pathIni = "file:///storage";
	//var pasos = 0;

var app = {
	// Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
		console.log("msg: Dispositivo listo");
        getFileSystem(pathIni);
    }
};


/* get the root file system */
function getFileSystem(pathIni){
	$("#btnPlay").hide();
	//window.resolveLocalFileSystemURI(pathIni, onResolveSuccess, fail);
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onResolveSuccess, fail);
}

function onResolveSuccess(fileSystem){
	console.log("msg Acceso al directorio correcto");
	root = fileSystem;
	console.log("msg Asignado el root");
	listDir(root);
	//clickItemAction();
}

function fail(evt){
	console.log("msg File System Error: " + evt.target.error.code);
}

/* show the content of a directory */
function listDir(directoryEntry){
	//pasos++;
	console.log("msg ya leido dir " + pasos + " veces");
	currentDir = directoryEntry; // set current directory
	
	// Obtain the parent of this directory
	directoryEntry.getParent(function(par){ // success get parent
		parentDir = par; // set parent directory
	}, function(error){ // error get parent
		console.log('msg Get parent error: '+error.code);
	});
	
	var directoryReader = directoryEntry.createReader();
	
	directoryReader.readEntries(function(entries){
		var dirContent = $('#dirContent');
		dirContent.empty();
		
		var dirArr = new Array();
				
		for(var i=0; i<entries.length; ++i){ // sort entries
			var entry = entries[i];
			if( entry.isDirectory && entry.name[0] != '.' ) dirArr.push(entry);
		}
		
		var uiBlock = ['a','b','c','d'];
		var subfolder = false;		
		
		for(var i=0; i<dirArr.length; ++i){ // show directories
			var entry = dirArr[i];
			var blockLetter = uiBlock[i%4]; // TODO
			
			if( entry.isDirectory ){
				dirContent.append('<div class="ui-block-'+blockLetter+'"><div class="folder"><p>'+entry.name+'</p></div></div>');
				subfolder = true;
			}
		}
		
		clickItemAction(directoryEntry);
		
	}, function(error){
		console.log('listDir readEntries error: '+error.code);
	});
}

/* click actions */
function clickItemAction(directoryEntry){
	var folders = $('.folder');
	
	$('.folder').bind('click', function(){
		var name = $(this).text();
		getActiveItem(name, 'd');
	});
}

/* get active item  */
function getActiveItem(name, type){
	if( type == 'd' && currentDir != null ){
		currentDir.getDirectory(name, {create:false},
			function(dir){ // success find directory
				activeItem = dir;
				activeItemType = type;
				openItem(activeItemType);
			}, 
			function(error){ // error find directory
				console.log('msg Unable to find directory: '+error.code);
			}
		);	
	}
}

/* open item */
function openItem(type){
	if( type == 'd' ){
		listDir(activeItem);
	}
}
