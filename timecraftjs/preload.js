var kernel_paths = ["var timecraftjs;","//Load the required javascript files","timecraftjs = {"is_ready":false};","","//set up spice different ways depending on if in a browser or not","if(typeof window == "undefined"){","	//If in node","    timecraft = require("timecraftjs/spice.js");","	var cspice = require("timecraftjs/cspice.js");","	var fs = require("fs");","    timecraft.SPICE.setup(cspice,fs);","	for(var i = 0;i < kernel_paths.length;i++){","        timecraft.SPICE.node_furnish(kernel_paths[i]);","	}","    timecraft = timecraft.SPICE;","    timecraft.is_ready = true;","} else {","	//If in a browse","","","","	//sp = {"SPICE":SPICE};","	//SPICE.furnish("./kernels/lsk/naif0012.tls")","	var Module = {","","","		// The functions to run after loading","		postRun: [function(){","			SPICE.setup(Module,FS);","			/*","				Read files into the program from the virtual file system","				SPICE.furnish(['kernels/pck/pck00010.tpc','kernels/lsk/naif0010.tls','kernels/spk/planets/de432s.bsp']) would also have worked.","			*/","			if(typeof preload_file_data == "undefined"){","				SPICE.furnish_via_xhr_request(kernel_paths,","				function(){","				},","				function(){","                    timecraft = SPICE;","                    timecraft.is_ready = true;","					var evnt = new CustomEvent("timecraftready");","					window.dispatchEvent(evnt);","				});","			} else {","				for(var i = 0;i < preload_file_data.length;i++){","					var full_path = preload_file_data[i].path;","					SPICE.furnish_via_preload_file_data(full_path,preload_file_data[i].buffer)","				}","                timecraft = SPICE;","                timecraft.is_ready = true;","				preload_file_data = null;","				var evnt = new CustomEvent("timecraftready");","				window.dispatchEvent(evnt);","			}","		}","		],","		// Capture stdout","		print: function() {","			text = Array.prototype.slice.call(arguments).join(' ');","			if(timecraft.is_ready){","				if(timecraft.report_then_reset && timecraft.failed() == 1){","					var errstr = timecraft.getmsg("LONG");","					//console.log(text);","                    timecraft.reset();","					console.error(errstr);","				} else {","					console.log(text);","				}","			}","		},","		// Capture stderr","		printErr: function() {","			text = Array.prototype.slice.call(arguments).join(' ');","			if(text.slice(0,8) === 'pre-main') return;","			console.error(text);","		},","","","","","	};","}","","if(typeof window == "undefined") module.exports = timecraft;",];
var cspice = require("./cspice.js");
var fs = require("fs");
var em_fs = cspice.get_fs();
var output = [];
for(var i = 0; i < kernel_paths.length;i++){
	//Create the necessary path in order to save the file
	var splitPath = ("node_modules/timecraftjs/" + kernel_paths[i]).split("/");
	var pathStr = ""
	for(var ii = 0;ii < splitPath.length-1;ii++){
		pathStr += splitPath[ii];
		//There does not appear to be a simple way in this.FS to check if a directory exists or is duplicated, so just try and recover if an error occurs (the directory already exists)
		try{
			em_fs.mkdir(pathStr);
		} catch(e){
			//nope
		}
	}
	var fileStr = splitPath[splitPath.length-1];
	var buffer = new Uint8Array(fs.readFileSync(kernel_paths[i]));
	em_fs.createDataFile(pathStr,fileStr,buffer,true,true);
	var save_buff = em_fs.readFile(pathStr + "/" + fileStr);
	var write_buff = Object.keys(save_buff).map(function (key) { return save_buff[key]; });
	output[i] = {"path":pathStr + "/" + fileStr,"buffer": write_buff};
	//fs.writeFile("./test_file_out.txt",JSON.stringify(em_fs.readFile(pathStr + "/" + fileStr)));
}
//var buff1 = em_fs.readFile("node_modules/timecraftjs/kernels/lsk/naif0012.tls");
//var obj_tmp = {"path":"node_modules/timecraftjs/kernels/lsk/naif0012.tls","buff":buff1};
fs.writeFile("./preload_file_data.js","var preload_file_data = " + JSON.stringify(output) + ";");
