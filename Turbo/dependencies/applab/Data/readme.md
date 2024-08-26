Hello Again,

your probably here after the readme you've read and are planning on having local storage and or have no other choice due to the future deprication of firebase on CDO and don't have another database to broadcast to no need to worry this document will cover most of what you need to do and since most if not all code.org projects are now datablock storage it should be a breeze

To find out what database your project use the following < project link >/export_config
if it has useDatablockStorage as true it's using datablock storage otherwise it's firebase

keep in mind that any data you want imported into your project MUST BE IN THIS FOLDER!

Keyvalues:
Firebase:
if your project is still somehow using firebase instead of datablock storage I'd reccomend you check out https://data-browser.vercel.app/ as it will most likely save you time with extracting any keyvalues you may need (though tbh it's probably going to be a bit tedious)
Datablock:
congrats exporting just got a lot easier for you, we can directly reference get_key_values path and then save the json file to this directory! here's the example path you can call when wishing to export it https://studio.code.org/datablock_storage/< id >/get_key_values save it to this path to use all the current keyvalue data in your project!

NOTE: Keyvalue file must be a .json file format! it will not be used by cdo-host otherwise!

Tables:
Firebase & Datablock:
These tables must be exported manually, however there is a way to automate it but for I'm unsure if it works for firebase specifically for table names for export here's the base path https://studio.code.org/datablock_storage/< id >/export_csv?table_name=< name >
or just navigate to the editors page and run this code
``         Applab.storage.getTableNames().then(names => {
	    (function goto(i) {
	    	location.href = `/datablock_storage/${location.href.match(/[^\/]{43}/)}/export_csv?table_name=${names[i]}`
	    	if(i < names.length-1) {setTimeout(()=>{goto(++i)}, 1e3)}
	    })(0)
        ``
this following script may help gather all the availible tables you need, then you can move them to this directory
})

NOTE: All tables must be a .csv file format! it will not be used by cdo-host otherwise!
