Hello Again,

your probably here after the readme you've read and are planning on having local storage and or have no other choice due to the future deprication of firebase on CDO and don't have another database to broadcast to no need to worry this document will cover most of what you need to do though you'll most likely be better off waiting until the migration is fully complete to datablock storage the API will still work even with a firebase API key and you won't have to worry about running my host module either

To find out what database your project use the following < project link >/export_config
if it has useDatablockStorage as true it's using datablock storage otherwise it's firebase

keep in mind that any data you want imported into your project MUST BE IN THIS FOLDER!

Keyvalues:
Firebase:
if your project is still somehow using firebase instead of datablock storage I'd reccomend you check out https://data-browser.vercel.app/ as it will most likely save you time with extracting any keyvalues you may need (though tbh it's probably going to be a bit tedious)
Datablock:
congrats exporting just got a lot easier for you, we can directly reference get_key_values path and then save the json file to this directory! here's the example path you can call when wishing to export it https://studio.code.org/datablock_storage/< id >/get_key_values save it to this path to use all the current keyvalue data in your project!

NOTE: Keyvalue file must be a .json file format! it will not be used by cdo-host otherwise!

Tables: NOT SUPPORTED BY THE GAMELAB API!
